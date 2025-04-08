import { getSession } from "@/lib/actions/session";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession(id);
  return <div>{session?.restaurantName || "Unknown Restaurant"}</div>;
}
