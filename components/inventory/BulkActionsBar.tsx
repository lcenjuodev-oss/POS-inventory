interface BulkActionsBarProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onExportSelected: () => void;
  onSetInactive: () => void;
  onChangeCategory: () => void;
  onUpdateSupplier: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onDeleteSelected,
  onExportSelected,
  onSetInactive,
  onChangeCategory,
  onUpdateSupplier
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-4 z-30 mb-3 flex items-center justify-between rounded-2xl bg-gray-900 px-4 py-3 text-xs text-white shadow-lg">
      <p className="font-medium">
        {selectedCount} product{selectedCount > 1 ? "s" : ""} selected
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onDeleteSelected}
          className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Delete selected
        </button>
        <button
          type="button"
          onClick={onExportSelected}
          className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={onChangeCategory}
          className="rounded-xl border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Change category
        </button>
        <button
          type="button"
          onClick={onUpdateSupplier}
          className="rounded-xl border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Update supplier
        </button>
        <button
          type="button"
          onClick={onSetInactive}
          className="rounded-xl border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Set inactive
        </button>
      </div>
    </div>
  );
}


