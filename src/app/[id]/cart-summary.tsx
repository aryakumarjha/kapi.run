import { useCart } from "@/lib/store/cart";
import React, { useCallback } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addItemToSession } from "@/lib/actions/order";
import { toast } from "sonner";
import type { Session } from "@prisma/client";
import { useRouter } from "next/navigation";

export const CartSummary = ({ session }: { session: Session }) => {
  const { items, totalAmount: total, removeItemByIndex, clearCart } = useCart();
  const router = useRouter();

  const formatInr = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = useCallback(async () => {
    try {
      // Add each item to the session individually
      const promises = items.map((item) =>
        addItemToSession({
          sessionId: session.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          note: item.note,
          basePrice: item.menuItem.basePrice,
          addons: item.selectedAddons
            .map((group) =>
              group.addons.map((addon) => ({
                name: addon.name,
                price: addon.price,
                groupId: group.groupId,
              }))
            )
            .flat(),
          total: item.total,
        })
      );

      await Promise.all(promises);
      clearCart();
      toast.success("Items added to session successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to add items. Please try again.");
      console.error("Adding items failed:", error);
    }
  }, [items, session.id, clearCart, router]);

  if (items.length === 0) {
    return (
      <Card className="w-full bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="rounded-full bg-muted p-3">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground text-center">
            Add items from the menu to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Cart</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => clearCart()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start justify-between space-x-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span className="font-medium">{formatInr(item.total)}</span>
                  </div>
                  {item.selectedAddons.map((group) => (
                    <div
                      key={group.groupId}
                      className="text-sm text-muted-foreground"
                    >
                      {group.addons.map((addon) => (
                        <Badge
                          key={addon.id}
                          variant="secondary"
                          className="mr-1 mb-1"
                        >
                          {addon.name}
                        </Badge>
                      ))}
                    </div>
                  ))}
                  {item.note && (
                    <p className="text-sm text-muted-foreground">
                      Note: {item.note}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeItemByIndex(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-lg font-medium">Total</div>
        <div className="text-lg font-medium">{formatInr(total)}</div>
      </CardFooter>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmit}>
          Add to Session
        </Button>
      </CardFooter>
    </Card>
  );
};
