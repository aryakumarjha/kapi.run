"use server";

import { getUserFromCookies } from "../cookies";
import { prisma } from "../prisma";

export type PlaceOrderInput = {
  sessionId: string;
  items: Array<{
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
  }>;
  total: number;
};

export async function placeOrder(input: PlaceOrderInput) {
  const user = await getUserFromCookies();
  if (!user) {
    throw new Error("User not found");
  }
  const order = await prisma.order.create({
    data: {
      sessionId: input.sessionId,
      userId: user.id,
      total: input.total,
      items: {
        create: input.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          note: item.note,
          basePrice: item.basePrice,
          addons: item.addons,
          total: item.total,
        })),
      },
    },
    include: {
      session: true,
      items: true,
    },
  });

  console.log("Order created:", order);

  return order;
}
