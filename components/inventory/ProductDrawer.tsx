"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type {
  ProductCategory,
  ProductStatus,
  ProductWithLog,
  Supplier,
  StockLogEntry,
  Warehouse
} from "@/lib/mock/products";

type DrawerTab = "general" | "pricing" | "stock" | "supplier" | "media";

export interface ProductFormValues {
  name: string;
  reference: string;
  description: string;
  category: ProductCategory;
  purchasePrice: number;
  salePrice: number;
  taxRate: number;
  stock: number;
  minStock: number;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  status: ProductStatus;
  imageUrl?: string;
}

interface ProductDrawerProps {
  open: boolean;
  mode: "create" | "edit";
  product: ProductWithLog | null;
  suppliers: Supplier[];
  warehouses: Warehouse[];
  onClose: () => void;
  onSave: (values: ProductFormValues, stockLogDelta: StockLogEntry[]) => void;
}

const emptyForm: ProductFormValues = {
  name: "",
  reference: "",
  description: "",
  category: "Sanitary",
  purchasePrice: 0,
  salePrice: 0,
  taxRate: 20,
  stock: 0,
  minStock: 0,
  supplierId: "",
  supplierName: "",
  warehouseId: "",
  warehouseName: "",
  status: "active",
  imageUrl: undefined
};

