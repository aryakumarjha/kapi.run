import { Item, Session, SessionUser, User } from "@prisma/client";
import { cache } from "react";

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
          console.log("item.addons", item.addons);
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

const getCachedOrderItems = cache(createOrderItems);

export {
  createOrderItems,
  getCachedOrderItems,
  type OrderSession,
  type OrderItem,
};
