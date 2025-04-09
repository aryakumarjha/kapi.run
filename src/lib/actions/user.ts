"use server";

import { prisma } from "@/lib/prisma";

interface CreateUserParams {
  id: string;
  name: string;
  sessionId: string;
}

export const createUser = async ({ id, name, sessionId }: CreateUserParams) => {
  const user = await prisma.user.create({
    data: {
      id,
      name,
      sessionId,
    },
  });

  return user;
};

export const getUserBySession = async (sessionId: string, userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      sessionId,
    },
  });

  return user;
};
