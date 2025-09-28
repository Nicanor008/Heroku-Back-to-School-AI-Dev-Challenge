import { create } from "zustand";

interface State {
    userRole: "student" | "parent" | "educator" | null;
    loading: boolean;
    notifications: string[];
    setUserRole: (role: State["userRole"]) => void;
    setLoading: (loading: boolean) => void;
    addNotification: (msg: string) => void;
    clearNotifications: () => void;
}

export const useStore = create<State>((set) => ({
    userRole: null,
    loading: false,
    notifications: [],
    setUserRole: (role) => set({ userRole: role }),
    setLoading: (loading) => set({ loading }),
    addNotification: (msg) => set((state) => ({ notifications: [...state.notifications, msg] })),
    clearNotifications: () => set({ notifications: [] }),
}));
