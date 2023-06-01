import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export function getUser({
  id,
}: Pick<User, "id">) {
  return prisma.user.findFirst({
    where: { id },
  });
}

export function getUserListItems() {
  return prisma.user.findMany();
}

export function createUser({
  email,
  name,
}: Pick<User, "email" | "name">) {
  let data = {
    email,
    name,
  };

  return prisma.user.create({
    data: data,
  });
}

export function updateUser({
  id,
  email,
  name,
}: Pick<User, "id" | "email" | "name">) {
  let data = {
    email,
    name,
  };

  return prisma.user.updateMany({
    where: { id },
    data: data,
  });
}

export function deleteUser({
  id,
}: Pick<User, "id">) {
  return prisma.user.deleteMany({
    where: { id },
  });
}
