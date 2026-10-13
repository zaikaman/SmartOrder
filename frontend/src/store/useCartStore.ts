import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem } from '../types';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  note?: string;
}

interface CartState {
  items: CartItem[];
  tableId: number | null;
  tableNumber: string | null;
  setTable: (tableId: number, tableNumber: string) => void;
  addItem: (item: MenuItem, quantity?: number, note?: string) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  updateNote: (menuItemId: number, note: string) => void;
  removeItem: (menuItemId: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalQuantity: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      tableNumber: null,

      setTable: (tableId: number, tableNumber: string) => {
        set({ tableId, tableNumber });
      },

      addItem: (item: MenuItem, quantity = 1, note = '') => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.menuItem.id === item.id);

        if (existingIndex > -1) {
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += quantity;
          if (note) {
            updatedItems[existingIndex].note = note;
          }
          set({ items: updatedItems });
        } else {
          set({
            items: [...items, { menuItem: item, quantity, note }],
          });
        }
      },

      updateQuantity: (menuItemId: number, quantity: number) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter((i) => i.menuItem.id !== menuItemId) });
        } else {
          set({
            items: items.map((i) =>
              i.menuItem.id === menuItemId ? { ...i, quantity } : i
            ),
          });
        }
      },

      updateNote: (menuItemId: number, note: string) => {
        const { items } = get();
        set({
          items: items.map((i) =>
            i.menuItem.id === menuItemId ? { ...i, note } : i
          ),
        });
      },

      removeItem: (menuItemId: number) => {
        const { items } = get();
        set({ items: items.filter((i) => i.menuItem.id !== menuItemId) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalAmount: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.menuItem.price * item.quantity,
          0
        );
      },

      getTotalQuantity: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
