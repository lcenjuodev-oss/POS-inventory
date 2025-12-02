import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { StockLogEntry } from "@/lib/mock/products";

interface StockLogTableProps {
  productName: string;
  entries: StockLogEntry[];
  onClose: () => void;
}

export function StockLogTable({ productName, entries, onClose }: StockLogTableProps) {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const filteredEntries = useMemo(() => {
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    return entries.filter((entry) => {
      const d = new Date(entry.date);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [entries, from, to]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="max-h-full w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Stock movement · {productName}
            </h3>
            <p className="text-xs text-gray-500">
              View and export all stock adjustments for this product.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close stock history"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-600" htmlFor="log-from">
                From
              </label>
              <input
                id="log-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600" htmlFor="log-to">
                To
              </label>
              <input
                id="log-to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  // TODO: wire this up to a real export endpoint
                  // For now, this is handled by the parent inventory page.
                  window.print();
                }}
                className="w-full rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Print / Export visible
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-auto rounded-xl border border-gray-100">
            <table className="min-w-full border-separate border-spacing-0 text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 bg-white">
                    <td className="px-3 py-2">
                      {new Date(entry.date).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          entry.action === "Added"
                            ? "bg-emerald-50 text-emerald-600"
                            : entry.action === "Sold"
                            ? "bg-red-50 text-red-600"
                            : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          entry.quantity >= 0 ? "text-emerald-700" : "text-red-600"
                        }
                      >
                        {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
                      </span>
                    </td>
                    <td className="px-3 py-2">{entry.user}</td>
                    <td className="px-3 py-2">{entry.note}</td>
                  </tr>
                ))}
                {filteredEntries.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-xs text-gray-400"
                    >
                      No stock movements in the selected range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


