import type { Reminder } from "@prisma/client";
import { format } from "date-fns";
import React from "react";

type Props = {
  events: Reminder[];
};

export default function UpcomingEvents({ events }: Props) {
  return (
    <section>
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
            <p className="flex-none ml-6">
              {event.allDay ? (
                "Todo el día"
              ) : (
                <time dateTime={format(new Date(event.date), "yyyy-MM-dd")}>
                  {format(new Date(event.date), "hh:mm a")}
                </time>
              )}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
