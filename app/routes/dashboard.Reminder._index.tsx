import { SwatchIcon } from "@heroicons/react/20/solid";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import format from "date-fns/format";
import type { Reminder as ReminderType } from "~/models/dashboard/Reminder.server";
import { getReminderListItems } from "~/models/dashboard/Reminder.server";
import { REMINDER_REPEAT_OPTIONS } from "~/utils/constants";

export async function loader({ request }: LoaderArgs) {
  const reminders = await getReminderListItems();

  return json({ reminders });
}
export default function Reminder() {
  const { reminders } = useLoaderData<{ reminders: ReminderType[] }>();

  return (
    <div className="sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Recordatorio</h1>
          <p className="mt-2 text-sm text-gray-700">Lista de recordatorios</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to="/dashboard/Reminder/create">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Crear Recordatorio
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
                  Título
                  <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-b-gray-200" />
                  <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-b-gray-200" />
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Descripción
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
                  Día entero
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
                  Repite
                </th>
                <th scope="col" className="relative py-3.5 pl-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder) => (
                <tr key={reminder.id}>
                  <td className="relative py-4 pr-3 text-sm font-medium text-gray-900">
                    {reminder.title}
                    <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                    <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {reminder.description}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {format(new Date(reminder.date), "dd/MM/yyyy - hh:mm a")}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {reminder.allDay ? "Si" : "No"}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    <SwatchIcon className="w-8 h-8" color={reminder.color} />
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {
                      REMINDER_REPEAT_OPTIONS.find(
                        (option) => option.value === reminder.repeat,
                      )?.name
                    }
                  </td>
                  <td className="relative py-4 pl-3 text-right text-sm font-medium">
                    <Link
                      to={`/dashboard/Reminder/${reminder.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
