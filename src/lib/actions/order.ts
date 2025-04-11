"use server";

import { getUserFromCookies } from "../cookies";
import { prisma } from "../prisma";

export type AddItemInput = {
  sessionId: string;
  name: string;
  quantity: number;
  note?: string;
  basePrice: number;
  addons?: Array<{
    name: string;
    price: number;
    groupId: string;
  }>;
  total: number;
};

export async function addItemToSession(input: AddItemInput) {
  const user = await getUserFromCookies();
  if (!user) {
    throw new Error("User not found");
  }

  const item = await prisma.item.create({
    data: {
      sessionId: input.sessionId,
      userId: user.id,
      name: input.name,
      quantity: input.quantity,
      note: input.note,
      basePrice: input.basePrice,
      addons: input.addons,
      total: input.total,
    },
    include: {
      session: true,
      user: true,
    },
  });

  return item;
}

export async function getSessionItems(sessionId: string) {
  return prisma.item.findMany({
    where: {
      sessionId,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
