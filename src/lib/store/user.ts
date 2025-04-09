import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserState {
  id: string | null;
  name: string | null;
  setUser: (id: string, name: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      setUser: (id: string, name: string) => set({ id, name }),
      clearUser: () => set({ id: null, name: null }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
