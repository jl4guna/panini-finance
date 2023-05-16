import Dinero from "dinero.js";
import type { LoaderArgs } from "@remix-run/node";
import {
  getTotalSpent,
  getUserTransactionBalance,
} from "~/models/dashboard/Transaction.server";
import { requireUserId } from "~/session.server";
import { getUserPaymentBalance } from "~/models/dashboard/Payment.server";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);

  const transactions = await getUserTransactionBalance(userId);
  const payments = await getUserPaymentBalance(userId);
  const totalSpent = await getTotalSpent();

  const totalPerUser = Dinero({
    amount: totalSpent,
  }).divide(2);

  const paymentsBalance = Dinero({ amount: payments.sent }).subtract(
    Dinero({ amount: payments.received })
  );

  const userBalance = Dinero({ amount: transactions })
    .add(paymentsBalance)
    .subtract(totalPerUser);

  console.log({
    totalPerUser: totalPerUser.getAmount(),
    transactions,
    paymentsBalance: paymentsBalance.getAmount(),
    userBalance: userBalance.getAmount(),
  });

  return {
    totalPerUser: totalPerUser.getAmount(),
    transactions,
    paymentsBalance: paymentsBalance.getAmount(),
    userBalance: userBalance.getAmount(),
  };
}

export default function Dashboard() {
  const { totalPerUser, transactions, paymentsBalance, userBalance } =
    useLoaderData();

  return (
    <div>
      <section
        aria-labelledby="summary-heading"
        className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
      >
        <h2
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
        </dl>
      </section>
    </div>
  );
}
