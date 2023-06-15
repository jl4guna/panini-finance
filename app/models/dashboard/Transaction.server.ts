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
    orderBy: {
      date: "desc",
    },
    select: {
      id: true,
      description: true,
      amount: true,
      date: true,
      panini: true,
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
          icon: true,
          color: true,
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
  panini,
}: Pick<Transaction, "description" | "amount" | "date" | "userId" | "categoryId" | "panini">) {
  let data = {
    description,
    amount,
    date,
    userId,
    categoryId,
    panini,
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
  panini,
}: Pick<Transaction, "id" | "description" | "amount" | "date" | "userId" | "categoryId" | "panini">) {
  let data = {
    description,
    amount,
    date,
    userId,
    categoryId,
    panini
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

export async function getUserTotalSpent(id: string){
  const sum = await prisma.transaction.aggregate({
    where: { userId: id, panini: false },
    _sum: { amount: true },
  });

  return sum._sum.amount || 0;
}

export async function getTotalSpent(){
  const sum = await prisma.transaction.aggregate({
    where: { panini: false },
    _sum: { amount: true },
  });

  return sum._sum.amount || 0;
}

export async function getUserSpentOnPanini(id: string){
  const sum = await prisma.transaction.aggregate({
    where: { userId: id, panini: true },
    _sum: { amount: true },
  });

  return sum._sum.amount || 0;
}

export async function getPaniniTotalSpent(){
  const sum = await prisma.transaction.aggregate({
    where: { panini: true },
    _sum: { amount: true },
  });

  return sum._sum.amount || 0;
}
