import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  user: any | null;
  setUser: (user: any) => void;
  clearUser: () => void;
}

export const useUserStore = create(
  persist<UserState>(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage", // key in localStorage
    }
  )
);
