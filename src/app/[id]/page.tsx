import { getSession } from "@/lib/actions/session";
import { notFound } from "next/navigation";
import Menu from "./menu";
import MenuHeader from "./header";

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

  return (
    <>
      <MenuHeader session={session} />
      <main className="@container/menu container mx-auto flex-1">
        <Menu session={session} />{" "}
      </main>
    </>
  );
}
