"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import {
  type BonCommande,
  subscribeBonCommandes
} from "@/lib/store/bonCommandeStore";
import {
  type Payment,
  subscribePayments,
  addPayment,
  voidPayment,
  updatePaymentStatus
} from "@/lib/store/paymentStore";
import {
  Search,
  Filter,
  WalletCards,
  AlertCircle,
  CreditCard,
  Receipt,
  Trash2,
  X
} from "lucide-react";

type PaymentFormState = {
  amount: number;
  method: Payment["method"];
  reference: string;
  bankName: string;
  dueDate: string; // ISO date (yyyy-mm-dd) for cheque/credit/promissory
  cashier: string; // kept internal, not editable in UI
  status: Payment["status"]; // paid or pending
  date: string;
  note: string;
};

export default function CaissePage() {
  const [orders, setOrders] = useState<BonCommande[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "day" | "week" | "month">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "new" | "pending" | "partially paid" | "confirmed"
  >("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(() => ({
    amount: 0,
    method: "cash",
    reference: "",
    bankName: "",
    dueDate: "",
    cashier: "Cashier 1",
    status: "paid",
    date: new Date().toISOString(),
    note: ""
  }));
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const unsubOrders = subscribeBonCommandes(setOrders);
    const unsubPayments = subscribePayments(setPayments);
    return () => {
      unsubOrders();
      unsubPayments();
    };
  }, []);

  // Auto-hide feedback messages after a short delay
  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => {
      setFeedback(null);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  function getOrderTotals(order: BonCommande) {
    // Only payments with status "paid" count as received money
    const orderPayments = payments.filter((p) => p.orderId === order.id);
    const paidPayments = orderPayments.filter((p) => p.status === "paid");
    const paid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, order.totalAmount - paid);

    const hasPaid = paid > 0;
    const hasPending = orderPayments.some((p) => p.status === "pending");
    const hasRejected = orderPayments.some((p) => p.status === "rejected");

    const status =
      remaining === 0
        ? "confirmed"
        : hasPaid
        ? "partially paid"
        : hasPending || hasRejected
        ? "pending"
        : "new";

    // Basic derivation for demo: subtotal = sum of item lines, tax = diff
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const taxes = Math.max(0, order.totalAmount - subtotal);

    return { paid, remaining, status, subtotal, taxes, hasRejected };
  }

  const pendingOrders = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    return orders.filter((order) => {
      const { status } = getOrderTotals(order);

      // Status filter
      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      // Date filter (order.date is ISO yyyy-mm-dd)
      if (dateFilter !== "all") {
        const orderDate = new Date(order.date);
        const diffDays = Math.floor(
          (today.getTime() -
            new Date(
              orderDate.getFullYear(),
              orderDate.getMonth(),
              orderDate.getDate()
            ).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (dateFilter === "day" && order.date !== todayStr) {
          return false;
        }
        if (dateFilter === "week" && diffDays > 7) {
          return false;
        }
        if (
          dateFilter === "month" &&
          !(
            orderDate.getFullYear() === today.getFullYear() &&
            orderDate.getMonth() === today.getMonth()
          )
        ) {
          return false;
        }
      }

      // Text search
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        order.id.toLowerCase().includes(q) ||
        order.clientName.toLowerCase().includes(q) ||
        order.clientPhone.toLowerCase().includes(q)
      );
    });
  }, [orders, search, payments, dateFilter, statusFilter]);

  const selectedOrder = useMemo(
    () =>
      (selectedOrderId
        ? orders.find((o) => o.id === selectedOrderId)
        : pendingOrders[0]) ?? null,
    [orders, pendingOrders, selectedOrderId]
  );

  const selectedOrderTotals = selectedOrder
    ? getOrderTotals(selectedOrder)
    : null;
  const selectedOrderPayments = selectedOrder
    ? payments.filter((p) => p.orderId === selectedOrder.id)
    : [];

  const remainingAmount = selectedOrderTotals?.remaining ?? 0;

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let totalPending = 0;
    let pendingCount = 0;
    let partialCount = 0;

    for (const order of orders) {
      const { remaining, status } = getOrderTotals(order);
      if (remaining > 0) {
        totalPending += remaining;
        if (status === "new") pendingCount += 1;
        if (status === "pending") pendingCount += 1;
        if (status === "partially paid") partialCount += 1;
      }
    }

    let todayPaymentsAmount = 0;
    let todayPaymentsCount = 0;
    for (const p of payments) {
      if (p.status !== "paid") continue;
      if (p.date.slice(0, 10) === today) {
        todayPaymentsAmount += p.amount;
        todayPaymentsCount += 1;
      }
    }

    return {
      totalPending,
      pendingCount,
      partialCount,
      todayPaymentsAmount,
      todayPaymentsCount
    };
  }, [orders, payments]);

  const handleOpenPaymentModal = (payFull = false) => {
    if (!selectedOrder || !selectedOrderTotals) return;
    const amount = payFull ? selectedOrderTotals.remaining : selectedOrderTotals.remaining;
    setPaymentForm({
      amount,
      method: "cash",
      reference: "",
      bankName: "",
      dueDate: "",
      cashier: "Cashier 1",
      status: "paid",
      date: new Date().toISOString(),
      note: ""
    });
    setPaymentErrors({});
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedOrder || !selectedOrderTotals) return;
    const errors: Record<string, string> = {};
    const isCredit = paymentForm.method === "credit";
    const isChequeOrPromissory =
      paymentForm.method === "cheque" || paymentForm.method === "promissory-note";

    if (!isCredit && paymentForm.amount <= 0) {
      errors.amount = "Amount must be greater than 0.";
    }
    if (paymentForm.amount > selectedOrderTotals.remaining + 0.0001) {
      errors.amount = "Amount cannot exceed remaining balance.";
    }

    if (isCredit && !paymentForm.dueDate) {
      errors.dueDate = "Due date is required for credit payments.";
    }
    if (isChequeOrPromissory) {
      if (!paymentForm.reference) {
        errors.reference = "Reference number is required for cheque/promissory.";
      }
      if (!paymentForm.bankName) {
        errors.bankName = "Bank name is required for cheque/promissory.";
      }
      if (!paymentForm.dueDate) {
        errors.dueDate = "Deposit/due date is required for cheque/promissory.";
      }
    }
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payment: Payment = {
      id: `PAY-${Date.now()}`,
      orderId: selectedOrder.id,
      date: paymentForm.date,
      amount: paymentForm.amount,
      method: paymentForm.method,
      reference: paymentForm.reference || undefined,
      bankName: paymentForm.bankName || undefined,
      dueDate: paymentForm.dueDate || undefined,
      cashier: paymentForm.cashier,
      note: paymentForm.note || undefined,
      status: paymentForm.status
    };

    addPayment(payment);
    setPaymentModalOpen(false);
    setFeedback({
      type: "success",
      message: "Payment recorded successfully."
    });
  };

  const handleVoidPayment = (paymentId: string) => {
    if (!confirm("Void this payment? This action cannot be undone.")) return;
    voidPayment(paymentId);
    setFeedback({
      type: "success",
      message: "Payment voided."
    });
  };

  const handleChangePaymentStatus = (paymentId: string, status: Payment["status"]) => {
    updatePaymentStatus(paymentId, status);
    setFeedback({
      type: "success",
      message: "Payment status updated."
    });
  };

  const handlePrintInvoice = () => {
    if (!selectedOrder) return;
    alert(`Invoice for ${selectedOrder.id} would be generated here.`);
  };

  const handlePrintReceipt = (payment: Payment) => {
    alert(`Receipt for payment ${payment.id} would be printed here.`);
  };

  return (
    <div className="space-y-6">
      <Header role="manager" name="Cashier" />

      {feedback && (
        <div
          className={`rounded-xl border px-3 py-2 text-xs ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Top statistics */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-slate-50 shadow-md">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-300">
              Total pending
            </p>
            <p className="mt-1 text-xl font-semibold">
              MAD {stats.totalPending.toFixed(2)}
            </p>
            <p className="mt-1 text-[11px] text-slate-300">
              {stats.pendingCount + stats.partialCount} open orders
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-amber-300">
            <WalletCards className="h-5 w-5" />
          </div>
        </Card>

        <Card className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 shadow-md">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-emerald-700/80">
              Today payments
            </p>
            <p className="mt-1 text-xl font-semibold text-emerald-900">
              MAD {stats.todayPaymentsAmount.toFixed(2)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-700/80">
              {stats.todayPaymentsCount} transaction
              {stats.todayPaymentsCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-emerald-600">
            <CreditCard className="h-5 w-5" />
          </div>
        </Card>

        <Card className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 shadow-md">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-amber-800/80">
              Partially paid
            </p>
            <p className="mt-1 text-xl font-semibold text-amber-900">
              {stats.partialCount}
            </p>
            <p className="mt-1 text-[11px] text-amber-800/80">
              Orders with remaining balance
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-amber-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 shadow-md">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Fully paid (not listed)
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {
                orders.filter(
                  (o) => getOrderTotals(o).remaining === 0
                ).length
              }
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Completed orders today & earlier
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500">
            <Receipt className="h-5 w-5" />
          </div>
        </Card>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)]">
        {/* Left: Pending orders */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Pending payments
              </h2>
              <p className="text-xs text-slate-500">
                Select an order to process payments.
              </p>
            </div>
            <WalletCards className="h-5 w-5 text-slate-400" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order ID, client name, or phone..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <Filter className="h-3 w-3 text-slate-400" />
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <select
                    value={dateFilter}
                    onChange={(e) =>
                      setDateFilter(e.target.value as "all" | "day" | "week" | "month")
                    }
                    className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="all">All</option>
                    <option value="day">Last day</option>
                    <option value="week">Last week</option>
                    <option value="month">Last month</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as
                          | "all"
                          | "new"
                          | "pending"
                          | "partially paid"
                          | "confirmed"
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="all">All</option>
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="partially paid">Partially paid</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-100 bg-white">
              <table className="min-w-full text-[11px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Order</th>
                    <th className="px-3 py-2 text-left">Customer</th>
                    <th className="px-3 py-2 text-left">Total</th>
                    <th className="px-3 py-2 text-left">Paid</th>
                    <th className="px-3 py-2 text-left">Remaining</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-4 text-center text-xs text-slate-400"
                      >
                        No pending payments.
                      </td>
                    </tr>
                  ) : (
                    pendingOrders.map((order) => {
                      const { paid, remaining, status, hasRejected } =
                        getOrderTotals(order);
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <tr
                          key={order.id}
                          className={`cursor-pointer border-l-2 ${
                            isSelected
                              ? "border-slate-900 bg-slate-900/5"
                              : "border-transparent hover:border-slate-300 hover:bg-slate-50/80"
                          }`}
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          <td className="px-3 py-2 text-slate-500">
                            {order.date}
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-800">
                            {order.id}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {order.clientName}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-700">
                            {order.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600">
                            {paid.toFixed(2)}
                          </td>
                          <td
                            className={`px-3 py-2 text-right font-semibold ${
                              remaining > 0 ? "text-amber-700" : "text-slate-500"
                            }`}
                          >
                            {remaining.toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                status === "confirmed"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : status === "pending" || status === "partially paid"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-blue-50 text-blue-700" // new
                              }`}
                            >
                              {hasRejected && (
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                              )}
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Right: Order details & payment management */}
        <div className="space-y-4">
          {!selectedOrder || !selectedOrderTotals ? (
            <Card className="flex items-center justify-center py-16 text-xs text-slate-400">
              Select an order on the left to view details and process payments.
            </Card>
          ) : (
            <>
              {/* Order overview */}
              <Card className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Order
                    </p>
                    <h2 className="text-sm font-semibold text-slate-900">
                      {selectedOrder.id}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
                        selectedOrderTotals.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700"
                          : selectedOrderTotals.status === "partially paid" ||
                            selectedOrderTotals.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700" // new
                      }`}
                    >
                      <CreditCard className="h-3 w-3" />
                      {selectedOrderTotals.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {selectedOrder.date}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Customer</span>
                    <span className="font-medium text-slate-800">
                      {selectedOrder.clientName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phone</span>
                    <span>{selectedOrder.clientPhone}</span>
                  </div>
                </div>
              </Card>

              {/* Products list + payment summary */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)]">
                <Card className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900">
                    Order items
                  </h3>
                  <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                    <table className="min-w-full text-[11px]">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-3 py-2 text-left">Product</th>
                          <th className="px-3 py-2 text-right">Qty</th>
                          <th className="px-3 py-2 text-right">Unit</th>
                          <th className="px-3 py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.productId}>
                            <td className="px-3 py-2 text-slate-700">
                              <div className="text-xs font-medium">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Ref. {item.reference}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600">
                              MAD {item.unitPrice.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-800">
                              MAD{" "}
                              {(item.unitPrice * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                    <AlertCircle className="h-3 w-3" />
                    Product quantities and prices are read-only here.
                  </p>
                </Card>

                <Card className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900">
                      Payment summary
                    </h3>
                    <Receipt className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>{selectedOrderTotals.subtotal.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Discounts</span>
                      <span>–</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>T.V.A</span>
                      <span>{selectedOrderTotals.taxes.toFixed(2)} MAD</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-2 text-[13px] font-semibold text-slate-900">
                      <span>Total</span>
                      <span>{selectedOrder.totalAmount.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Paid</span>
                      <span>{selectedOrderTotals.paid.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-700">
                      <span>Remaining</span>
                      <span>{selectedOrderTotals.remaining.toFixed(2)} MAD</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={remainingAmount <= 0}
                      onClick={() => handleOpenPaymentModal(false)}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <CreditCard className="h-3 w-3" />
                      Record payment
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintInvoice}
                      className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-medium text-slate-700"
                    >
                      <Receipt className="h-3 w-3" />
                      Invoice / Proforma
                    </button>
                  </div>
                </Card>
              </div>

              {/* Payment history */}
              <Card className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-900">
                    Payment history
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {selectedOrderPayments.length} payment
                    {selectedOrderPayments.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                  <table className="min-w-full text-[11px]">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Method</th>
                        <th className="px-3 py-2 text-left">Reference</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrderPayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-3 py-4 text-center text-xs text-slate-400"
                          >
                            No payments recorded yet.
                          </td>
                        </tr>
                      ) : (
                        selectedOrderPayments.map((p) => (
                          <tr key={p.id}>
                            <td className="px-3 py-2 text-slate-600">
                              {new Date(p.date).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {p.method}
                            </td>
                            <td className="px-3 py-2 text-slate-500">
                              {p.reference ?? "–"}
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={p.status}
                                onChange={(e) =>
                                  handleChangePaymentStatus(
                                    p.id,
                                    e.target.value as Payment["status"]
                                  )
                                }
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold outline-none ${
                                  p.status === "paid"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : p.status === "pending"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                                }`}
                              >
                                <option value="paid">paid</option>
                                <option value="pending">pending</option>
                                <option value="rejected">rejected</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-900">
                              MAD {p.amount.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handlePrintReceipt(p)}
                                  className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-200"
                                >
                                  Receipt
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVoidPayment(p.id)}
                                  className="rounded-full bg-red-50 px-2 py-1 text-[10px] text-red-600 hover:bg-red-100"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Payment modal */}
      {paymentModalOpen && selectedOrder && selectedOrderTotals && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Record payment
                </h2>
                <p className="text-[11px] text-slate-500">
                  Remaining balance:{" "}
                  <span className="font-semibold text-amber-700">
                    MAD {selectedOrderTotals.remaining.toFixed(2)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label
                  htmlFor="pay-amount"
                  className="block text-[11px] font-medium text-slate-600"
                >
                  Amount
                </label>
                <div className="mt-1 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-[10px] text-slate-400">MAD</span>
                  <input
                    id="pay-amount"
                    type="text"
                    inputMode="decimal"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        amount: Number(e.target.value) || 0
                      }))
                    }
                    className="w-24 bg-transparent text-right text-[11px] text-slate-800 outline-none"
                  />
                </div>
                {paymentErrors.amount && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {paymentErrors.amount}
                  </p>
                )}
              </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Method
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => {
                    const method = e.target.value as Payment["method"];
                    setPaymentForm((prev) => ({
                      ...prev,
                      method,
                      // default status based on method
                      status:
                        method === "credit" ||
                        method === "cheque" ||
                        method === "promissory-note"
                          ? "pending"
                          : "paid"
                    }));
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                  <option value="promissory-note">Promissory note</option>
                  <option value="transfer">Bank transfer</option>
                  <option value="mobile">Mobile payment</option>
                  <option value="credit">Credit / Deferred</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Reference
                </label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      reference: e.target.value
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder={
                    paymentForm.method === "cheque" ||
                    paymentForm.method === "promissory-note" ||
                    paymentForm.method === "transfer" ||
                    paymentForm.method === "card"
                      ? "Transaction / cheque ref."
                      : "Optional"
                  }
                />
              </div>
            </div>

            {/* Extra fields depending on method */}
            {(paymentForm.method === "cheque" ||
              paymentForm.method === "promissory-note" ||
              paymentForm.method === "credit") && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">
                    {paymentForm.method === "credit" ? "Due date" : "Deposit / due date"}
                  </label>
                  <input
                    type="date"
                    value={paymentForm.dueDate}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        dueDate: e.target.value
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                  {paymentErrors.dueDate && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {paymentErrors.dueDate}
                    </p>
                  )}
                </div>
                {(paymentForm.method === "cheque" ||
                  paymentForm.method === "promissory-note") && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Bank
                    </label>
                    <input
                      type="text"
                      value={paymentForm.bankName}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          bankName: e.target.value
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Bank name"
                    />
                    {paymentErrors.bankName && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {paymentErrors.bankName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Status
                </label>
                <select
                  value={paymentForm.status}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      status: e.target.value as Payment["status"]
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Date &amp; time
                </label>
                <input
                  type="datetime-local"
                  value={paymentForm.date.slice(0, 16)}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      date: new Date(e.target.value).toISOString()
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={paymentForm.note}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      note: e.target.value
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Optional internal note"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-soft hover:bg-black"
              >
                Confirm payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


