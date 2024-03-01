import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import {
  deleteTransaction,
  getTransactionListItems,
} from "~/models/dashboard/Transaction.server";
import {
  classNames,
  formatDate,
  formatDateToDisplay,
  generateFormRandomId,
  isValidDate,
} from "~/utils";
import Dinero from "dinero.js";
import Icon from "~/components/Icon";
import type { Alert } from "~/components/ConfirmAlert";
import ConfirmAlert from "~/components/ConfirmAlert";
import { Fragment, useEffect, useState } from "react";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { Listbox, Transition } from "@headlessui/react";
import {
  ChevronRightIcon,
  ChevronUpDownIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { getCategoryListItems } from "~/models/dashboard/Category.server";

export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const { id } = Object.fromEntries(formData);

  invariant(typeof id === "string", "Missing id");
  await deleteTransaction({ id });

  return json({ id });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const searchParams = new URL(request.url).searchParams as any;
  const { filter, search, start, end, personal } = Object.fromEntries(
    searchParams.entries(),
  );

  const isPersonal = Boolean(personal);

  const startDate = start ? new Date(start) : new Date();
  if (!start) {
    //Get the first day of the month
    startDate.setDate(0);
  }
  const endDate = end ? new Date(end) : new Date();

  const transactions = await getTransactionListItems(
    filter,
    search,
    startDate,
    endDate,
    isPersonal,
    userId,
  );
  const categories = await getCategoryListItems();

  const category = categories.find((c) => c.name === filter);

  return json({
    transactions,
    categories,
    category,
    search,
    range: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
    isPersonal,
  });
}
export default function Transaction() {
  const { transactions, categories, category, search, range, isPersonal } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(range.startDate);
  const [endDate, setEndDate] = useState(range.endDate);
  const [filter, setFilter] = useState(category?.name);
  const [personal, setPersonal] = useState(isPersonal);

  useEffect(() => {
    if (isValidDate(startDate) && isValidDate(endDate)) {
      navigate(
        `/dashboard/Transaction?start=${startDate}&end=${endDate}${
          filter ? "&filter=" + filter : ""
        }${search ? "&search=" + search : ""}${personal ? "&personal=true" : ""}`,
      );
    }
  }, [startDate, endDate, navigate, filter, search, personal]);

  const [openConfirm, setOpenConfirm] = useState<Alert>({
    open: false,
    action: "",
  });

  return (
    <>
      {search ? (
        <div className="absolute top-[4.5rem]">
          <section className="flex items-center">
            <ChevronRightIcon
              className="h-5 w-5 flex-shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <div className="flex items-center group">
              <span className="mr text-sm font-medium text-gray-500 group-hover:text-gray-700">
                {search}
              </span>
              <Link to={"/dashboard/Transaction"}>
                <XCircleIcon
                  className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-700 cursor-pointer"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </section>
        </div>
      ) : null}
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
        <div className=" pb-2">
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
        <div key={generateFormRandomId()} className="mt-4 w-full md:w-1/3">
          <Listbox value={category}>
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                  Filtrar por categoría
                </Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                    <span className="flex items-center">
                      <Icon
                        name={category?.icon || ""}
                        color={category?.color || ""}
                      />
                      <span className="ml-3 block truncate">
                        {category?.name || "Todas las categorías"}
                      </span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      <Listbox.Option
                        className={({ active }) =>
                          classNames(
                            active
                              ? "bg-indigo-600 text-white"
                              : "text-gray-900",
                            "relative cursor-default select-none py-2 pl-3 pr-9",
                          )
                        }
                        value={null}
                      >
                        {({ selected }) => (
                          <div onClick={() => setFilter("")}>
                            <div className="flex items-center">
                              <span
                                className={classNames(
                                  selected ? "font-semibold" : "font-normal",
                                  "ml-3 block truncate",
                                )}
                              >
                                Todas las categorías
                              </span>
                            </div>
                          </div>
                        )}
                      </Listbox.Option>

                      {categories.map((category) => (
                        <Listbox.Option
                          key={category.id}
                          className={({ active }) =>
                            classNames(
                              active
                                ? "bg-indigo-600 text-white"
                                : "text-gray-900",
                              "relative cursor-default select-none py-2 pl-3 pr-9",
                            )
                          }
                          value={category}
                        >
                          {({ selected }) => (
                            <div
                              onClick={() => setFilter(category.name)}
                              className="flex items-center"
                            >
                              <Icon
                                name={category.icon || ""}
                                color={category.color}
                              />

                              <span
                                className={classNames(
                                  selected ? "font-semibold" : "font-normal",
                                  "ml-3 block truncate",
                                )}
                              >
                                {category.name}
                              </span>
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>
        </div>

        <div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <p
                onClick={() => setPersonal(false)}
                className={classNames(
                  !isPersonal
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "w-1/2 border-b-2 py-4 px-1 text-center text-sm font-medium cursor-pointer",
                )}
                aria-current="page"
              >
                Gastos
              </p>
              <p
                onClick={() => setPersonal(true)}
                className={classNames(
                  isPersonal
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "w-1/2 border-b-2 py-4 px-1 text-center text-sm font-medium cursor-pointer",
                )}
                aria-current="page"
              >
                Gastos Personales
              </p>
            </nav>
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
                  {!personal && (
                    <>
                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                      >
                        Pagador
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                      >
                        Casa
                      </th>
                    </>
                  )}

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
                      <Link to={`/dashboard/Transaction/${transaction.id}`}>
                        {transaction.description}
                        <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                        <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 sm:table-cell">
                      {Dinero({ amount: transaction.amount }).toFormat(
                        "$0,0.00",
                      )}
                    </td>
                    <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                      {formatDateToDisplay(transaction.date)}
                    </td>
                    {!personal && (
                      <>
                        <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                          {transaction.user?.email}
                        </td>
                        <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                          {transaction.panini ? "Si" : "No"}
                        </td>
                      </>
                    )}

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
    </>
  );
}
