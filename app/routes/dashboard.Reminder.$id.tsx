import { Link, useActionData, Form, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect, json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  getReminder,
  updateReminder,
} from "~/models/dashboard/Reminder.server";
import { requireUserId } from "~/session.server";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { classNames } from "~/utils";
import { Switch } from "@headlessui/react";
import { useState } from "react";
import Select from "~/components/Select";
import { REMINDER_REPEAT_OPTIONS } from "../utils/constants";
import { formatInTimeZone } from "date-fns-tz";

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
  await requireUserId(request);
  const formData = await request.formData();
  const { title, description, date, allDay, color, repeat } =
    Object.fromEntries(formData);

  const errors = {
    title: title ? null : "Title is required",
    date: date ? null : "Date is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof title === "string", "Invalid title");
  invariant(typeof description === "string", "Invalid description");
  invariant(typeof date === "string", "Invalid date");
  invariant(typeof allDay === "string", "Invalid allDay");
  invariant(typeof color === "string", "Invalid color");
  invariant(typeof repeat === "string", "Invalid repeat");

  await updateReminder({
    id,
    title,
    description,
    date: new Date(date),
    allDay: allDay === "true",
    color,
    repeat,
  });

  return redirect(`/dashboard/Reminder`);
}

export async function loader({ params }: LoaderArgs) {
  const id = params.id as string;
  const reminder = await getReminder({ id });
  return {
    reminder,
  };
}

export default function UpdateReminder() {
  const { reminder } = useLoaderData<typeof loader>();
  console.log(reminder);
  const errors = useActionData<typeof action>();
  const [isAllDay, setIsAllDay] = useState(reminder?.allDay);

  return (
    <div>
      <h2>Actualizar Recordatorio</h2>
      <Form method="post">
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="title"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Título
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  id="title"
                  name="title"
                  defaultValue={reminder?.title || ""}
                  className={getClassName(Boolean(errors?.title))}
                  required={true}
                />
                {errors?.title ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>
              {errors?.title ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors?.title}
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
                  type="datetime-local"
                  id="date"
                  name="date"
                  defaultValue={formatInTimeZone(
                    new Date(reminder?.date || ""),
                    "Africa/Accra",
                    "yyyy-MM-dd'T'kk:mm",
                  )}
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
              <Select
                label="Se repite"
                options={REMINDER_REPEAT_OPTIONS}
                name="repeat"
                defaultValue={reminder?.repeat || ""}
              />
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="allDay"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Todo el día
              </label>
              <input
                type="hidden"
                name="allDay"
                id="allDay"
                value={`${isAllDay}`}
              />
              <div className="relative mt-2">
                <Switch
                  checked={isAllDay}
                  onChange={() => setIsAllDay(!isAllDay)}
                  className={classNames(
                    isAllDay ? "bg-indigo-600" : "bg-gray-200",
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                  )}
                >
                  <span className="sr-only">Todo el dia</span>
                  <span
                    className={classNames(
                      isAllDay ? "translate-x-5" : "translate-x-0",
                      "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    )}
                  >
                    <span
                      className={classNames(
                        isAllDay
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
                        isAllDay
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
            <div className="sm:col-span-3">
              <label
                htmlFor="color"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Color
              </label>
              <div className="relative mt-2">
                <input
                  type="color"
                  id="color"
                  name="color"
                  defaultValue={reminder?.color || ""}
                  required={false}
                />
              </div>
            </div>
            <div className="sm:col-span-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Descripción
              </label>
              <div className="relative mt-2">
                <textarea
                  rows={4}
                  name="description"
                  id="description"
                  className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  defaultValue={reminder?.description || ""}
                  required={false}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Link to="/dashboard/Reminder">
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
            Actualizar Recordatorio
          </button>
        </div>
      </Form>
    </div>
  );
}
