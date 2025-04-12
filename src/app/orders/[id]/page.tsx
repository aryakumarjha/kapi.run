import { getSessionWithItems } from "@/lib/actions/session";
import { notFound } from "next/navigation";
import { Item, Session, SessionUser, User } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "date-fns";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { formatInr } from "@/lib/format-inr";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";
import { User2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FinalOrderProps {
  params: Promise<{ id: string }>;
}

interface ItemWithUser extends Item {
  user: User;
  addons:
    | {
        name: string;
        price: number;
        groupId: string;
      }[]
    | null;
}

interface OrderItem {
  id: string;
  totalQuanity: number;
  imageUrl?: string;
  name: string;
  priceEach: number;
  noVariant: boolean;
  variants: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    who: {
      id: string;
      name: string;
      quantity: number;
    }[];
  }[];
}

interface OrderSession extends Session {
  participants: SessionUser[];
  items: ItemWithUser[];
}

const createOrderItems = (session: OrderSession): OrderItem[] => {
  // Group items by orderId in one pass.
  const groups: Record<string, ItemWithUser[]> = {};
  for (const item of session.items) {
    if (!groups[item.orderId]) {
      groups[item.orderId] = [];
    }
    groups[item.orderId].push(item);
  }

  return Object.values(groups).map((groupItems) => {
    const firstItem = groupItems[0];
    const totalQuantity = groupItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    // Check if any item has addons.
    let hasAddons = false;
    for (const item of groupItems) {
      if (item.addons && item.addons.length > 0) {
        hasAddons = true;
        break;
      }
    }

    let variants: OrderItem["variants"] = [];
    if (!hasAddons) {
      variants = [
        {
          id: "regular",
          name: "Regular",
          price: 0, // No addon means a regular order.
          quantity: totalQuantity,
          who: groupItems.map((item) => ({
            id: item.user.id,
            name: item.user.name,
            quantity: item.quantity,
          })),
        },
      ];
    } else {
      // Use a Map to aggregate addons by name.
      const addonMap: Record<
        string,
        {
          price: number;
          groupId: string;
          quantity: number;
          who: Map<string, { id: string; name: string; quantity: number }>;
        }
      > = {};

      for (const item of groupItems) {
        if (item.addons && item.addons.length > 0) {
          for (const addon of item.addons) {
            if (!addonMap[addon.name]) {
              addonMap[addon.name] = {
                price: addon.price,
                groupId: addon.groupId,
                quantity: 0,
                who: new Map(),
              };
            }
            addonMap[addon.name].quantity += item.quantity;
            const userId = item.user.id;
            const existing = addonMap[addon.name].who.get(userId);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              addonMap[addon.name].who.set(userId, {
                id: item.user.id,
                name: item.user.name,
                quantity: item.quantity,
              });
            }
          }
        }
      }

      variants = Object.entries(addonMap).map(([addonName, data], index) => ({
        id: data.groupId + index,
        name: addonName,
        price: data.price,
        quantity: data.quantity,
        who: Array.from(data.who.values()),
      }));
    }

    return {
      id: firstItem.orderId,
      totalQuanity: totalQuantity,
      imageUrl: firstItem.image || undefined,
      name: firstItem.name,
      priceEach: firstItem.basePrice,
      variants,
      noVariant: !hasAddons,
    };
  });
};

export default async function FinalOrder({ params }: FinalOrderProps) {
  const { id } = await params;
  const session = await getSessionWithItems(id);

  if (!session) {
    notFound();
  }

  const data = createOrderItems(session as OrderSession);

  return (
    <main className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{session.restaurantName}</CardTitle>
          <CardDescription>
            <span>
              Created: {formatDate(session.createdAt, "PP h:mm a")} by{" "}
              {session.creatorName}
            </span>
            {session.cutoffTime && (
              <span>
                {" "}
                | Cutoff time: {formatDate(session.cutoffTime, "PP h:mm a")}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-8">
            {data.map((item) => (
              <li key={item.id}>
                <OrderTile {...item} />
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="border-t">
          <div className="flex items-center justify-between w-full font-semibold text-lg">
            <div>Total:</div>
            <div>
              {formatInr(
                data.reduce((acc, item) => {
                  return acc + item.priceEach * item.totalQuanity;
                }, 0)
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}

const OrderTile = memo((item: OrderItem) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 rounded-md">
          <AvatarImage
            src={item.imageUrl || "/placeholder.svg"}
            alt={item.name}
            className="object-cover"
          />
        </Avatar>
        <div className="flex flex-col gap-1">
          <span className="font-semibold flex items-center gap-2">
            {item.name}
            <Badge>{item.totalQuanity}</Badge>
          </span>
          <span className="text-sm flex gap-2">
            <span>Price: {formatInr(item.priceEach)}</span>
            {item.noVariant && (
              <span className="text-sm">
                {item.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="mr-2">
                      <User2 />
                      {variant.who
                        .map((who) => `${who.name} x${who.quantity}`)
                        .join(", ")}
                    </Badge>
                  </div>
                ))}
              </span>
            )}
          </span>
          {/* if there is no variant show who here instead*/}
        </div>
      </div>
      {!item.noVariant && (
        <div className="flex gap-6 ml-4">
          <Separator orientation="vertical" className="border-accent !h-auto" />
          <div className="border-l-2 border-accent bg-neutral-100 dark:bg-neutral-800 rounded-lg flex-1 p-4">
            {item.variants.map((variant, index, arr) => (
              <div key={variant.id} className="flex flex-col gap-4 text-sm">
                <span>
                  <Badge variant="outline" className="mr-2">
                    {variant.quantity}
                  </Badge>
                  <span className="font-semibold">With: </span>
                  {variant.name}
                  {variant.price > 0 && (
                    <span>
                      {" "}
                      +({formatInr(variant.price * variant.quantity)})
                    </span>
                  )}
                </span>
                <span className="text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="mr-2">
                      <User2 />
                      {variant.who
                        .map((who) => `${who.name} x${who.quantity}`)
                        .join(", ")}
                    </Badge>
                  </div>
                </span>
                {index != arr.length - 1 && <Separator className="mb-4" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

OrderTile.displayName = "Kapi_OrderTile";
