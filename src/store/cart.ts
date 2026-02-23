import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types
export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
}

interface CartState {
    items: CartItem[];
    // Computed values
    itemCount: number;
    total: number;
}

interface CartActions {
    addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
}

type CartStore = CartState & CartActions;

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]) => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { itemCount, total };
};

// Create the store
export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            // Initial state
            items: [],
            itemCount: 0,
            total: 0,

            // Actions
            addItem: (product, quantity = 1) => {
                set((state) => {
                    const existingItem = state.items.find((item) => item.id === product.id);

                    let newItems: CartItem[];
                    if (existingItem) {
                        // Update existing item quantity
                        newItems = state.items.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                    } else {
                        // Add new item
                        newItems = [...state.items, { ...product, quantity }];
                    }

                    const { itemCount, total } = calculateTotals(newItems);
                    return { items: newItems, itemCount, total };
                });
            },

            removeItem: (productId) => {
                set((state) => {
                    const newItems = state.items.filter((item) => item.id !== productId);
                    const { itemCount, total } = calculateTotals(newItems);
                    return { items: newItems, itemCount, total };
                });
            },

            updateQuantity: (productId, quantity) => {
                set((state) => {
                    if (quantity <= 0) {
                        // Remove item if quantity is 0 or negative
                        const newItems = state.items.filter((item) => item.id !== productId);
                        const { itemCount, total } = calculateTotals(newItems);
                        return { items: newItems, itemCount, total };
                    }

                    const newItems = state.items.map((item) =>
                        item.id === productId ? { ...item, quantity } : item
                    );
                    const { itemCount, total } = calculateTotals(newItems);
                    return { items: newItems, itemCount, total };
                });
            },

            clearCart: () => {
                set({ items: [], itemCount: 0, total: 0 });
            },
        }),
        {
            name: 'cart-storage', // localStorage key
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Selectors for optimized re-renders
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () => useCartStore((state) => state.itemCount);
export const useCartTotal = () => useCartStore((state) => state.total);
