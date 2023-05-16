import type { Payment } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Payment } from "@prisma/client";

export function getPayment({
  id,
}: Pick<Payment, "id">) {
  return prisma.payment.findFirst({
    where: { id },
  });
}

export function getPaymentListItems() {
  return prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      description: true,
      amount: true,
      sender: {
        select: {
          id: true,
          email: true,
      }},
      receiver: {
        select: {
          id: true,
          email: true,
      }},
      createdAt: true,
    },
  });
}

export function createPayment({
  description,
  amount,
  senderId,
  receiverId,
}: Pick<Payment, "description" | "amount" | "senderId" | "receiverId">) {
  let data = {
    description,
    amount,
    senderId,
    receiverId,
  };

  return prisma.payment.create({
    data: data,
  });
}

export function updatePayment({
  id,
  description,
  amount,
  senderId,
  receiverId,
}: Pick<Payment, "id" | "description" | "amount" | "senderId" | "receiverId">) {
  let data = {
    description,
    amount,
    senderId,
    receiverId,
  };

  return prisma.payment.updateMany({
    where: { id },
    data: data,
  });
}

export function deletePayment({
  id,
}: Pick<Payment, "id">) {
  return prisma.payment.deleteMany({
    where: { id },
  });
}

export async function getUserPaymentBalance(id: string){
  const sent = await prisma.payment.aggregate({
    where: { senderId: id },
    _sum: { amount: true },
  });
  
  const received = await prisma.payment.aggregate({
    where: { receiverId: id },
    _sum: { amount: true },
  });

  return {
    sent: sent._sum.amount || 0,
    received: received._sum.amount || 0,
  }
}