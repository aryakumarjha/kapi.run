import { getSessionWithItems } from "@/lib/actions/session";

interface FinalOrderProps {
  params: Promise<{ id: string }>;
}

export default async function FinalOrder({ params }: FinalOrderProps) {
  const { id } = await params;
  const items = await getSessionWithItems(id);
  return (
    <div>
      Order ID: {id}
      <br />
      Session Details: <pre>{JSON.stringify(items, null, 2)}</pre>
    </div>
  );
}
