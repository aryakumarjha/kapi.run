"use server";

import { prisma } from "@/lib/prisma";
import { setUserCookie, getUserFromCookies } from "../cookies";

interface CreateUserParams {
  id: string;
  name: string;
}

export const createUser = async ({ id, name }: CreateUserParams) => {
  const user = await prisma.user.create({
    data: {
      id,
      name,
    },
  });

  // Set user cookie after creating user
  await setUserCookie(id, name);
  return user;
};

export const getUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
};

export const getCurrentUser = async () => {
  return await getUserFromCookies();
};

export const joinSession = async (userId: string, sessionId: string) => {
  const participation = await prisma.sessionUser.create({
    data: {
      userId,
      sessionId,
    },
  });

  return participation;
};

export const leaveSession = async (userId: string, sessionId: string) => {
  await prisma.sessionUser.deleteMany({
    where: {
      userId,
      sessionId,
    },
  });
};

export const isUserInSession = async (userId: string, sessionId: string) => {
  const participation = await prisma.sessionUser.findFirst({
    where: {
      userId,
      sessionId,
    },
  });

  return !!participation;
};
