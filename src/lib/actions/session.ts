"use server";

import { prisma } from "@/lib/prisma";
import { addHours, isAfter } from "date-fns";

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
