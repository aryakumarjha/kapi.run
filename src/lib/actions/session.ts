"use server";

import { prisma } from "@/lib/prisma";
import { addHours, isAfter } from "date-fns";
import { redirect } from "next/navigation";

export const createSession = async (form: FormData) => {
  const session = await prisma.session.create({
    data: {
      creatorName: form.get("creator-name") as string,
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
  });

  // check for cutoff time
  if (session && session.cutoffTime) {
    const currentTime = new Date();
    if (isAfter(currentTime, addHours(session.cutoffTime, 12))) {
      return null; // Session has expired
    }
  }

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
