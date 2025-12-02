"use client";

/**
 * Inventory page (frontend only, mock data)
 *
 * How to plug real data:
 * - Replace `mockProducts` / `mockSuppliers` imports with your own hooks or data fetching:
 *     // TODO: integrate real API
 *     // const { data: products } = useSWR('/api/products');
 * - Wire `handleSaveProduct`, `handleDeleteProduct`, and stock log updates to call
 *   your backend endpoints (e.g. POST/PUT /api/products, POST /api/products/:id/stock-log)
 *   instead of only mutating local state.
 * - Replace the CSV export helpers with API-powered exports if needed.
 *
 * This file intentionally stays client-side and in-memory so it can be dropped
 * into your app and later switched over to real APIs with minimal changes.
 */

import { useMemo, useState } from "react";
import {
  mockProducts,
  mockSuppliers,
  mockWarehouses,
  type ProductWithLog,
  type StockLogEntry
} from "@/lib/mock/products";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import {
  InventoryFilters,
  type SortOption,
  type StockFilter
} from "@/components/inventory/InventoryFilters";
import { InventoryKPIs } from "@/components/inventory/InventoryKPIs";
import { ProductsTable } from "@/components/inventory/ProductsTable";
import { BulkActionsBar } from "@/components/inventory/BulkActionsBar";
import { ProductDrawer, type ProductFormValues } from "@/components/inventory/ProductDrawer";
import { StockLogTable } from "@/components/inventory/StockLogTable";
import { EmptyState } from "@/components/inventory/EmptyState";

