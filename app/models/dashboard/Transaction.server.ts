import type { Transaction } from "@prisma/client";

import { prisma } from "~/db.server";
import { extractAmount } from '~/utils';
import Dinero from 'dinero.js';

export type { Transaction } from "@prisma/client";

export function getTransaction({
  id,
}: Pick<Transaction, "id">) {
  return prisma.transaction.findFirst({
    where: { id },
  });
}

export function getTransactionListItems(filter?: string, search?: string, startDate?: Date, endDate?: Date, personal?: boolean) {

  const whereFilter = filter ? { category: { name: filter } } : {};

  // If search is not empty and it is not parseable to float, we want to search for the description
  let whereSearch: {
    description?: {
      contains: string;
    };
    amount?: {
      equals: number;
    };
  } = search && isNaN(parseFloat(search)) ? { description: { contains: search } } : {};
  // If search is not empty and it is parseable to float, we want to search for the amount
  if (search && !isNaN(parseFloat(search))) {
    const amount = extractAmount(search);
    whereSearch = { amount: { equals: amount } };
  }

  return prisma.transaction.findMany({
    orderBy: {
      date: "desc",
    },
    where: {
      AND: [
        { personal: personal, installments: 1},
        whereFilter,
        whereSearch,
        startDate && endDate ? { date: { gte: startDate, lte: endDate } } : {},
      ],
    },
    select: {
      id: true,
      description: true,
      amount: true,
      date: true,
      panini: true,
      personal: true,
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

export function getInstallmentTransactionListItems(filter?: string, search?: string, startDate?: Date, endDate?: Date, personal?: boolean) {

  const whereFilter = filter ? { category: { name: filter } } : {};

  let whereSearch: {
    description?: {
      contains: string;
    };
    amount?: {
      equals: number;
    };
  } = search && isNaN(parseFloat(search)) ? { description: { contains: search } } : {};
  if (search && !isNaN(parseFloat(search))) {
    const amount = extractAmount(search);
    whereSearch = { amount: { equals: amount } };
  }

  return prisma.transaction.findMany({
    orderBy: {
      date: "desc",
    },
    where: {
      AND: [
        { personal: personal, installments: { gt: 1 }},
        whereFilter,
        whereSearch,
        startDate && endDate ? { date: { gte: startDate, lte: endDate } } : {},
      ],
    },
    select: {
      id: true,
      description: true,
      amount: true,
      date: true,
      panini: true,
      personal: true,
      installments: true,
      paid: true,
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
  personal,
  notes,
  installments
}: Pick<Transaction, "description" | "amount" | "date" | "userId" | "categoryId" | "panini" | "notes" | "personal" | "installments">) {
  let data = {
    description,
    amount,
    date,
    userId,
    categoryId,
    panini,
    personal,
    notes,
    installments
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
  personal,
  notes,
  installments
}: Pick<Transaction, "id" | "description" | "amount" | "date" | "userId" | "categoryId" | "panini" | "notes" | "personal" | "installments">) {
  let data = {
    description,
    amount,
    date,
    userId,
    categoryId,
    panini,
    personal,
    notes,
    installments
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
    where: { userId: id, panini: false, personal: false, installments: 1},
    _sum: { amount: true },
  });

  return sum._sum.amount || 0;
}

export async function getTotalSpent(){
  const sum = await prisma.transaction.aggregate({
    where: { panini: false, personal: false, installments: 1},
    _sum: { amount: true },
  });

  return sum._sum.amount || 0;
}

export async function getUserSpentOnPanini(id: string){
  const sum = await prisma.transaction.aggregate({
    where: { userId: id, panini: true, personal: false, installments: 1},
    _sum: { amount: true },
  });

  return sum._sum.amount || 0;
}

export async function getPaniniTotalSpent(){
  const sum = await prisma.transaction.aggregate({
    where: { panini: true, personal: false, installments: 1},
    _sum: { amount: true },
  });

  return sum._sum.amount || 0;
}

export async function getTotalSpentByCategory(startDate: Date, endDate: Date){
  const sum = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { date: { gte: startDate, lte: endDate }, personal: false, installments: 1},
    _sum: { amount: true },
  });

  return sum;
}

export async function getInstallmentsTotal(){
    const installments = await prisma.transaction.findMany({
    where: { personal: false, panini: false, installments: { gt: 1 }},
  });

  const unPaidInstallments = installments.filter((installment) => installment.paid < installment.installments);
  return unPaidInstallments.reduce((acc, installment) => acc + Dinero({amount: installment.amount}).divide(installment.installments).getAmount(), 0);

}

export async function getUserInstallments(userId: string){
  const installments = await prisma.transaction.findMany({
    where: { userId, personal: false, panini: false, installments: { gt: 1 }},
  });

  const unPaidInstallments = installments.filter((installment) => installment.paid < installment.installments);
  return unPaidInstallments.reduce((acc, installment) => acc + Dinero({amount: installment.amount}).divide(installment.installments).getAmount(), 0);

}
