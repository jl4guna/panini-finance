import type { Reminder } from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";

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
            <span className="w-28 flex-none">
              {formatInTimeZone(event.date, "Africa/Accra", "E dd/LL")}
            </span>
            <p className="flex-auto font-semibold text-gray-900 mt-0">
              {event.title}
            </p>
            <p className="flex-none ml-6">
              {event.allDay ? (
                "Todo el día"
              ) : (
                <span>
                  {formatInTimeZone(event.date, "Africa/Accra", "hh:mm a")}
                </span>
              )}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
