"use server";

import { prisma } from "@/lib/prisma";

export const getUserSessions = async (userId: string) => {
  const sessions = await prisma.session.findMany({
    where: {
      creatorId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      restaurantName: true,
      cutoffTime: true,
      createdAt: true,
    },
  });

  return sessions;
};
