import { Link, useActionData, Form, useLoaderData } from "@remix-run/react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/server-runtime";
import { redirect, json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  getCategory,
  updateCategory,
} from "~/models/dashboard/Category.server";
import { requireUserId } from "~/session.server";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import SelectIcon from "~/components/SelectIcon";

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
  await requireUserId(request);
  const formData = await request.formData();
  const { name, color, icon } = Object.fromEntries(formData);

  const errors = {
    name: name ? null : "Name is required",
    color: color ? null : "Color is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof name === "string", "Invalid name");
  invariant(typeof color === "string", "Invalid color");
  invariant(typeof icon === "string", "Invalid icon");

  await updateCategory({
    id,
    name,
    color,
    icon,
  });

  return redirect(`/dashboard/Category`);
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id as string;
  const category = await getCategory({ id });
  return {
    category,
  };
}

export default function UpdateCategory() {
  const { category } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <div>
      <h2>Update Category</h2>
      <Form method="post">
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Name
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={category?.name || ""}
                  className={getClassName(Boolean(errors?.name))}
                  required={true}
                />
                {errors?.name ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>
              {errors?.name ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors?.name}
                </p>
              ) : null}
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
                  defaultValue={category?.color || ""}
                  required={true}
                />
                {errors?.color ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>
              {errors?.color ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors?.color}
                </p>
              ) : null}
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="icon"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Icon
              </label>
              <div className="relative mt-2">
                <SelectIcon defaultIcon={category?.icon || ""} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Link to="/dashboard/Category">
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
            Update Category
          </button>
        </div>
      </Form>
    </div>
  );
}
