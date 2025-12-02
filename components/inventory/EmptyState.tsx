interface EmptyStateProps {
  onAddProduct: () => void;
}

export function EmptyState({ onAddProduct }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-12 text-center shadow-lg">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-kpi-blue text-primary shadow-md">
        <span className="text-xl font-semibold">+</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-900">
        Start building your inventory
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        Add your first products to keep track of stock levels, purchase prices,
        and suppliers in one clean dashboard.
      </p>
      <button
        type="button"
        onClick={onAddProduct}
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#1558b1] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        + Add New Product
      </button>
    </section>
  );
}


