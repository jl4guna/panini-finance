import type { Transaction } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Transaction } from "@prisma/client";

export function getTransaction({
  id,
}: Pick<Transaction, "id">) {
  return prisma.transaction.findFirst({
    where: { id },
  });
}

export function getTransactionListItems() {

  return prisma.transaction.findMany({
    select: {
      id: true,
      description: true,
      amount: true,
      date: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export function createTransaction({
  description,
  amount,
  date,
  userId,
  categoryId,
}: Pick<Transaction, "description" | "amount" | "date" | "userId" | "categoryId">) {
  let data = {
    description,
    amount,
    date,
    userId,
    categoryId,
  };

  return prisma.transaction.create({
    data: data,
  });
}

export function updateTransaction({
  id,
  description,
  amount,
  date,
  userId,
  categoryId,
}: Pick<Transaction, "id" | "description" | "amount" | "date" | "userId" | "categoryId">) {
  let data = {
    description,
    amount,
    date,
    userId,
    categoryId,
  };

  return prisma.transaction.updateMany({
    where: { id },
    data: data,
  });
}

export function deleteTransaction({
  id,
}: Pick<Transaction, "id">) {
  return prisma.transaction.deleteMany({
    where: { id },
  });
}
