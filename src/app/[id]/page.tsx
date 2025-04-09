import { getSession } from "@/lib/actions/session";
import { notFound } from "next/navigation";
import { getMenu } from "@/lib/actions/menu";
import SessionClient from "./session-client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) {
    throw notFound();
  }

  const menu = await getMenu(session!.restaurantId, session.lat!, session.lng!);

  return <SessionClient session={session} menu={menu} />;
}
