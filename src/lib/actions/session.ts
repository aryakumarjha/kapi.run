"use server";

import { prisma } from "@/lib/prisma";

export const createSession = async (form: FormData) => {
  const session = await prisma.session.create({
    data: {
      creatorName: form.get("creator-name") as string,
      restaurantId: form.get("restaurant-id") as string,
      restaurantName: form.get("restaurant-name") as string,
      cutoffTime: new Date(form.get("cut-off-time") as string),
      createdAt: new Date(),
    },
  });

  return session;
};

export const getSession = async (id: string) => {
  const session = await prisma.session.findFirst({
    where: {
      id,
    },
  });

  return session;
};
