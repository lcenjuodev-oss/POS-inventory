import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import type { ProductCategory, Supplier, Warehouse } from "@/lib/mock/products";

export type StockFilter = "all" | "low" | "out" | "in";
export type SortOption = "name-asc" | "stock-desc" | "price-desc" | "newest";

interface InventoryFiltersProps {
  search: string;
  category: ProductCategory | "All";
  stockFilter: StockFilter;
  supplierId: string | "All";
  warehouseId: string | "All";
  sort: SortOption;
  suppliers: Supplier[];
  warehouses: Warehouse[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: ProductCategory | "All") => void;
  onStockFilterChange: (value: StockFilter) => void;
  onSupplierChange: (value: string | "All") => void;
  onWarehouseChange: (value: string | "All") => void;
  onSortChange: (value: SortOption) => void;
}

export function InventoryFilters(props: InventoryFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-gray-600" htmlFor="inventory-search">
          Search
        </label>
        <input
          id="inventory-search"
          type="search"
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          placeholder="Search by name or reference"
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="md:col-span-1">
        <label className="block text-xs font-medium text-gray-600" htmlFor="inventory-category">
          Category
        </label>
        <select
          id="inventory-category"
          value={props.category}
          onChange={(e) =>
            props.onCategoryChange(e.target.value as ProductCategory | "All")
          }
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">All categories</option>
          <option value="Sanitary">Sanitary</option>
          <option value="Accessories">Accessories</option>
          <option value="Pipes">Pipes</option>
          <option value="Tools">Tools</option>
          <option value="Others">Others</option>
        </select>
      </div>

      <div className="md:col-span-1">
        <label className="block text-xs font-medium text-gray-600" htmlFor="inventory-stock">
          Stock
        </label>
        <select
          id="inventory-stock"
          value={props.stockFilter}
          onChange={(e) =>
            props.onStockFilterChange(e.target.value as StockFilter)
          }
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
          <option value="in">In stock</option>
        </select>
      </div>

      <div className="md:col-span-1">
        <label className="block text-xs font-medium text-gray-600" htmlFor="inventory-supplier">
          Supplier
        </label>
        <select
          id="inventory-supplier"
          value={props.supplierId}
          onChange={(e) => props.onSupplierChange(e.target.value as string | "All")}
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">All suppliers</option>
          {props.suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-1">
        <label className="block text-xs font-medium text-gray-600" htmlFor="inventory-warehouse">
          Warehouse
        </label>
        <select
          id="inventory-warehouse"
          value={props.warehouseId}
          onChange={(e) =>
            props.onWarehouseChange(e.target.value as string | "All")
          }
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">All warehouses</option>
          {props.warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-1">
        <label className="block text-xs font-medium text-gray-600" htmlFor="inventory-sort">
          Sort by
        </label>
        <select
          id="inventory-sort"
          value={props.sort}
          onChange={(e) =>
            props.onSortChange(e.target.value as SortOption)
          }
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="name-asc">Name A → Z</option>
          <option value="stock-desc">Stock (high → low)</option>
          <option value="price-desc">Price (high → low)</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  );

  return (
    <section className="rounded-2xl bg-white p-4 shadow-lg">
      {/* Desktop layout */}
      <div className="hidden md:block">{content}</div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-expanded={mobileOpen}
          aria-controls="inventory-filters-panel"
        >
          <span className="inline-flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              mobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {mobileOpen && (
          <div id="inventory-filters-panel" className="mt-3 space-y-3">
            {content}
          </div>
        )}
      </div>
    </section>
  );
}


