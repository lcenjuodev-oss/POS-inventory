 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import {
  type BonCommande,
  subscribeBonCommandes
} from "@/lib/store/bonCommandeStore";

export default function SellerDashboardPage() {
  const [orders, setOrders] = useState<BonCommande[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeBonCommandes(setOrders);
    return unsubscribe;
  }, []);

  const pendingOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "cancelled"
  );

  return (
    <div className="space-y-6">
      <Header role="seller" name="Seller Name" />

      <Card className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-pastel.blue to-pastel.green">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">
            Create a new Bon de Commande
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Quickly capture a new client order with products and quantities.
          </p>
        </div>
        <Link
          href="/seller/bon-de-commande/new"
          className="rounded-full bg-slate-900 text-white px-6 py-3 text-sm font-medium shadow-soft hover:bg-slate-800 transition"
        >
          Create Bon de Commande
        </Link>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Not confirmed orders
            </h3>
            <p className="text-xs text-slate-500">
              Only pending or cancelled Bon de Commande
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="py-3 px-4 text-left rounded-l-xl">Command ID</th>
                <th className="py-3 px-4 text-left">Client name</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Seller</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {pendingOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/80 cursor-pointer"
                  onClick={() =>
                    router.push(`/seller/bon-de-commande/new?orderId=${order.id}`)
                  }
                >
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {order.id}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {order.clientName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {order.clientPhone}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {order.sellerName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{order.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        order.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {order.status === "pending" ? "Pending" : "Cancelled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


