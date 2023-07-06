import { Link, useActionData, Form, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect, json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  getTransaction,
  updateTransaction,
} from "~/models/dashboard/Transaction.server";
import { requireUserId } from "~/session.server";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import Dinero from "dinero.js";
import { getUserListItems } from "~/models/dashboard/User.server";
import { getCategoryListItems } from "~/models/dashboard/Category.server";
import {
  addMissingDigit,
  classNames,
  extractAmount,
  formatDate,
} from "~/utils";
import { useState } from "react";
import { Switch } from "@headlessui/react";

function getClassName(error: boolean) {
  const errorClasses =
    "pr-10 text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 ";
  const normalClasses =
    "text-gray-900 shadow-sm ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600";
  const className =
    "block w-full rounded-md border-0 py-1.5 px-2 sm:text-sm sm:leading-6 focus:ring-inset ring-1 focus:ring-2 ring-inset ";

  return error ? className + errorClasses : className + normalClasses;
}

export async function action({ request, params }: ActionArgs) {
  const id = params.id as string;
  const user = await requireUserId(request);
  const formData = await request.formData();
  const { description, amount, date, userId, categoryId, panini, notes } =
    Object.fromEntries(formData);

  const errors = {
    description: description ? null : "Description is required",
    amount: amount ? null : "Amount is required",
    date: date ? null : "Date is required",
    userId: userId ? null : "User is required",
    categoryId: categoryId ? null : "Category is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof description === "string", "Invalid description");
  invariant(typeof amount === "string", "Invalid amount");
  invariant(typeof date === "string", "Invalid date");
  invariant(typeof userId === "string", "Invalid userId");
  invariant(typeof categoryId === "string", "Invalid categoryId");
  invariant(typeof notes === "string", "Invalid notes");

  await updateTransaction({
    id,
    description,
    amount: extractAmount(amount),
    date: new Date(date),
    userId,
    categoryId,
    panini: panini === "true",
    notes,
  });

  return redirect(`/dashboard/Transaction`);
}

export async function loader({ params }: LoaderArgs) {
  const id = params.id as string;
  const transaction = await getTransaction({ id });
  const users = await getUserListItems();
  const categories = await getCategoryListItems();
  console.log(transaction);
  return {
    transaction,
    users,
    categories,
  };
}

export default function UpdateTransaction() {
  const { transaction, users, categories } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const [isPanini, setIsPanini] = useState(transaction?.panini);

  const initialAmount = Dinero({
    amount: transaction?.amount || 0,
  }).toFormat("0,0.00");
  const [amount, setAmount] = useState(initialAmount);

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    const amount = Dinero({
      amount: extractAmount(value),
    }).toFormat("0,0.00");

    setAmount(amount);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Gastos</h1>
      <Form method="post">
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Descripción
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  id="description"
                  name="description"
                  defaultValue={transaction?.description || ""}
                  className={getClassName(Boolean(errors?.description))}
                  required={true}
                />
                {errors?.description ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>
              {errors?.description ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors?.description}
                </p>
              ) : null}
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="amount"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Cantidad
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={amount}
                  onChange={handleOnChange}
                  className={getClassName(Boolean(errors?.amount)) + " pl-7"}
                  required={true}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span
                    className="text-gray-500 sm:text-sm"
                    id="price-currency"
                  >
                    MXN
                  </span>
                </div>
                {errors?.amount ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>
              {errors?.amount ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors?.amount}
                </p>
              ) : null}
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="date"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Fecha
              </label>
              <div className="relative mt-2">
                <input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={formatDate(transaction?.date || "")}
                  className={getClassName(Boolean(errors?.date))}
                  required={true}
                />
                {errors?.date ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>
              {errors?.date ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors?.date}
                </p>
              ) : null}
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="userId"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Pagante
              </label>
              <div className="relative mt-2">
                <select
                  id="userId"
                  name="userId"
                  defaultValue={transaction?.userId}
                  className={getClassName(Boolean(errors?.userId))}
                >
                  <option value="" disabled>
                    Select user
                  </option>
                  {users.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.email}
                    </option>
                  ))}
                </select>
                {errors?.userId ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>
              {errors?.userId ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors?.userId}
                </p>
              ) : null}
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Categoría
              </label>
              <div className="relative mt-2">
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={transaction?.categoryId}
                  className={getClassName(Boolean(errors?.categoryId))}
                >
                  <option value="" disabled>
                    Seleccionar Categoría
                  </option>
                  {categories.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {errors?.categoryId ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>
              {errors?.categoryId ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors?.categoryId}
                </p>
              ) : null}
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="panini"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Panini House
              </label>
              <input
                type="hidden"
                name="panini"
                id="panini"
                value={`${isPanini}`}
              />
              <div className="relative mt-2">
                <Switch
                  checked={isPanini}
                  onChange={() => setIsPanini(!isPanini)}
                  className={classNames(
                    isPanini ? "bg-indigo-600" : "bg-gray-200",
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  )}
                >
                  <span className="sr-only">Panini House</span>
                  <span
                    className={classNames(
                      isPanini ? "translate-x-5" : "translate-x-0",
                      "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    )}
                  >
                    <span
                      className={classNames(
                        isPanini
                          ? "opacity-0 duration-100 ease-out"
                          : "opacity-100 duration-200 ease-in",
                        "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                      )}
                      aria-hidden="true"
                    >
                      <svg
                        className="h-3 w-3 text-gray-400"
                        fill="none"
                        viewBox="0 0 12 12"
                      >
                        <path
                          d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      className={classNames(
                        isPanini
                          ? "opacity-100 duration-200 ease-in"
                          : "opacity-0 duration-100 ease-out",
                        "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                      )}
                      aria-hidden="true"
                    >
                      <svg
                        className="text-blue-1 h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 12 12"
                      >
                        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                      </svg>
                    </span>
                  </span>
                </Switch>
              </div>
            </div>
            <div className="sm:col-span-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Notas:
              </label>
              <div className="mt-2">
                <textarea
                  rows={4}
                  name="notes"
                  id="notes"
                  className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  defaultValue={transaction?.notes || ""}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Link to="/dashboard/Transaction">
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancelar
            </button>
          </Link>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Actualizar
          </button>
        </div>
      </Form>
    </div>
  );
}
