import { getSessionWithItems } from "@/lib/actions/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatInr } from "@/lib/format-inr";
import { notFound } from "next/navigation";
import { Item, User } from "@prisma/client";

interface FinalOrderProps {
  params: Promise<{ id: string }>;
}

type ItemWithUser = Item & {
  user: User;
};

type ParsedAddons = Array<{
  name: string;
  price: number;
  groupId: string;
}>;

export default async function FinalOrder({ params }: FinalOrderProps) {
  const { id } = await params;
  const session = await getSessionWithItems(id);

  if (!session) {
    notFound();
  }

  // Group items by userName
  const itemsByUser = (session.items as ItemWithUser[]).reduce<
    Record<string, { items: ItemWithUser[]; total: number }>
  >((acc, item) => {
    const userName = item.user?.name || "Unknown";
    if (!acc[userName]) {
      acc[userName] = {
        items: [],
        total: 0,
      };
    }
    acc[userName].items.push(item);
    acc[userName].total += item.total;
    return acc;
  }, {});

  const totalAmount = session.items.reduce((sum, item) => sum + item.total, 0);

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{session.restaurantName}</h1>
          <p className="text-muted-foreground">
            Created by {session.creatorName}
          </p>
        </div>
        {session.cutoffTime && (
          <div className="text-muted-foreground">
            Cutoff time: {new Date(session.cutoffTime).toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(itemsByUser).map(([userName, { items, total }]) => (
          <Card key={userName} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{userName}</span>
                <span className="text-lg">{formatInr(total)}</span>
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="space-y-4">
                {items.map((item, index) => {
                  const addons = (item.addons as ParsedAddons) || [];
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.name}</h3>
                            <span className="text-sm text-muted-foreground">
                              ×{item.quantity}
                            </span>
                          </div>
                          {addons.length > 0 && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {addons.map((addon, i) => (
                                <div key={`${addon.name}-${i}`}>
                                  + {addon.name} ({formatInr(addon.price)})
                                </div>
                              ))}
                            </div>
                          )}
                          {item.note && (
                            <div className="text-sm text-muted-foreground mt-1 italic">
                              Note: {item.note}
                            </div>
                          )}
                        </div>
                        <div className="font-medium">
                          {formatInr(item.total)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </ScrollArea>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <CardTitle>Total Amount</CardTitle>
          <span className="text-2xl font-semibold">
            {formatInr(totalAmount)}
          </span>
        </CardContent>
      </Card>
    </main>
  );
}
