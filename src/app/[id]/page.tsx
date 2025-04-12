import { getSession } from "@/lib/actions/session";
import { notFound } from "next/navigation";
import { getMenu } from "@/lib/actions/menu";
import SessionClient from "./session-client";

// TODO: removing this temporarily until we have a better way to handle static params
// export async function generateStaticParams() {
//   const sessionsIds = await getAllSessionIds();
//   return sessionsIds.map((id) => ({
//     id,
//   }));
// }

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
