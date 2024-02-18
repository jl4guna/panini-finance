import { Link, useActionData, Form, useLoaderData } from "@remix-run/react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/server-runtime";
import { redirect, json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getPayment, updatePayment } from "~/models/dashboard/Payment.server";
import { requireUserId } from "~/session.server";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { getUserListItems } from "~/models/dashboard/User.server";
import { useState } from "react";
import type { UserErrorType } from "~/utils";
import { classNames, extractAmount, getUserBalance } from "~/utils";
import Dinero from "dinero.js";
import { Switch } from "@headlessui/react";

function getClassName(error: boolean) {
  const errorClasses =
    "pr-10 text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 ";
  const normalClasses =
    "text-gray-900 shadow-sm ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600";
  const className =
    "block w-full rounded-md border-0 py-1.5 pl-2 sm:text-sm sm:leading-6 focus:ring-inset ring-1 focus:ring-2 ring-inset ";

  return error ? className + errorClasses : className + normalClasses;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const id = params.id as string;
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const { description, amount, receiverId, panini, notes } =
    Object.fromEntries(formData);
  const isPanini = panini === "true";

  const errors: UserErrorType = {
    description: description ? null : "Description is required",
    amount: amount ? null : "Amount is required",
    receiverId: null,
  };
  if (!isPanini) {
    errors.receiverId = receiverId ? null : "Receiver is required";
  }

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof description === "string", "Invalid description");
  invariant(typeof amount === "string", "Invalid amount");
  invariant(typeof userId === "string", "Invalid senderId");
  invariant(typeof receiverId === "string" || isPanini, "Invalid receiverId");
  invariant(typeof notes === "string", "Invalid notes");

  await updatePayment({
    id,
    description,
    amount: extractAmount(amount),
    senderId: userId,
    receiverId: receiverId as string,
    panini: isPanini,
    notes,
  });

  return redirect(`/dashboard/Payment`);
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const id = params.id as string;
  const payment = await getPayment({ id });
  const receivers = await getUserListItems();
  const userBalance = await getUserBalance(userId);

  return {
    payment,
    receivers: receivers.filter((receiver) => receiver.id !== userId),
    userBalance,
  };
}

export default function UpdatePayment() {
  const { payment, receivers, userBalance } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const [isPanini, setIsPanini] = useState(payment?.panini);

  const initialAmount = Dinero({ amount: payment?.amount || 0 }).toFormat(
    "0,0.00",
  );
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
      <h1 className="text-xl font-semibold text-gray-900">Pagos</h1>
      <div className="border-b border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
        <p className="text-sm font-medium leading-6 text-gray-900">
          Hola, {userBalance.status.text}
        </p>
        <p
          className={
            "mt-1 text-sm leading-6  sm:mt-2 " + userBalance.status.color
          }
        >
          {Dinero({ amount: userBalance.balance })
            .toFormat("$0,0.00")
            .replace("-", "")}
        </p>
      </div>
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
                  defaultValue={payment?.description || ""}
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
                htmlFor="receiverId"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Destinatario
              </label>
              <div className="relative mt-2">
                <select
                  id="receiverId"
                  name="receiverId"
                  disabled={isPanini}
                  defaultValue={payment?.receiverId}
                  className={getClassName(Boolean(errors?.receiverId))}
                >
                  <option value="" disabled>
                    Seleccionar destinatario
                  </option>
                  {receivers.map((option) => (
                    <option key={option.id} value={option.id}>
                      {isPanini ? "Tú" : option.email}
                    </option>
                  ))}
                </select>
                {errors?.receiverId ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>
              {errors?.receiverId ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors?.receiverId}
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
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                  )}
                >
                  <span className="sr-only">Panini House</span>
                  <span
                    className={classNames(
                      isPanini ? "translate-x-5" : "translate-x-0",
                      "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    )}
                  >
                    <span
                      className={classNames(
                        isPanini
                          ? "opacity-0 duration-100 ease-out"
                          : "opacity-100 duration-200 ease-in",
                        "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
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
                        "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
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
                  defaultValue={payment?.notes || ""}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Link to="/dashboard/Payment">
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
