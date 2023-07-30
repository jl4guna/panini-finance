import type { Reminder } from "@prisma/client";
import { format, formatISO } from "date-fns";
import React from "react";

type Props = {
  events: Reminder[];
};

let isHydrating = true;

export default function UpcomingEvents({ events }: Props) {
  const [isHydrated, setIsHydrated] = React.useState(!isHydrating);

  React.useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);
  }, []);

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
            {isHydrated && (
              <p className="flex-none ml-6">
                {event.allDay ? (
                  "Todo el día"
                ) : (
                  <time dateTime={formatISO(new Date(event.date))}>
                    {format(new Date(event.date), "hh:mm a")}
                  </time>
                )}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
