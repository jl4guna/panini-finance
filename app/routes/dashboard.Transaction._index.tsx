import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs, ActionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import {
  deleteTransaction,
  getTransactionListItems,
} from "~/models/dashboard/Transaction.server";
import { formatDateToDisplay } from "~/utils";
import Dinero from "dinero.js";
import Icon from "~/components/Icon";
import type { Alert } from "~/components/ConfirmAlert";
import ConfirmAlert from "~/components/ConfirmAlert";
import { useState } from "react";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";

export async function action({ request }: ActionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const { id } = Object.fromEntries(formData);

  invariant(typeof id === "string", "Missing id");
  await deleteTransaction({ id });

  return json({ id });
}

export async function loader({ request }: LoaderArgs) {
  const transactions = await getTransactionListItems();

  return json({ transactions });
}
export default function Transaction() {
  const { transactions } = useLoaderData<typeof loader>();

  const [openConfirm, setOpenConfirm] = useState<Alert>({
    open: false,
    action: "",
  });

  return (
    <div className="sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Gastos</h1>
          <p className="mt-2 text-sm text-gray-700">Registro de gastos</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link to="/dashboard/Transaction/create">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Registrar Gasto
            </button>
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th
                  scope="col"
                  className="relative isolate py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
                >
                  Descripción
                  <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-b-gray-200" />
                  <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-b-gray-200" />
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Cantidad
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Pagante
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Panini House
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Categoría
                </th>
                <th
                  scope="col"
                  className="relative hidden py-3.5 pl-3 sm:table-cell"
                >
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="relative py-4 pr-3 text-sm font-medium text-gray-900">
                    {transaction.description}
                    <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                    <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {Dinero({ amount: transaction.amount }).toFormat("$0,0.00")}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {formatDateToDisplay(transaction.date)}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {transaction.user?.email}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {transaction.panini ? "Si" : "No"}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    <div className="flex items-center justify-start gap-2">
                      <Icon
                        name={transaction.category.icon || ""}
                        color={transaction.category.color}
                      />
                      {transaction.category?.name}
                    </div>
                  </td>
                  <td className="relative hidden py-4 pl-3 text-right text-sm font-medium sm:table-cell">
                    <Link
                      to={`/dashboard/Transaction/${transaction.id}`}
                      className="pr-2 text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() =>
                        setOpenConfirm({
                          open: true,
                          action: transaction.id,
                        })
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmAlert
        type="transaction"
        alert={openConfirm}
        setAlert={setOpenConfirm}
      />
    </div>
  );
}
