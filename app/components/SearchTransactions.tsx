import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

export default function SearchTransactions({
  search = "",
}: {
  search: string;
}) {
  return (
    <form
      className="relative flex flex-1"
      action="/dashboard/Transaction"
      method="GET"
    >
      <label htmlFor="search-field" className="sr-only">
        Buscar Gastos
      </label>
      <MagnifyingGlassIcon
        className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
        aria-hidden="true"
      />
      <input
        id="search-field"
        className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
        placeholder="Buscar Gastos..."
        type="search"
        name="search"
        defaultValue={search}
      />
    </form>
  );
}
