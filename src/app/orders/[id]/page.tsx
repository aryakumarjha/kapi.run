import { getSessionWithItems } from "@/lib/actions/session";
import { notFound } from "next/navigation";
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
import { cache, memo } from "react";
import { User2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next/types";
import { OrderSession, OrderItem, getCachedOrderItems } from "./order-utils";

interface FinalOrderProps {
  params: Promise<{ id: string }>;
}

const getCachedSessionWithItems = cache(getSessionWithItems);

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;
  const session = await getCachedSessionWithItems(id);
  if (session) {
    const items = getCachedOrderItems(session as OrderSession);
    const hasItems = items.length > 0;
    return {
      title: "View Order Summary",
      description: !hasItems
        ? `No items in this order yet.`
        : `Order Summary for ${session.restaurantName} with ${items
            .map((item) => item.name)
            .join(", ")}. Total: ${formatInr(
            items.reduce(
              (acc, item) => acc + item.priceEach * item.totalQuanity,
              0
            )
          )}`,
    };
  }

  return {};
};

export default async function FinalOrder({ params }: FinalOrderProps) {
  const { id } = await params;
  const session = await getCachedSessionWithItems(id);

  if (!session) {
    notFound();
  }

  const data = getCachedOrderItems(session as OrderSession);

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
