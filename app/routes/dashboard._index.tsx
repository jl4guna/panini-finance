import Dinero from "dinero.js";
import type { LoaderArgs } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import { getUserBalance } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);

  return await getUserBalance(userId);
}

export default function Dashboard() {
  const { balance, status } = useLoaderData<typeof loader>();

  return (
    <div>
      <section
        aria-labelledby="summary-heading"
        className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Hola Elisa, {status.text}:
        </h1>

        <div className="mt-3">
          <p
            className={"text-3xl tracking-tight text-gray-900 " + status.color}
          >
            {Dinero({ amount: balance }).toFormat("$0,0.00").replace("-", "")}
          </p>
        </div>
        {/* <h2
          id="summary-heading"
          className="text-center text-lg font-medium text-gray-900"
        >
          Your Balance
        </h2>

        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">Everyone should pay</dt>
            <dd className="text-sm font-medium text-gray-900">
              {Dinero({ amount: totalPerUser }).toFormat("$0,0.00")}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">You payed for</dt>
            <dd className="text-sm font-medium text-gray-900">
              {Dinero({ amount: transactions }).toFormat("$0,0.00")}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">You sent</dt>
            <dd className="text-sm font-medium text-gray-900">
              {Dinero({ amount: paymentsBalance }).toFormat("$0,0.00")}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-base font-medium text-gray-900">Balance</dt>
            <dd className="text-base font-medium text-gray-900">
              {Dinero({ amount: userBalance }).toFormat("$0,0.00")}
            </dd>
          </div>
        </dl> */}
      </section>
    </div>
  );
}
