import { useCart } from "./store";
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
import { addAllItemToSession } from "@/lib/actions/order";
import { toast } from "sonner";
import type { Session } from "@prisma/client";
import { useRouter } from "next/navigation";
import { formatInr } from "@/lib/format-inr";

export interface CartSummaryProps {
  session: Session;
}

export const CartSummary = ({ session }: CartSummaryProps) => {
  const { items, totalAmount: total, removeItemByIndex, clearCart } = useCart();
  const router = useRouter();

  const handleSubmit = useCallback(async () => {
    try {
      // Add each item to the session individually
      const allItems = items.map((item) => ({
        id: item.menuItem.id,
        sessionId: session.id,
        image: item.menuItem.imageUrl,
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
      }));

      await addAllItemToSession(allItems);
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
      <Card className="w-full md:w-1/3 sticky top-4 h-[300px] flex flex-col justify-center">
        <CardContent>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p>Add items from the menu to start your order</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full md:w-1/3 h-fit sticky top-[116px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Your Cart
          <Badge variant="secondary">{items.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <ScrollArea className="max-h-1/2">
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.menuItem.name}</h3>
                    {item.menuItem.isVeg !== undefined && (
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.menuItem.isVeg ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                    )}
                  </div>
                  {item.selectedVariants.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {item.selectedVariants.map((variant) => (
                        <div key={variant.variant.id}>
                          {variant.groupName}: {variant.variant.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.selectedAddons.map((group) => (
                    <div
                      key={group.groupId}
                      className="text-sm text-muted-foreground"
                    >
                      {group.groupName || "Add On"}:{" "}
                      {group.addons.map((addon) => addon.name).join(", ")}
                    </div>
                  ))}
                </div>
                <div className="text-right flex items-center gap-2">
                  <div className="font-medium">{formatInr(item.total)}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-neutral-500 hover:text-red-500 cursor-pointer"
                    onClick={() => removeItemByIndex(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </ScrollArea>
      <CardFooter className="flex flex-col gap-4 border-t pt-4">
        <div className="flex items-center justify-between w-full">
          <span className="font-medium">Total Amount</span>
          <span className="font-medium">{formatInr(total)}</span>
        </div>
        <Button className="w-full cursor-pointer" onClick={handleSubmit}>
          Place Order
        </Button>
      </CardFooter>
    </Card>
  );
};
