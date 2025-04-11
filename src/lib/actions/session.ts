"use server";

import { prisma } from "@/lib/prisma";
import { isAfter } from "date-fns/isAfter";
import { redirect } from "next/navigation";

export const createSession = async (form: FormData) => {
  const session = await prisma.session.create({
    data: {
      creatorName: form.get("creator-name") as string,
      creatorId: form.get("user-id") as string,
      restaurantId: form.get("restaurant-id") as string,
      restaurantName: form.get("restaurant-name") as string,
      cutoffTime: new Date(form.get("cut-off-time") as string),
      lat: parseFloat(form.get("lat") as string),
      lng: parseFloat(form.get("lng") as string),
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
    include: {
      participants: true,
    },
  });

  if (session && session.cutoffTime) {
    const currentTime = new Date();
    if (isAfter(currentTime, session.cutoffTime)) {
      // redirect to order page if the cutoff time has passed
      return redirect(`/orders/${session.id}`);
    }
  }

  return session;
};

export const getSessionWithItems = async (id: string) => {
  const session = await prisma.session.findFirst({
    where: {
      id,
    },
    include: {
      participants: true,
      items: true,
    },
  });

  return session;
};

export const joinSession = async (form: FormData) => {
  const link = form.get("kapi-session-link") as string;
  const sessionId = link.split("/").pop() as string;
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  // No need to check for user here since we handle that on the client side
  // This keeps the server action simple and allows client-side user state management
  return redirect(`/${sessionId}`);
};

export const isSessionCreator = async (sessionId: string, userId: string) => {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      creatorId: userId,
    },
  });

  return !!session;
};

export const getAllSessionIds = async () => {
  const sessions = await prisma.session.findMany({
    select: {
      id: true,
    },
  });

  return sessions.map((session) => session.id);
};
