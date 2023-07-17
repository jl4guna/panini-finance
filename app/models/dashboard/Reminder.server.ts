import type { Reminder } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Reminder } from "@prisma/client";

export function getReminder({
  id,
}: Pick<Reminder, "id">) {
  return prisma.reminder.findFirst({
    where: { id },
  });
}

export async function getUpcomingReminders() {
  // Get the current date at midnight
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const nonRepeatReminders = await prisma.reminder.findMany({
    where: {
      date: {
        gte: currentDate,
      },
      repeat: {
        equals: 'never',
      },
    },
    take: 5,
    orderBy: {
      date: 'asc',
    },
  });

  const yearlyReminders = await prisma.reminder.findMany({
    where: {
      repeat: {
        equals: 'yearly',
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  const monthlyReminders = await prisma.reminder.findMany({
    where: {
      repeat: {
        equals: 'monthly',
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  const weeklyReminders = await prisma.reminder.findMany({
    where: {
      repeat: {
        equals: 'weekly',
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  const dailyReminders = await prisma.reminder.findMany({
    where: {
      repeat: {
        equals: 'daily',
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  // Get the next 5 overall reminders including the non-repeat ones orderBy date
  const upcomingReminders = (nonRepeatReminders as Reminder[]).concat(yearlyReminders, monthlyReminders, weeklyReminders, dailyReminders);

    // Sort the reminders by date ascending only taking in consideration day and month
  upcomingReminders.sort((a, b) => {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);

    if (aDate.getMonth() === bDate.getMonth()) {
      return aDate.getDate() - bDate.getDate();
    }

    return aDate.getMonth() - bDate.getMonth();
  });

  // Filter out the reminders that are not upcoming only taking in consideration day and month
  const filteredReminders = upcomingReminders.filter((reminder) => {
    const reminderDate = new Date(reminder.date);

    if (reminderDate.getMonth() === currentDate.getMonth()) {
      return reminderDate.getDate() >= currentDate.getDate();
    }

    return reminderDate.getMonth() >= currentDate.getMonth();
  });
  





  return filteredReminders.slice(0, 3);

}

export function getReminderListItems() {
  return prisma.reminder.findMany();
}

export function createReminder({
  title,
  description,
  date,
  allDay,
  color,
  repeat,
}: Pick<Reminder, "title" | "description" | "date" | "allDay" | "color" | "repeat">) {
  let data = {
    title,
    description,
    date,
    allDay,
    color,
    repeat,
  };

  return prisma.reminder.create({
    data: data,
  });
}

export function updateReminder({
  id,
  title,
  description,
  date,
  allDay,
  color,
  repeat,
}: Pick<Reminder, "id" | "title" | "description" | "date" | "allDay" | "color" | "repeat">) {
  let data = {
    title,
    description,
    date,
    allDay,
    color,
    repeat,
  };

  return prisma.reminder.updateMany({
    where: { id },
    data: data,
  });
}

export function deleteReminder({
  id,
}: Pick<Reminder, "id">) {
  return prisma.reminder.deleteMany({
    where: { id },
  });
}
