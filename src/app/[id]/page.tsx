import { getSession } from "@/lib/actions/session";
import { notFound } from "next/navigation";
import Menu from "./menu";
import MenuHeader from "./header";
import { getMenu } from "@/lib/actions/menu";

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

  return (
    <div className="space-y-4">
      <MenuHeader session={session} />
      <main className="@container/menu container mx-auto flex-1">
        <Menu menu={menu} />{" "}
      </main>
    </div>
  );
}
