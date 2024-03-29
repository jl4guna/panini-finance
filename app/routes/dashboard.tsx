import { Form, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { Fragment, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  CreditCardIcon,
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  XMarkIcon,
  CalendarDaysIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getUser } from "~/session.server";
import SearchTransactions from "~/components/SearchTransactions";

export const meta: MetaFunction = () => [{ title: "Dashboard" }];

const navigation = [
  { name: "Balance", href: "/dashboard", icon: HomeIcon, current: false },
  {
    name: "Categorías",
    href: "/dashboard/Category",
    icon: TagIcon,
    current: false,
  },
  {
    name: "Gastos",
    href: "/dashboard/Transaction",
    icon: ShoppingBagIcon,
    current: false,
  },
  {
    name: "Gastos a Meses",
    href: "/dashboard/Installments",
    icon: BanknotesIcon,
    current: false,
  },
  {
    name: "Pagos",
    href: "/dashboard/Payment",
    icon: CreditCardIcon,
    current: false,
  },
  {
    name: "Recordatorios",
    href: "/dashboard/Reminder",
    icon: CalendarDaysIcon,
    current: false,
  },
];

const userNavigation = [
  { name: "Your profile", href: "#" },
  { name: "Sign out", href: "#" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams as any;
  const { search } = Object.fromEntries(searchParams.entries());
  const user = await getUser(request);
  if (!user) return redirect("/");
  return json({ user, search });
}

export default function Dashboard() {
  const { user, search } = useLoaderData<typeof loader>();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                      <img
                        className="h-8 w-auto"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                        alt="Your Company"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <NavLink
                                  end
                                  to={item.href}
                                  className={({ isActive, isPending }) =>
                                    classNames(
                                      isPending
                                        ? "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                                        : isActive
                                          ? "bg-gray-50 text-indigo-600"
                                          : "",
                                      "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                                    )
                                  }
                                >
                                  <item.icon
                                    className="h-6 w-6 shrink-0"
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="mt-auto">
                          <Form action="/logout" method="post">
                            <button
                              type="submit"
                              className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                            >
                              Logout
                            </button>
                          </Form>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt="Your Company"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          end
                          className={({ isActive, isPending }) =>
                            classNames(
                              isPending
                                ? "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                                : isActive
                                  ? "bg-gray-50 text-indigo-600"
                                  : "",
                              "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                            )
                          }
                        >
                          <item.icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="mt-auto">
                  <Form action="/logout" method="post">
                    <button
                      type="submit"
                      className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                    >
                      Logout
                    </button>
                  </Form>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
            <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Separator */}
              <div
                className="h-6 w-px bg-gray-200 lg:hidden"
                aria-hidden="true"
              />

              <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <SearchTransactions search={search as string} />
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  {/* Separator */}
                  <div
                    className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
                    aria-hidden="true"
                  />

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="-m-1.5 flex items-center p-1.5">
                      <span className="sr-only">Open user menu</span>
                      <span className="hidden lg:flex lg:items-center">
                        <span
                          className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                          aria-hidden="true"
                        >
                          {user.email}
                        </span>
                        <ChevronDownIcon
                          className="ml-2 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <a
                                href={item.href}
                                className={classNames(
                                  active ? "bg-gray-50" : "",
                                  "block px-3 py-1 text-sm leading-6 text-gray-900",
                                )}
                              >
                                {item.name}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>

          <main className="pt-10 pb-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      {/* Mobile menu bar */}
      <div className="sm:hidden">
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 pb-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              <NavLink
                to="/dashboard"
                end
                className={({ isActive, isPending }) =>
                  classNames(
                    isPending
                      ? "text-gray-700 hover:text-indigo-600"
                      : isActive
                        ? "text-indigo-600"
                        : "",
                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                  )
                }
              >
                <HomeIcon className="h-6 w-6" aria-hidden="true" />
              </NavLink>
              <NavLink
                to="/dashboard/Category"
                end
                className={({ isActive, isPending }) =>
                  classNames(
                    isPending
                      ? "text-gray-700 hover:text-indigo-600"
                      : isActive
                        ? "text-indigo-600"
                        : "",
                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                  )
                }
              >
                <TagIcon className="h-6 w-6" aria-hidden="true" />
              </NavLink>
              <NavLink
                to="/dashboard/Transaction"
                end
                className={({ isActive, isPending }) =>
                  classNames(
                    isPending
                      ? "text-gray-700 hover:text-indigo-600"
                      : isActive
                        ? "text-indigo-600"
                        : "",
                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                  )
                }
              >
                <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
              </NavLink>
              <NavLink
                to="/dashboard/Payment"
                end
                className={({ isActive, isPending }) =>
                  classNames(
                    isPending
                      ? "text-gray-700 hover:text-indigo-600"
                      : isActive
                        ? "text-indigo-600"
                        : "",
                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                  )
                }
              >
                <CreditCardIcon className="h-6 w-6" aria-hidden="true" />
              </NavLink>
              <NavLink
                to="/dashboard/Reminder"
                end
                className={({ isActive, isPending }) =>
                  classNames(
                    isPending
                      ? "text-gray-700 hover:text-indigo-600"
                      : isActive
                        ? "text-indigo-600"
                        : "",
                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                  )
                }
              >
                <CalendarDaysIcon className="h-6 w-6" aria-hidden="true" />
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
