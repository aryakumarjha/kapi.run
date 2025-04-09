"use server";

import { prisma } from "../prisma";

export type PlaceOrderInput = {
  sessionId: string;
  userId: string;
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
  const order = await prisma.order.create({
    data: {
      sessionId: input.sessionId,
      userId: input.userId,
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
      items: true,
    },
  });

  return order;
}
