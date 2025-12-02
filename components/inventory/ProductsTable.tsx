import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Printer,
  Download
} from "lucide-react";
import type { ProductWithLog } from "@/lib/mock/products";
import { ProductRow } from "./ProductRow";
import type { SortOption } from "./InventoryFilters";

interface ProductsTableProps {
  products: ProductWithLog[];
  selectedIds: Set<string>;
  sort: SortOption;
  page: number;
  pageSize: number;
  totalCount: number;
  pageSizeOptions: number[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onChangeSort: (sort: SortOption) => void;
  onChangePage: (page: number) => void;
  onChangePageSize: (size: number) => void;
  onEditProduct: (product: ProductWithLog) => void;
  onDuplicateProduct: (product: ProductWithLog) => void;
  onDeleteProduct: (product: ProductWithLog) => void;
  onOpenHistory: (product: ProductWithLog) => void;
  onExportVisible: () => void;
  onPrintVisible: () => void;
}

export function ProductsTable({
  products,
  selectedIds,
  sort,
  page,
  pageSize,
  totalCount,
  pageSizeOptions,
  onToggleSelect,
  onToggleSelectAll,
  onChangeSort,
  onChangePage,
  onChangePageSize,
  onEditProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onOpenHistory,
  onExportVisible,
  onPrintVisible
}: ProductsTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));

  const handleHeaderSort = (opt: SortOption) => {
    if (sort === opt) return;
    onChangeSort(opt);
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-lg">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">
          Products ({totalCount})
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportVisible}
            className="inline-flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={onPrintVisible}
            className="inline-flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-xs text-gray-500">
          <thead>
            <tr className="bg-gray-50 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              <th className="sticky left-0 z-10 bg-gray-50 px-3 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                />
              </th>
              <th className="px-3 py-3">Image</th>
              <th className="px-3 py-3">
                <button
                  type="button"
                  onClick={() => handleHeaderSort("name-asc")}
                  className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 hover:text-gray-800 focus:outline-none"
                >
                  Product
                  <ChevronsUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Warehouse</th>
              <th className="px-3 py-3">
                <button
                  type="button"
                  onClick={() => handleHeaderSort("price-desc")}
                  className="inline-flex items-center gap-1 hover:text-gray-800 focus:outline-none"
                >
                  Purchase
                  <ChevronsUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3">Sale</th>
              <th className="px-3 py-3">
                <button
                  type="button"
                  onClick={() => handleHeaderSort("stock-desc")}
                  className="inline-flex items-center gap-1 hover:text-gray-800 focus:outline-none"
                >
                  Stock
                  <ChevronsUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3">Supplier</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                selected={selectedIds.has(product.id)}
                onToggleSelect={() => onToggleSelect(product.id)}
                onEdit={() => onEditProduct(product)}
                onDuplicate={() => onDuplicateProduct(product)}
                onDelete={() => onDeleteProduct(product)}
                onHistory={() => onOpenHistory(product)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs text-gray-600 md:flex-row">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onChangePageSize(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-1 py-0.5">
            <button
              type="button"
              onClick={() => onChangePage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 hover:bg-white disabled:cursor-not-allowed disabled:text-gray-400"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onChangePage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 hover:bg-white disabled:cursor-not-allowed disabled:text-gray-400"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


