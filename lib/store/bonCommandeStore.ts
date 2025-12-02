"use client";

export type BonCommandeStatus = "pending" | "cancelled";

export interface BonCommandeItem {
  productId: string;
  name: string;
  reference: string;
  quantity: number;
  unitPrice: number;
}

export interface BonCommande {
  id: string;
  clientName: string;
  clientPhone: string;
  sellerName: string;
  date: string; // ISO date string
  status: BonCommandeStatus;
  totalAmount: number;
  items: BonCommandeItem[];
}

type Listener = (orders: BonCommande[]) => void;

// Seed with a couple of example pending / cancelled orders
let orders: BonCommande[] = [
  {
    id: "CMD-1001",
    clientName: "John Doe",
    clientPhone: "+212 600-000000",
    sellerName: "Seller A",
    date: "2024-06-21",
    status: "pending",
    totalAmount: 1475,
    items: []
  },
  {
    id: "CMD-1002",
    clientName: "Jane Smith",
    clientPhone: "+212 611-123456",
    sellerName: "Seller B",
    date: "2024-06-21",
    status: "cancelled",
    totalAmount: 875,
    items: []
  }
];

const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) {
    listener(orders);
  }
}

export function subscribeBonCommandes(listener: Listener) {
  listeners.add(listener);
  // Immediately send current value
  listener(orders);
  return () => {
    listeners.delete(listener);
  };
}

export function upsertBonCommande(order: BonCommande) {
  const index = orders.findIndex((o) => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders = [order, ...orders];
  }
  emit();
}

export function getBonCommande(id: string): BonCommande | null {
  return orders.find((o) => o.id === id) ?? null;
}


