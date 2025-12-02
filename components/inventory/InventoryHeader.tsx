import { Plus, Download, Upload, Filter } from "lucide-react";

interface InventoryHeaderProps {
  selectedQuickFilter: "all" | "low-stock" | "out-of-stock" | "inactive";
  onQuickFilterChange: (value: "all" | "low-stock" | "out-of-stock" | "inactive") => void;
  onAddProduct: () => void;
  onExportAll: () => void;
  onImport: () => void;
}

const quickFilters = [
  { id: "all", label: "All" },
  { id: "low-stock", label: "Low stock" },
  { id: "out-of-stock", label: "Out of stock" },
  { id: "inactive", label: "Inactive" }
] as const;

export function InventoryHeader({
  selectedQuickFilter,
  onQuickFilterChange,
  onAddProduct,
  onExportAll,
  onImport
}: InventoryHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your products, stock levels, and categories.
        </p>
        <div className="mt-3 inline-flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onQuickFilterChange(filter.id)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedQuickFilter === filter.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
              aria-pressed={selectedQuickFilter === filter.id}
            >
              <Filter className="h-3 w-3" />
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onExportAll}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Export inventory"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button
          type="button"
          onClick={onImport}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Import products"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </button>
        <button
          type="button"
          onClick={onAddProduct}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-[#1558b1] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add New Product</span>
        </button>
      </div>
    </header>
  );
}


