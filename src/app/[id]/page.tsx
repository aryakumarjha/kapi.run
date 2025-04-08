import { getMenu } from "@/lib/actions/menu";
import { getSession } from "@/lib/actions/session";
import { notFound } from "next/navigation";

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
  const menu = await getMenu(session!.restaurantId, 12.9753, 77.591);
  return (
    <div>
      <pre>{JSON.stringify(menu, null, 2)}</pre>
    </div>
  );
}
