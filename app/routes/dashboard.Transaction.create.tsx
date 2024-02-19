import { Link, useActionData, Form, useLoaderData } from "@remix-run/react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/server-runtime";
import { redirect, json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { createTransaction } from "~/models/dashboard/Transaction.server";
import { requireUserId } from "~/session.server";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

import { getUserListItems } from "~/models/dashboard/User.server";
import { getCategoryListItems } from "~/models/dashboard/Category.server";
import { extractAmount, formatDate, generateFormRandomId } from "~/utils";
import { useEffect, useState } from "react";
import Dinero from "dinero.js";

function getClassName(error: boolean) {
  const errorClasses =
    "pr-10 text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 ";
  const normalClasses =
    "text-gray-900 shadow-sm ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600";
  const className =
    "block w-full rounded-md border-0 py-1.5 px-2 sm:text-sm sm:leading-6 focus:ring-inset ring-1 focus:ring-2 ring-inset ";

  return error ? className + errorClasses : className + normalClasses;
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const { description, amount, date, userId, categoryId, action, type, notes } =
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
  invariant(typeof action === "string", "Invalid action");
  invariant(typeof notes === "string", "Invalid notes");

  await createTransaction({
    description,
    amount: extractAmount(amount),
    date: new Date(date),
    userId,
    categoryId,
    panini: type === "casa",
    personal: type === "personal",
    notes,
  });

  if (action === "createAndAddAnother") {
    return redirect(`/dashboard/Transaction/create`);
  }

  return redirect(`/dashboard/Transaction`);
}

export async function loader({ request }: LoaderFunctionArgs) {
  const currentUserId = await requireUserId(request);
  const users = await getUserListItems();
  const categories = await getCategoryListItems();
  const formRandomId = generateFormRandomId();

  return {
    formRandomId,
    currentUserId,
    users,
    categories,
  };
}

export default function CreateTransaction() {
  const { formRandomId, currentUserId, users, categories } =
    useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const [amount, setAmount] = useState("");

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    const amount = Dinero({
      amount: extractAmount(value),
    }).toFormat("0,0.00");

    setAmount(amount);
  }

  useEffect(() => {
    setAmount("");
  }, [formRandomId]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Gastos</h1>
      <Form key={formRandomId} method="post">
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
                  placeholder='e.g. "Lunch"'
                  defaultValue={""}
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
                  placeholder="0.00"
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
                  defaultValue={formatDate()}
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
                Pagador
              </label>
              <div className="relative mt-2">
                <select
                  required
                  id="userId"
                  name="userId"
                  defaultValue={currentUserId}
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
                  required
                  id="categoryId"
                  name="categoryId"
                  defaultValue={""}
                  className={getClassName(Boolean(errors?.categoryId))}
                >
                  <option value="" disabled>
                    Seleccionar categoría
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
                htmlFor="type"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Panini House
              </label>
              <fieldset className="mt-4">
                <legend className="sr-only">Tipo de gasto</legend>
                <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                  <div className="flex items-center">
                    <input
                      id="panini"
                      name="type"
                      type="radio"
                      value="panini"
                      defaultChecked
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor="panini"
                      className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                    >
                      Panini
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="casa"
                      name="type"
                      value="casa"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor="casa"
                      className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                    >
                      Casa
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="personal"
                      name="type"
                      value="personal"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor="personal"
                      className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                    >
                      Personal
                    </label>
                  </div>
                </div>
              </fieldset>
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
                  defaultValue={""}
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
            name="action"
            value="create"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Registrar Gasto
          </button>
          <button
            type="submit"
            name="action"
            value="createAndAddAnother"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Registrar y Agregar otro
          </button>
        </div>
      </Form>
    </div>
  );
}
