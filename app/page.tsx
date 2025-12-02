import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { OrdersLineChart } from "@/components/charts/OrdersLineChart";
import { SalesDonutChart } from "@/components/charts/SalesDonutChart";
import { PurchaseBarChart } from "@/components/charts/PurchaseBarChart";
import { Boxes, TrendingUp, TrendingDown, Truck } from "lucide-react";

const recentOrders = [
  {
    id: "147895954",
    customer: "Customer Full Name",
    products: 74,
    quantity: 74,
    amount: 1475
  },
  {
    id: "147895955",
    customer: "Customer Full Name",
    products: 32,
    quantity: 40,
    amount: 875
  }
];

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <Header role="manager" name="Mohamed" />

      {/* Top summary cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-pastel.yellow to-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-slate-500">Inventory</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                1,248
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-amber-500">
              <Boxes className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-medium">18 low stock alerts</p>
        </Card>

        <Card className="bg-gradient-to-br from-pastel.green to-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-slate-500">Sales</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                $85,500
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-emerald-500">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-medium">
            +10.5% from last day · 320 invoices
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-pastel.purple to-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-slate-500">Expenses</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                $24,300
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-red-500">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Last: Office supplies · $230</p>
        </Card>

        <Card className="bg-gradient-to-br from-pastel.blue to-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-slate-500">Orders</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                156
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-sky-500">
              <Truck className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            In progress: 48 · Delivered: 96 · Cancelled: 12
          </p>
        </Card>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Orders Overview
              </h3>
              <p className="text-xs text-slate-500">
                Orders and profit over the last 8 months
              </p>
            </div>
            <span className="text-xs text-slate-400">2024</span>
          </div>
          <div className="h-64">
            <OrdersLineChart />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Sales Analytics
              </h3>
              <p className="text-xs text-slate-500">
                Completion vs distribution & returns
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-40 w-40">
              <SalesDonutChart />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-slate-600">Completed · 80%</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <p className="text-slate-600">Distributed · 15%</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <p className="text-slate-600">Returned · 5%</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Purchases + Top Products */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Purchase Analytics
              </h3>
              <p className="text-xs text-slate-500">Sold vs purchased stock</p>
            </div>
            <span className="text-xs text-slate-400">2024</span>
          </div>
          <div className="h-64">
            <PurchaseBarChart />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Top Products
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            {["Monstera Plant", "Sanitaire Set", "Premium Pipes", "Accessories"].map(
              (name, idx) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-slate-100 flex items-center justify-center text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{name}</p>
                      <p className="text-[11px] text-slate-400">
                        Code #{8800 + idx}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">{320 - idx * 48} orders</p>
                </div>
              )
            )}
          </div>
        </Card>
      </section>

      {/* Recent Orders */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Recent Orders
            </h3>
            <p className="text-xs text-slate-500">
              Latest confirmed orders across all channels
            </p>
          </div>
          <button className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            Today
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="py-3 px-4 text-left rounded-l-xl">Order ID</th>
                <th className="py-3 px-4 text-left">Customer name</th>
                <th className="py-3 px-4 text-left">Total products</th>
                <th className="py-3 px-4 text-left">Quantity</th>
                <th className="py-3 px-4 text-left">Total amount</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {order.id}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{order.customer}</td>
                  <td className="py-3 px-4">{order.products}</td>
                  <td className="py-3 px-4">{order.quantity}</td>
                  <td className="py-3 px-4 font-semibold">
                    ${order.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200">
                      ...
                    </button>
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


