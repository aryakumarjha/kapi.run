"use server";

import { nanoid } from "nanoid";
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
    data: inputs.map((input) => {
      const addons: Array<{
        name: string;
        price: number;
        groupId: string;
      }> = [];

      // combine all the addons into single item, and create new groupId
      const name = input.addons?.map((addon) => addon.name).join(", ") || "";
      const price =
        input.addons?.reduce((acc, addon) => acc + addon.price, 0) || 0;
      const groupId = nanoid();

      if (input.addons) {
        addons.push({
          name,
          price,
          groupId,
        });
      }

      return {
        orderId: input.id,
        sessionId: input.sessionId,
        userId: user.id,
        name: input.name,
        quantity: input.quantity,
        note: input.note,
        basePrice: input.basePrice,
        addons: addons,
        total: input.total,
        image: input.image,
      };
    }),
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