export function ProductDrawer({
  open,
  mode,
  product,
  suppliers,
  warehouses,
  onClose,
  onSave
}: ProductDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>("general");
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [addStockQty, setAddStockQty] = useState<number>(0);
  const [addStockNote, setAddStockNote] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTab("general");
      if (product) {
        setForm({
          name: product.name,
          reference: product.reference,
          description: "",
          category: product.category,
          purchasePrice: product.purchasePrice,
          salePrice: product.salePrice,
          taxRate: 20,
          stock: product.stock,
          minStock: product.minStock,
          supplierId: product.supplierId,
          supplierName: product.supplierName,
          warehouseId: product.warehouseId,
          warehouseName: product.warehouseName,
          status: product.status,
          imageUrl: product.imageUrl
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, product]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleFieldChange = (field: keyof ProductFormValues, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      handleFieldChange("imageUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Product name is required.";
    if (!form.reference.trim()) nextErrors.reference = "Reference is required.";
    if (!form.category) nextErrors.category = "Category is required.";
    if (form.salePrice <= 0) nextErrors.salePrice = "Sale price must be > 0.";
    if (!form.supplierId) nextErrors.supplierId = "Supplier is required.";
    if (!form.warehouseId) nextErrors.warehouseId = "Warehouse is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const stockLogDelta: StockLogEntry[] = [];
    if (addStockQty !== 0) {
      stockLogDelta.push({
        id: `${Date.now()}-${Math.random()}`,
        productId: product?.id ?? "temp",
        date: new Date().toISOString(),
        action: addStockQty > 0 ? "Added" : "Adjusted",
        quantity: addStockQty,
        user: "Manager",
        note: addStockNote || "Manual stock adjustment"
      });
    }

    onSave(form, stockLogDelta);
    setAddStockQty(0);
    setAddStockNote("");
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-stretch justify-end bg-black/40"
      onClick={handleOverlayClick}
    >
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {mode === "create" ? "Add new product" : "Edit product"}
            </h2>
            <p className="text-xs text-gray-500">
              General information, pricing, stock, supplier, and media.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close product drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <nav className="flex gap-2 border-b border-gray-100 px-4 pb-2 pt-3 text-xs font-medium text-gray-600">
          {[
            { id: "general", label: "General" },
            { id: "pricing", label: "Pricing" },
            { id: "stock", label: "Stock" },
            { id: "supplier", label: "Supplier" },
            { id: "media", label: "Media" }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as DrawerTab)}
              className={`rounded-full px-3 py-1 ${
                tab === t.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {tab === "general" && (
            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs font-medium text-gray-600"
                  htmlFor="pd-name"
                >
                  Product name
                </label>
                <input
                  id="pd-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label
                  className="block text-xs font-medium text-gray-600"
                  htmlFor="pd-ref"
                >
                  Reference / SKU
                </label>
                <input
                  id="pd-ref"
                  type="text"
                  value={form.reference}
                  onChange={(e) => handleFieldChange("reference", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.reference && (
                  <p className="mt-1 text-xs text-red-500">{errors.reference}</p>
                )}
              </div>
              <div>
                <label
                  className="block text-xs font-medium text-gray-600"
                  htmlFor="pd-desc"
                >
                  Description
                </label>
                <textarea
                  id="pd-desc"
                  value={form.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-gray-600"
                    htmlFor="pd-category"
                  >
                    Category
                  </label>
                  <select
                    id="pd-category"
                    value={form.category}
                    onChange={(e) =>
                      handleFieldChange(
                        "category",
                        e.target.value as ProductCategory
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Sanitary">Sanitary</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Pipes">Pipes</option>
                    <option value="Tools">Tools</option>
                    <option value="Others">Others</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-gray-600"
                    htmlFor="pd-status"
                  >
                    Status
                  </label>
                  <select
                    id="pd-status"
                    value={form.status}
                    onChange={(e) =>
                      handleFieldChange(
                        "status",
                        e.target.value as ProductStatus
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {tab === "pricing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-gray-600"
                    htmlFor="pd-purchase"
                  >
                    Purchase price (MAD)
                  </label>
                  <input
                    id="pd-purchase"
                    type="number"
                    min={0}
                    value={form.purchasePrice}
                    onChange={(e) =>
                      handleFieldChange("purchasePrice", Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-gray-600"
                    htmlFor="pd-sale"
                  >
                    Sale price (MAD)
                  </label>
                  <input
                    id="pd-sale"
                    type="number"
                    min={0}
                    value={form.salePrice}
                    onChange={(e) =>
                      handleFieldChange("salePrice", Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.salePrice && (
                    <p className="mt-1 text-xs text-red-500">{errors.salePrice}</p>
                  )}
                </div>
              </div>
              <div>
                <label
                  className="block text-xs font-medium text-gray-600"
                  htmlFor="pd-tax"
                >
                  Tax rate (%)
                </label>
                <input
                  id="pd-tax"
                  type="number"
                  min={0}
                  max={100}
                  value={form.taxRate}
                  onChange={(e) =>
                    handleFieldChange("taxRate", Number(e.target.value))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {tab === "stock" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-gray-600"
                    htmlFor="pd-stock"
                  >
                    Current stock
                  </label>
                  <input
                    id="pd-stock"
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) =>
                      handleFieldChange("stock", Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-gray-600"
                    htmlFor="pd-min-stock"
                  >
                    Min stock alert
                  </label>
                  <input
                    id="pd-min-stock"
                    type="number"
                    min={0}
                    value={form.minStock}
                    onChange={(e) =>
                      handleFieldChange("minStock", Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-gray-600"
                  htmlFor="pd-warehouse"
                >
                  Warehouse
                </label>
                <select
                  id="pd-warehouse"
                  value={form.warehouseId}
                  onChange={(e) => {
                    const warehouseId = e.target.value;
                    const warehouse = warehouses.find((w) => w.id === warehouseId);
                    handleFieldChange("warehouseId", warehouseId);
                    handleFieldChange(
                      "warehouseName",
                      warehouse ? warehouse.name : ""
                    );
                  }}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
                {errors.warehouseId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.warehouseId}
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-800">
                  Quick stock adjustment
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  Increase or decrease stock and keep a log of the reason.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-[11px] font-medium text-gray-600"
                      htmlFor="pd-add-stock"
                    >
                      Quantity (+/-)
                    </label>
                    <input
                      id="pd-add-stock"
                      type="number"
                      value={addStockQty}
                      onChange={(e) =>
                        setAddStockQty(Number(e.target.value || 0))
                      }
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[11px] font-medium text-gray-600"
                      htmlFor="pd-add-note"
                    >
                      Reason / Note
                    </label>
                    <input
                      id="pd-add-note"
                      type="text"
                      value={addStockNote}
                      onChange={(e) => setAddStockNote(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "supplier" && (
            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs font-medium text-gray-600"
                  htmlFor="pd-supplier"
                >
                  Supplier
                </label>
                <select
                  id="pd-supplier"
                  value={form.supplierId}
                  onChange={(e) => {
                    const supplierId = e.target.value;
                    const supplier = suppliers.find((s) => s.id === supplierId);
                    handleFieldChange("supplierId", supplierId);
                    handleFieldChange(
                      "supplierName",
                      supplier ? supplier.name : ""
                    );
                  }}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {errors.supplierId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.supplierId}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                TODO: Link this section with your real suppliers table or API,
                e.g. <code className="rounded bg-gray-100 px-1 py-0.5">
                  fetch(&apos;/api/suppliers&apos;)
                </code>
                .
              </p>
            </div>
          )}

          {tab === "media" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Product image
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
                    {form.imageUrl ? (
                      <img
                        src={form.imageUrl}
                        alt={form.name || "Product image"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400">No image</span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs text-gray-500">
                    <p>Upload a product photo from your phone or camera.</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      Upload image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gray-500">
                For this template we store the image in-memory. In production,
                upload the original photo and generate optimized thumbnails
                (e.g. 400×400) on your backend or image CDN.
              </p>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-2xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-[#1558b1] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Save product
          </button>
        </footer>
      </aside>
    </div>
  );
}


