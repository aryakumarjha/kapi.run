"use server";

import { getUserFromCookies } from "../cookies";
import { prisma } from "../prisma";

export type AddItemInput = {
  id: string;
  sessionId: string;
  image?: string;
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

export async function addAllItemToSession(inputs: AddItemInput[]) {
  const user = await getUserFromCookies();
  if (!user) {
    throw new Error("User not found");
  }
  const items = await prisma.item.createMany({
    data: inputs.map((input) => ({
      orderId: input.id,
      sessionId: input.sessionId,
      userId: user.id,
      name: input.name,
      quantity: input.quantity,
      note: input.note,
      basePrice: input.basePrice,
      addons: input.addons,
      total: input.total,
      image: input.image,
    })),
  });

  return items;
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
