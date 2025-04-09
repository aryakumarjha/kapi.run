import { create } from "zustand";
import { type SimplifiedMenuItem, type Addon } from "@/types/menu";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartItem {
  menuItem: SimplifiedMenuItem;
  quantity: number;
  selectedAddons: {
    groupId: string;
    addons: Addon[];
  }[];
  note?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => ({
          items: [...state.items, item],
        }));
      },
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.menuItem.id !== itemId),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalAmount: () => {
        return get().items.reduce((total, item) => {
          const addonsCost = item.selectedAddons.reduce(
            (acc, group) =>
              acc + group.addons.reduce((sum, addon) => sum + addon.price, 0),
            0
          );
          return total + (item.menuItem.basePrice + addonsCost) * item.quantity;
        }, 0);
      },
    }),
    { name: "cart-storage", storage: createJSONStorage(() => localStorage) }
  )
);
