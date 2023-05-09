import type { Category } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Category } from "@prisma/client";

export function getCategory({
  id,
}: Pick<Category, "id">) {
  return prisma.category.findFirst({
    where: { id },
  });
}

export function getCategoryListItems() {
  return prisma.category.findMany();
}

export function createCategory({
  name,
  color,
  icon,
}: Pick<Category, "name" | "color" | "icon">) {
  let data = {
    name,
    color,
    icon,
  };

  return prisma.category.create({
    data: data,
  });
}

export function updateCategory({
  id,
  name,
  color,
  icon,
}: Pick<Category, "id" | "name" | "color" | "icon">) {
  let data = {
    name,
    color,
    icon,
  };

  return prisma.category.updateMany({
    where: { id },
    data: data,
  });
}

export function deleteCategory({
  id,
}: Pick<Category, "id">) {
  return prisma.category.deleteMany({
    where: { id },
  });
}
