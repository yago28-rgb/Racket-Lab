"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ShippingZone } from "@/lib/shipping";

export type OrderStatus = "demo" | "paid" | "pending-payment";

export interface OrderLine {
  racketId: string;
  name: string;
  grip: string;
  stringing: boolean;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  email: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  zone: ShippingZone;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  stripeSessionId?: string;
}

/**
 * Local order history (this browser only). In production, orders are persisted
 * server-side from the Stripe webhook — see README "Pedidos".
 */
interface OrdersState {
  orders: Order[];
  addOrder: (o: Order) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
}

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders.filter((x) => x.id !== o.id)] })),
      updateStatus: (id, status) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
    }),
    { name: "racketlab-orders", storage: createJSONStorage(() => localStorage) },
  ),
);
