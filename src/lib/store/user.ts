import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserState {
  id: string | null;
  name: string | null;
  setUser: (id: string, name: string) => void;
  clearUser: () => void;
  rehydrayted: boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      setUser: (id: string, name: string) => set({ id, name }),
      clearUser: () => set({ id: null, name: null }),
      rehydrayted: false,
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize(state) {
        return { id: state.id, name: state.name };
      },
      onRehydrateStorage() {
        return () => {
          useUserStore.setState({ rehydrayted: true });
        };
      },
    }
  )
);
