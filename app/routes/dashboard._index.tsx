import Dinero from "dinero.js";
import type { LoaderArgs } from "@remix-run/node";
import { requireUser } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import { getUserBalance } from "~/utils";
import { getPaniniTotalSpentByCategory } from "~/models/dashboard/Transaction.server";
import { getCategoryListItems } from "~/models/dashboard/Category.server";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  const { balance, paniniBalance, status, paniniStatus } = await getUserBalance(
    user.id
  );

  const categories = await getCategoryListItems();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const endDate = new Date();
  const spentByCategory = await getPaniniTotalSpentByCategory(
    startDate,
    endDate
  );

  return {
    balance,
    paniniBalance,
    user,
    status,
    paniniStatus,
    spentByCategory,
    categories,
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
  } = useLoaderData<typeof loader>();

  return (
    <div>
      <section
        aria-labelledby="summary-heading"
        className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Hola {user.name}, {status.text}:
        </h1>

        <div className="mt-3">
          <p
            className={"text-3xl tracking-tight text-gray-900 " + status.color}
          >
            {Dinero({ amount: balance }).toFormat("$0,0.00").replace("-", "")}
          </p>
        </div>
      </section>
      <section
        aria-labelledby="summary-heading"
        className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Panini House, {paniniStatus.text}:
        </h1>

        <div className="mt-3">
          <p
            className={
              "text-3xl tracking-tight text-gray-900 " + paniniStatus.color
            }
          >
            {Dinero({ amount: paniniBalance })
              .toFormat("$0,0.00")
              .replace("-", "")}
          </p>
        </div>
        <h2
          id="summary-heading"
          className="text-center text-lg font-medium text-gray-900"
        >
          Gastos por categoría este mes
        </h2>

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
      </section>
    </div>
  );
}
