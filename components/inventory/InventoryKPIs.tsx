import {
  Boxes,
  AlertTriangle,
  XCircle,
  Sparkles
} from "lucide-react";

interface InventoryKPIsProps {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  newProductsCount: number;
}

export function InventoryKPIs({
  totalProducts,
  lowStockCount,
  outOfStockCount,
  newProductsCount
}: InventoryKPIsProps) {
  const cards = [
    {
      id: "total",
      label: "Total products",
      value: totalProducts,
      icon: Boxes,
      bg: "bg-gradient-to-br from-sky-50 to-sky-100",
      accent: "bg-sky-500/10 text-sky-600"
    },
    {
      id: "low",
      label: "Low stock alerts",
      value: lowStockCount,
      icon: AlertTriangle,
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      accent: "bg-amber-500/10 text-amber-600"
    },
    {
      id: "out",
      label: "Out of stock",
      value: outOfStockCount,
      icon: XCircle,
      bg: "bg-gradient-to-br from-rose-50 to-rose-100",
      accent: "bg-rose-500/10 text-rose-600"
    },
    {
      id: "new",
      label: "New products (30d)",
      value: newProductsCount,
      icon: Sparkles,
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      accent: "bg-emerald-500/10 text-emerald-600"
    }
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.id}
            className={`flex items-center justify-between rounded-xl border border-white/60 p-4 shadow-md ${card.bg}`}
          >
            <div>
              <p className="text-xs font-medium text-gray-700">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {card.value}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${card.accent}`}
            >
              <Icon className="h-5 w-5" />
            </div>
          </article>
        );
      })}
    </section>
  );
}


