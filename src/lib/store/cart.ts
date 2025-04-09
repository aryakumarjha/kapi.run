import { create } from "zustand";
import { type SimplifiedMenuItem, type Addon, Variant } from "@/types/menu";
import { createJSONStorage, persist } from "zustand/middleware";
import { nanoid } from "nanoid";

interface CartItem {
  menuItem: SimplifiedMenuItem;
  quantity: number;
  selectedVariants: {
    groupId: string;
    variant: Variant;
  }[];
  selectedAddons: {
    groupId: string;
    addons: Addon[];
  }[];
  note?: string;
}

interface CartItemWithIdAndTotal extends CartItem {
  id: string;
  total: number;
}

interface CartStore {
  items: CartItemWithIdAndTotal[];
  totalAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  removeItemByIndex: (index: number) => void;
  clearCart: () => void;
}

const defaultZero = (num: number) => (isNaN(num) ? 0 : num);

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      addItem: (item) => {
        const cartItem: CartItemWithIdAndTotal = {
          ...item,
          id: nanoid(),
          // calculate total with addons
          total:
            (item.selectedVariants.length > 0
              ? item.selectedVariants.reduce(
                  (sum, { variant }) => sum + defaultZero(variant.price),
                  0
                )
              : defaultZero(item.menuItem.basePrice)) +
            item.selectedAddons.reduce(
              (acc, group) =>
                acc +
                group.addons.reduce(
                  (sum, addon) => sum + defaultZero(addon.price),
                  0
                ),
              0
            ) *
              item.quantity,
        };

        set((state) => ({
          items: [...state.items, cartItem],
          totalAmount: state.totalAmount + defaultZero(cartItem.total),
        }));
      },
      removeItem: (itemId) => {
        const items = get().items;
        const itemIndex = items.findIndex((item) => item.id === itemId);
        if (itemIndex === -1) return;
        const newCartItems = items.filter((_, index) => index !== itemIndex);
        set((state) => ({
          items: newCartItems,
          totalAmount: state.totalAmount - defaultZero(items[itemIndex].total),
        }));
      },

      removeItemByIndex: (index) => {
        const items = get().items;
        if (index < 0 || index >= items.length) return;
        const newCartItems = items.filter((_, i) => i !== index);
        set((state) => ({
          items: newCartItems,
          totalAmount: state.totalAmount - defaultZero(items[index].total),
        }));
      },

      clearCart: () => set({ items: [], totalAmount: 0 }),
    }),
    { name: "cart-storage", storage: createJSONStorage(() => localStorage) }
  )
);
