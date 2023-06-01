import { Link, useActionData, Form, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect, json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getUser, updateUser } from "~/models/dashboard/User.server";
import { requireUserId } from "~/session.server";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";


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
  const {
    email,
    name,
    password,
  } = Object.fromEntries(formData);

  const errors = {
    email: email ? null : "Email is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof email === "string", "Invalid email");
  invariant(typeof name === "string", "Invalid name");
  invariant(typeof password === "string", "Invalid password");

  await updateUser({
    id,
    email,
    name,
    password,
  });

  return redirect(`/dashboard/User`);
}

export async function loader({ params }: LoaderArgs) {
  const id = params.id as string;
  const user = await getUser({id});
  return {
    user,
  };
}

export default function UpdateUser() {
  const {
    user,
  } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <div>
      <h2>Update User</h2>
      <Form method="post">
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email
              </label>
              <div className="relative mt-2">
                <input type="text" id="email" name="email" defaultValue={ user?.email || ""}
                  className={ getClassName(Boolean(errors?.email)) } required={ true } />
                {errors?.email ? (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
                ) : null}
                </div>
                {errors?.email ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors?.email }
                </p>
                ) : null}
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Name
              </label>
              <div className="relative mt-2">
                <input type="text" id="name" name="name" defaultValue={ user?.name || ""}
                  className={ getClassName(false) } required={ false } />
                </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="relative mt-2">
                <input type="text" id="password" name="password" defaultValue={ user?.password || ""}
                  className={ getClassName(false) } required={ false } />
                </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Link to="/dashboard/User">
          <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
            Cancel
          </button>
          </Link>
          <button type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Update User
          </button>
        </div>
      </Form>
    </div>
  );
}