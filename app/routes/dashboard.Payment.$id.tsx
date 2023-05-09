import { Link, useActionData, Form, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect, json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getPayment, updatePayment } from "~/models/dashboard/Payment.server";
import { requireUserId } from "~/session.server";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { getUserListItems } from "~/models/dashboard/User.server";

function getClassName(error: boolean) {
  const errorClasses =
    "pr-10 text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 ";
  const normalClasses =
    "text-gray-900 shadow-sm ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600";
  const className =
    "block w-full rounded-md border-0 py-1.5 pl-2 sm:text-sm sm:leading-6 focus:ring-inset ring-1 focus:ring-2 ring-inset ";

  return error ? className + errorClasses : className + normalClasses;
}

export async function action({ request, params }: ActionArgs) {
  const id = params.id as string;
  const user = await requireUserId(request);
  const formData = await request.formData();
  const { description, amount, senderId, receiverId } =
    Object.fromEntries(formData);

  const errors = {
    description: description ? null : "Description is required",
    amount: amount ? null : "Amount is required",
    senderId: senderId ? null : "Sender is required",
    receiverId: receiverId ? null : "Receiver is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof description === "string", "Invalid description");
  invariant(typeof amount === "string", "Invalid amount");
  invariant(typeof senderId === "string", "Invalid senderId");
  invariant(typeof receiverId === "string", "Invalid receiverId");

  await updatePayment({
    id,
    description,
    amount: Number(amount),
    senderId,
    receiverId,
  });

  return redirect(`/dashboard/Payment`);
}

export async function loader({ params }: LoaderArgs) {
  const id = params.id as string;
  const payment = await getPayment({ id });
  const receivers = await getUserListItems();
  return {
    payment,
    receivers,
  };
}

export default function UpdatePayment() {
  const { payment, receivers } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <div>
      <h2>Update Payment</h2>
      <Form method="post">
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Description
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
                Amount
              </label>
              <div className="relative mt-2">
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  defaultValue={payment?.amount || ""}
                  className={getClassName(Boolean(errors?.amount))}
                  required={true}
                />
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
                Receiver
              </label>
              <div className="relative mt-2">
                <select
                  id="receiverId"
                  name="receiverId"
                  defaultValue={payment?.receiverId}
                  className={getClassName(Boolean(errors?.receiverId))}
                >
                  <option value="" disabled>
                    Select receiver
                  </option>
                  {receivers.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.id}
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
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Link to="/dashboard/Payment">
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Update Payment
          </button>
        </div>
      </Form>
    </div>
  );
}
