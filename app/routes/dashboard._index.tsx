import Dinero from "dinero.js";
import { requireUser } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import { formatDate, getUserBalance, isValidDate } from "~/utils";
import { getTotalSpentByCategory } from "~/models/dashboard/Transaction.server";
import { getCategoryListItems } from "~/models/dashboard/Category.server";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UpcomingEvents from "~/components/UpcomingEvents";
import type { Reminder } from "~/models/dashboard/Reminder.server";
import { getUpcomingReminders } from "~/models/dashboard/Reminder.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const searchParams = new URL(request.url).searchParams as any;
  const { start, end } = Object.fromEntries(searchParams.entries());

  const { balance, paniniBalance, status, paniniStatus } = await getUserBalance(
    user.id,
  );

  const categories = await getCategoryListItems();
  const startDate = start ? new Date(start) : new Date();
  if (!start) {
    //Get the first day of the month
    startDate.setDate(0);
  }
  const endDate = end ? new Date(end) : new Date();
  const spentByCategory = await getTotalSpentByCategory(startDate, endDate);

  const reminders = await getUpcomingReminders();

  return {
    balance,
    paniniBalance,
    user,
    status,
    paniniStatus,
    spentByCategory,
    categories,
    range: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
    reminders,
  };
}

export default function Dashboard() {
  const {
    balance,
    status,
    user,
    paniniBalance,
    paniniStatus,
    spentByCategory,
    categories,
    range,
    reminders,
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(range.startDate);
  const [endDate, setEndDate] = useState(range.endDate);

  useEffect(() => {
    if (isValidDate(startDate) && isValidDate(endDate)) {
      navigate(`/dashboard?start=${startDate}&end=${endDate}`);
    }
  }, [startDate, endDate, navigate]);

  const totalSpent = spentByCategory.reduce(
    (acc, spent) => acc + (spent._sum?.amount ?? 0),
    0,
  );

  return (
    <div>
      <section
        aria-labelledby="summary-heading"
        className="rounded-lg lg:col-span-5"
      >
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Hola {user.name}, {status.text}:{" "}
          <span
            className={
              "text-3xl tracking-tight text-gray-900 font-normal " +
              status.color
            }
          >
            {Dinero({ amount: balance }).toFormat("$0,0.00").replace("-", "")}{" "}
            MXN
          </span>
        </h2>
        <h2 className="text-3xl mt-4 font-bold tracking-tight text-gray-900">
          Panini House, {paniniStatus.text}:{" "}
          <span
            className={
              "text-3xl tracking-tight text-gray-900 font-normal " +
              paniniStatus.color
            }
          >
            {Dinero({ amount: paniniBalance })
              .toFormat("$0,0.00")
              .replace("-", "")}{" "}
            MXN
          </span>
        </h2>
      </section>
      <UpcomingEvents events={reminders as unknown as Reminder[]} />
      <section
        aria-labelledby="summary-heading"
        className="mt-8 rounded-lg lg:col-span-5 "
      >
        <h2
          id="summary-heading"
          className="text-center mt-6 text-lg font-medium text-gray-900"
        >
          Gastos por categoría
        </h2>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-4 sm:mt-10 sm:grid flex justify-between gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="date"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Desde
              </label>
              <div className="relative mt-2">
                <input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={startDate}
                  className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required={true}
                  onChange={(e) => {
                    const date = e.target.value;
                    if (isValidDate(date)) {
                      setStartDate(formatDate(date));
                    }
                  }}
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="date"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Hasta
              </label>
              <div className="relative mt-2">
                <input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={endDate}
                  className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required={true}
                  onChange={(e) => {
                    const date = e.target.value;
                    if (isValidDate(date)) {
                      setEndDate(formatDate(new Date(date)));
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {categories.map((category) => {
          const total =
            spentByCategory.find((spent) => spent.categoryId === category.id)
              ?._sum.amount || 0;
          return (
            <dl key={category.id} className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">{category.name}</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {Dinero({ amount: total }).toFormat("$0,0.00")}
                </dd>
              </div>
            </dl>
          );
        })}
        <dl className="mt-8 space-y-4 border-t-2">
          <div className="flex items-center justify-between mt-2">
            <dt className="text-sm font-bold text-gray-900">Total</dt>
            <dd className="text-sm font-bold text-gray-900">
              {Dinero({ amount: totalSpent }).toFormat("$0,0.00")}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
