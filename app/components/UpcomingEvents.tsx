import type { Reminder } from "@prisma/client";
import { format, formatISO } from "date-fns";
import { ClientOnly } from "remix-utils";

type Props = {
  events: Reminder[];
};

export default function UpcomingEvents({ events }: Props) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold leading-6 text-gray-900">
        Próximos eventos
      </h2>
      <ol className="mt-2 divide-y divide-gray-200 text-sm leading-6 text-gray-500">
        {events.map((event) => (
          <li key={event.id} className="py-4 flex">
            <time
              dateTime={format(new Date(event.date), "yyyy-MM-dd")}
              className="w-28 flex-none"
            >
              {format(new Date(event.date), "E dd/LL")}
            </time>
            <p className="flex-auto font-semibold text-gray-900 mt-0">
              {event.title}
            </p>
            <ClientOnly fallback={<p>Loading...</p>}>
              {() => (
                <p className="flex-none ml-6">
                  {event.allDay ? (
                    "Todo el día"
                  ) : (
                    <time dateTime={formatISO(new Date(event.date))}>
                      {formatISO(new Date(event.date)).slice(11, 16)}
                    </time>
                  )}
                </p>
              )}
            </ClientOnly>
          </li>
        ))}
      </ol>
    </section>
  );
}
