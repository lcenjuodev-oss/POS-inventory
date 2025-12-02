 "use client";

import { useEffect, useRef, useState } from "react";
import {
  Pencil,
  Copy,
  Trash2,
  Clock,
  MoreVertical
} from "lucide-react";
import type { ProductWithLog } from "@/lib/mock/products";

interface ProductRowProps {
  product: ProductWithLog;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onHistory: () => void;
}

export function ProductRow({
  product,
  selected,
  onToggleSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onHistory
}: ProductRowProps) {
  const stockStatus =
    product.stock === 0
      ? "out"
      : product.stock <= product.minStock
      ? "low"
      : "ok";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleAction = (action: () => void) => {
    action();
    setMenuOpen(false);
  };

  return (
    <tr
      className="border-b border-gray-100 bg-white text-sm text-gray-700 hover:bg-gray-50 hover:shadow-sm"
    >
      <td className="px-3 py-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select ${product.name}`}
        />
      </td>
      <td className="px-3 py-3">
        <div className="h-10 w-10 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center" aria-hidden="true">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-gray-400">IMG</span>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <div>
          <p className="font-medium text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-500">{product.reference}</p>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
          {product.category}
        </span>
      </td>
      <td className="px-3 py-3 text-xs text-gray-700">
        {product.warehouseName}
      </td>
      <td className="px-3 py-3 text-sm text-gray-700">
        {product.purchasePrice.toFixed(2)}{" "}
        <span className="text-xs text-gray-400">MAD</span>
      </td>
      <td className="px-3 py-3 text-sm text-gray-700">
        {product.salePrice.toFixed(2)}{" "}
        <span className="text-xs text-gray-400">MAD</span>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              stockStatus === "out"
                ? "bg-red-50 text-red-600"
                : stockStatus === "low"
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {product.stock} in stock
          </span>
        </div>
      </td>
      <td className="px-3 py-3 text-xs text-gray-700">{product.supplierName}</td>
      <td className="px-3 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            product.status === "active"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {product.status === "active" ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="relative px-3 py-3 text-right">
        <div
          ref={menuRef}
          className="inline-flex items-center gap-1"
        >
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Row actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-40 rounded-lg border border-gray-100 bg-white py-1 text-xs text-gray-700 shadow-lg">
          <button
            type="button"
                onClick={() => handleAction(onEdit)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50"
          >
                <Pencil className="h-3 w-3" />
                <span>Edit</span>
          </button>
          <button
            type="button"
                onClick={() => handleAction(onDuplicate)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50"
          >
                <Copy className="h-3 w-3" />
                <span>Duplicate</span>
          </button>
          <button
            type="button"
                onClick={() => handleAction(onHistory)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50"
          >
            <Clock className="h-3 w-3" />
                <span>History</span>
          </button>
              <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
                onClick={() => handleAction(onDelete)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-red-600 hover:bg-red-50"
          >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
          </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}


