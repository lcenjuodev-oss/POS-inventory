"use client";

export type PaymentMethod =
  | "cash"
  | "card"
  | "cheque"
  | "promissory-note"
  | "transfer"
  | "mobile"
  | "credit"
  | "other";

// paid: confirmed money; pending: waiting verification/due date; rejected: bounced/failed/cancelled
export type PaymentStatus = "paid" | "pending" | "rejected";

export interface Payment {
  id: string;
  orderId: string;
  date: string; // ISO datetime
  amount: number;
  method: PaymentMethod;
  reference?: string;
  bankName?: string;
  dueDate?: string; // ISO date for cheques/credit/promissory
  cashier: string;
  note?: string;
  status: PaymentStatus;
}

type Listener = (payments: Payment[]) => void;

let payments: Payment[] = [
  {
    id: "PAY-1",
    orderId: "CMD-1001",
    date: new Date().toISOString(),
    amount: 500,
    method: "cash",
    reference: "CASH-001",
    cashier: "Cashier 1",
    status: "paid"
  }
];

const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) {
    listener(payments);
  }
}

export function subscribePayments(listener: Listener) {
  listeners.add(listener);
  listener(payments);
  return () => {
    listeners.delete(listener);
  };
}

export function addPayment(payment: Payment) {
  payments = [payment, ...payments];
  emit();
}

export function voidPayment(paymentId: string) {
  // Completely remove the payment (used by the delete / trash action in UI)
  payments = payments.filter((p) => p.id !== paymentId);
  emit();
}

export function updatePaymentStatus(paymentId: string, status: PaymentStatus) {
  payments = payments.map((p) =>
    p.id === paymentId ? { ...p, status } : p
  );
  emit();
}


