import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "financial" | "academic" | "collaboration" | "wellness" | "career";
};

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  actions: {
    addNotification: (notification: Omit<Notification, "id" | "read" | "date">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
  };
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      actions: {
        addNotification: (notification) => {
          const newNotification: Notification = {
            id: Date.now().toString(),
            ...notification,
            date: new Date().toISOString(),
            read: false,
          };
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        },
        markAsRead: (id) => {
          set((state) => {
            const updatedNotifications = state.notifications.map((notification) =>
              notification.id === id ? { ...notification, read: true } : notification
            );
            
            const unreadCount = updatedNotifications.filter((n) => !n.read).length;
            
            return {
              notifications: updatedNotifications,
              unreadCount,
            };
          });
        },
        markAllAsRead: () => {
          set((state) => ({
            notifications: state.notifications.map((notification) => ({
              ...notification,
              read: true,
            })),
            unreadCount: 0,
          }));
        },
        deleteNotification: (id) => {
          set((state) => {
            const updatedNotifications = state.notifications.filter(
              (notification) => notification.id !== id
            );
            
            const unreadCount = updatedNotifications.filter((n) => !n.read).length;
            
            return {
              notifications: updatedNotifications,
              unreadCount,
            };
          });
        },
        clearAll: () => {
          set({ notifications: [], unreadCount: 0 });
        },
      },
    }),
    {
      name: "solus-nexus-notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);