type QuickFilter = "all" | "low-stock" | "out-of-stock" | "inactive";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const asString =
            value === null || value === undefined ? "" : String(value);
          // Escape commas and quotes
          return `"${asString.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductWithLog[]>(() => mockProducts);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | ProductWithLog["category"]>(
    "All"
  );
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [supplierId, setSupplierId] = useState<"All" | string>("All");
  const [warehouseId, setWarehouseId] = useState<"All" | string>("All");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<ProductWithLog | null>(
    null
  );

  const [historyProduct, setHistoryProduct] = useState<ProductWithLog | null>(
    null
  );

  // Derived KPIs
  const totalProducts = products.length;
  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= p.minStock
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const newProductsCount = products.filter((p) => {
    const created = new Date(p.createdAt);
    const daysDiff =
      (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30;
  }).length;

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          if (
            !(
              product.name.toLowerCase().includes(q) ||
              product.sku.toLowerCase().includes(q) ||
              product.reference.toLowerCase().includes(q)
            )
          ) {
            return false;
          }
        }

        if (category !== "All" && product.category !== category) {
          return false;
        }

        if (supplierId !== "All" && product.supplierId !== supplierId) {
          return false;
        }

        if (warehouseId !== "All" && product.warehouseId !== warehouseId) {
          return false;
        }

        // Stock filter
        if (stockFilter === "low" && !(product.stock > 0 && product.stock <= product.minStock)) {
          return false;
        }
        if (stockFilter === "out" && product.stock !== 0) {
          return false;
        }
        if (stockFilter === "in" && product.stock <= 0) {
          return false;
        }

        // Quick filters override when active
        if (quickFilter === "low-stock" && !(product.stock > 0 && product.stock <= product.minStock)) {
          return false;
        }
        if (quickFilter === "out-of-stock" && product.stock !== 0) {
          return false;
        }
        if (quickFilter === "inactive" && product.status !== "inactive") {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        if (sort === "stock-desc") {
          return b.stock - a.stock;
        }
        if (sort === "price-desc") {
          return b.salePrice - a.salePrice;
        }
        if (sort === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [products, search, category, supplierId, warehouseId, stockFilter, sort, quickFilter]);

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allIds = paginatedProducts.map((p) => p.id);
      const next = new Set(prev);
      const allSelected = allIds.every((id) => next.has(id));
      if (allSelected) {
        allIds.forEach((id) => next.delete(id));
      } else {
        allIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleOpenCreateDrawer = () => {
    setDrawerMode("create");
    setEditingProduct(null);
    setDrawerOpen(true);
  };

  const handleOpenEditDrawer = (product: ProductWithLog) => {
    setDrawerMode("edit");
    setEditingProduct(product);
    setDrawerOpen(true);
  };

  const handleSaveProduct = (
    values: ProductFormValues,
    stockLogDelta: StockLogEntry[]
  ) => {
    setProducts((prev) => {
      if (drawerMode === "create") {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `prod-${Date.now()}`;
        const now = new Date().toISOString();
        const newProduct: ProductWithLog = {
          id,
          name: values.name,
          sku: values.reference,
          reference: values.reference,
          category: values.category,
          purchasePrice: values.purchasePrice,
          salePrice: values.salePrice,
          stock: values.stock + stockLogDelta.reduce((acc, e) => acc + e.quantity, 0),
          minStock: values.minStock,
          supplierId: values.supplierId,
          supplierName: values.supplierName,
          warehouseId: values.warehouseId,
          warehouseName: values.warehouseName,
          status: values.status,
          imageUrl: values.imageUrl,
          createdAt: now,
          updatedAt: now,
          stockLog: stockLogDelta.map((e) => ({ ...e, productId: id }))
        };
        return [newProduct, ...prev];
      }

      if (!editingProduct) return prev;
      return prev.map((p) => {
        if (p.id !== editingProduct.id) return p;
        const updatedStock =
          values.stock +
          stockLogDelta.reduce((acc, entry) => acc + entry.quantity, 0);
        return {
          ...p,
          name: values.name,
          reference: values.reference,
          sku: values.reference,
          category: values.category,
          purchasePrice: values.purchasePrice,
          salePrice: values.salePrice,
          stock: updatedStock,
          minStock: values.minStock,
          supplierId: values.supplierId,
          supplierName: values.supplierName,
          warehouseId: values.warehouseId,
          warehouseName: values.warehouseName,
          status: values.status,
          imageUrl: values.imageUrl,
          updatedAt: new Date().toISOString(),
          stockLog: [...p.stockLog, ...stockLogDelta.map((e) => ({ ...e, productId: p.id }))]
        };
      });
    });

    setDrawerOpen(false);
  };

  const handleDuplicateProduct = (product: ProductWithLog) => {
    setProducts((prev) => {
      const now = new Date().toISOString();
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `prod-${Date.now()}`;
      const copy: ProductWithLog = {
        ...product,
        id,
        name: `${product.name} (Copy)`,
        sku: `${product.sku}-COPY`,
        reference: `${product.reference}-COPY`,
        createdAt: now,
        updatedAt: now,
        stockLog: []
      };
      return [copy, ...prev];
    });
  };

  const handleDeleteProduct = (product: ProductWithLog) => {
    if (!confirm(`Delete product "${product.name}"? This cannot be undone.`)) {
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(product.id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (
      !confirm(
        `Delete ${selectedIds.size} selected product(s)? This cannot be undone.`
      )
    ) {
      return;
    }
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  const handleSetInactive = () => {
    setProducts((prev) =>
      prev.map((p) =>
        selectedIds.has(p.id) ? { ...p, status: "inactive" } : p
      )
    );
  };

  const handleChangeCategoryBulk = () => {
    const category = window.prompt(
      "Enter new category for selected products (Sanitary / Accessories / Pipes / Tools / Others):",
      "Others"
    ) as ProductWithLog["category"] | null;
    if (!category) return;
    setProducts((prev) =>
      prev.map((p) =>
        selectedIds.has(p.id) ? { ...p, category } : p
      )
    );
  };

  const handleUpdateSupplierBulk = () => {
    const supplier = mockSuppliers[0];
    setProducts((prev) =>
      prev.map((p) =>
        selectedIds.has(p.id)
          ? { ...p, supplierId: supplier.id, supplierName: supplier.name }
          : p
      )
    );
  };

  const handleExportSelected = () => {
    const selectedProducts = products.filter((p) => selectedIds.has(p.id));
    downloadCsv(
      "inventory-selected.csv",
      selectedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        reference: p.reference,
        category: p.category,
        purchasePrice: p.purchasePrice,
        salePrice: p.salePrice,
        stock: p.stock,
        supplier: p.supplierName,
        status: p.status
      }))
    );
  };

  const handleExportVisible = () => {
    downloadCsv(
      "inventory-visible.csv",
      paginatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        reference: p.reference,
        category: p.category,
        purchasePrice: p.purchasePrice,
        salePrice: p.salePrice,
        stock: p.stock,
        supplier: p.supplierName,
        status: p.status
      }))
    );
  };

  const handleExportAll = () => {
    downloadCsv(
      "inventory-all.csv",
      products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        reference: p.reference,
        category: p.category,
        purchasePrice: p.purchasePrice,
        salePrice: p.salePrice,
        stock: p.stock,
        supplier: p.supplierName,
        status: p.status
      }))
    );
  };

  const handlePrintVisible = () => {
    window.print();
  };

  const handleOpenHistory = (product: ProductWithLog) => {
    setHistoryProduct(product);
  };

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8">
      <InventoryHeader
        selectedQuickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
        onAddProduct={handleOpenCreateDrawer}
        onExportAll={handleExportAll}
        onImport={() => {
          // TODO: connect to your import flow, e.g. open upload dialog or navigate.
          alert("Mock import — integrate file upload or import wizard here.");
        }}
      />

      <InventoryKPIs
        totalProducts={totalProducts}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        newProductsCount={newProductsCount}
      />

      <InventoryFilters
        search={search}
        category={category}
        stockFilter={stockFilter}
        supplierId={supplierId}
        warehouseId={warehouseId}
        sort={sort}
        suppliers={mockSuppliers}
        warehouses={mockWarehouses}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCategoryChange={(value) => {
          setCategory(value);
          setPage(1);
        }}
        onStockFilterChange={(value) => {
          setStockFilter(value);
          setPage(1);
        }}
        onSupplierChange={(value) => {
          setSupplierId(value);
          setPage(1);
        }}
        onWarehouseChange={(value) => {
          setWarehouseId(value);
          setPage(1);
        }}
        onSortChange={setSort}
      />

      {products.length === 0 ? (
        <EmptyState onAddProduct={handleOpenCreateDrawer} />
      ) : (
        <>
          <BulkActionsBar
            selectedCount={selectedIds.size}
            onDeleteSelected={handleDeleteSelected}
            onExportSelected={handleExportSelected}
            onChangeCategory={handleChangeCategoryBulk}
            onUpdateSupplier={handleUpdateSupplierBulk}
            onSetInactive={handleSetInactive}
          />

          <ProductsTable
            products={paginatedProducts}
            selectedIds={selectedIds}
            sort={sort}
            page={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onChangeSort={setSort}
            onChangePage={setPage}
            onChangePageSize={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            onEditProduct={handleOpenEditDrawer}
            onDuplicateProduct={handleDuplicateProduct}
            onDeleteProduct={handleDeleteProduct}
            onOpenHistory={handleOpenHistory}
            onExportVisible={handleExportVisible}
            onPrintVisible={handlePrintVisible}
          />
        </>
      )}

      <ProductDrawer
        open={drawerOpen}
        mode={drawerMode}
        product={editingProduct}
        suppliers={mockSuppliers}
        warehouses={mockWarehouses}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveProduct}
      />

      {historyProduct && (
        <StockLogTable
          productName={historyProduct.name}
          entries={historyProduct.stockLog}
          onClose={() => setHistoryProduct(null)}
        />
      )}
    </div>
  );
}


