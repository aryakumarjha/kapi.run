import { getSession } from "@/lib/actions/session";
import { notFound } from "next/navigation";
import { getMenu } from "@/lib/actions/menu";
import SessionClient from "./session-client";
import type { Metadata } from "next/types";
import { cache } from "react";

const getCachedSession = cache(getSession);

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const id = await params;
  const session = await getCachedSession(id.id);
  if (session) {
    const participants = session.participants
      .map((p, index, arr) => {
        // add "and" before the last participant
        if (index === arr.length - 1 && arr.length > 1) {
          return `and ${p.user.name}`;
        }
        return p.user.name;
      })
      .join(", ");
    const participantsCount = session.participants.length;
    return {
      title: session.restaurantName,
      description:
        participantsCount > 1
          ? `Join ${participants} to order food from ${session.restaurantName} with Kapi.run`
          : `Order food from ${session.restaurantName} with Kapi.run`,
    };
  }
  return {};
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCachedSession(id);
  if (!session) {
    throw notFound();
  }

  const menu = await getMenu(session!.restaurantId, session.lat!, session.lng!);

  return <SessionClient session={session} menu={menu} />;
}
