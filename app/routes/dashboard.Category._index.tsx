import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs, ActionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useState } from "react";
import invariant from "tiny-invariant";
import type { Alert } from "~/components/ConfirmAlert";
import ConfirmAlert from "~/components/ConfirmAlert";
import Icon from "~/components/Icon";
import type { Category as CategoryType } from "~/models/dashboard/Category.server";
import { deleteCategory } from "~/models/dashboard/Category.server";
import { getCategoryListItems } from "~/models/dashboard/Category.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const { id } = Object.fromEntries(formData);

  invariant(typeof id === "string", "Missing id");
  await deleteCategory({ id });

  return json({ id });
}

export async function loader({ request }: LoaderArgs) {
  const categories = await getCategoryListItems();

  return json({ categories });
}
export default function Category() {
  const { categories } = useLoaderData<{ categories: CategoryType[] }>();

  const [openConfirm, setOpenConfirm] = useState<Alert>({
    open: false,
    action: "",
  });

  return (
    <div className="sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Categorías</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the categories.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link to="/dashboard/Category/create">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Add Category
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
                  Name
                  <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-b-gray-200" />
                  <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-b-gray-200" />
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Color
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Icon
                </th>
                <th scope="col" className="relative py-3.5 pl-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="relative py-4 pr-3 text-sm font-medium text-gray-900">
                    {category.name}
                    <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                    <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                  </td>
                  <td
                    className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell"
                    style={{ color: category.color }}
                  >
                    {category.color}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    <Icon name={category.icon || ""} color={category.color} />
                  </td>
                  <td className="relative py-4 pl-3 text-right text-sm font-medium">
                    <Link
                      to={`/dashboard/Category/${category.id}`}
                      className="pr-2 text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() =>
                        setOpenConfirm({
                          open: true,
                          action: category.id,
                        })
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmAlert
        type="category"
        alert={openConfirm}
        setAlert={setOpenConfirm}
      />
    </div>
  );
}
