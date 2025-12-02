"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/layout/Header";
import {
  type BonCommande,
  upsertBonCommande,
  getBonCommande
} from "@/lib/store/bonCommandeStore";

const mockClients = [
  { id: "C1", name: "John Doe", phone: "+212 600-000000" },
  { id: "C2", name: "Jane Smith", phone: "+212 611-123456" },
  { id: "C3", name: "Acme Corp.", phone: "+212 622-987654" }
];

const mockProducts = [
  {
    id: "P1",
    name: "Sanitaire Set Deluxe",
    reference: "SAN-001",
    price: 120,
    category: "Sanitaire",
    imageUrl:
      "https://images.pexels.com/photos/37347/thermometer-temperature-fever-flu.jpg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: "P2",
    name: "Premium Pipe 2m",
    reference: "TUY-200",
    price: 45,
    category: "Tuyaux",
    imageUrl:
      "https://images.pexels.com/photos/3738125/pexels-photo-3738125.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: "P3",
    name: "Chrome Accessory Kit",
    reference: "ACC-101",
    price: 80,
    category: "Accessoires",
    imageUrl:
      "https://images.pexels.com/photos/3738086/pexels-photo-3738086.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: "P4",
    name: "Maintenance Service",
    reference: "OTH-050",
    price: 60,
    category: "Others",
    imageUrl:
      "https://images.pexels.com/photos/8472661/pexels-photo-8472661.jpeg?auto=compress&cs=tinysrgb&w=400"
  }
  ,
  {
    id: "P5",
    name: "Wall Mounted Basin Mixer",
    reference: "SAN-002",
    price: 95,
    category: "Sanitaire",
    imageUrl:
      "https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: "P6",
    name: "Flexible Shower Hose 1.5m",
    reference: "SAN-010",
    price: 25,
    category: "Sanitaire",
    imageUrl:
      "https://images.pexels.com/photos/534151/pexels-photo-534151.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: "P7",
    name: "PVC Pipe 32mm - 4m",
    reference: "TUY-032",
    price: 30,
    category: "Tuyaux",
    imageUrl:
      "https://images.pexels.com/photos/3738115/pexels-photo-3738115.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: "P8",
    name: "Compression Fitting Elbow 1/2\"",
    reference: "TUY-210",
    price: 8,
    category: "Tuyaux",
    imageUrl:
      "https://images.pexels.com/photos/3738106/pexels-photo-3738106.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: "P9",
    name: "Bathroom Accessory Set Matte Black",
    reference: "ACC-050",
    price: 150,
    category: "Accessoires",
    imageUrl:
      "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: "P10",
    name: "PTFE Thread Seal Tape 12-pack",
    reference: "ACC-200",
    price: 40,
    category: "Accessoires",
    imageUrl:
      "https://images.pexels.com/photos/3738116/pexels-photo-3738116.jpeg?auto=compress&cs=tinysrgb&w=400"
  }
];

type CartItem = {
  productId: string;
  qty: number;
  unitPrice?: number;
};

function NewBonDeCommandePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editingOrderId = searchParams.get("orderId");

  const [step, setStep] = useState<1 | 2>(1);
  const [clients, setClients] = useState(mockClients);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCartIds, setSelectedCartIds] = useState<string[]>([]);

  const [newClientOpen, setNewClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientErrors, setNewClientErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

  const selectedClient =
    clients.find((c) => c.id === selectedClientId) ?? null;

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.reference.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (productId: string) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        // Already in cart — selection is handled visually, quantity adjusted in cart.
        return current;
      }
      const product = mockProducts.find((p) => p.id === productId);
      const basePrice = product?.price ?? 0;
      return [...current, { productId, qty: 1, unitPrice: basePrice }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const setQty = (productId: string, value: number) => {
    setCart((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, qty: Math.max(1, value) }
          : item
      )
    );
  };

  const toggleCartSelect = (productId: string) => {
    setSelectedCartIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const deleteSelectedCartItems = () => {
    if (selectedCartIds.length === 0) return;
    setCart((current) =>
      current.filter((item) => !selectedCartIds.includes(item.productId))
    );
    setSelectedCartIds([]);
  };

  const updateUnitPrice = (productId: string, value: number) => {
    setCart((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, unitPrice: Math.max(0, value) }
          : item
      )
    );
  };

  const totalAmount = cart.reduce((sum, item) => {
    const product = mockProducts.find((p) => p.id === item.productId);
    if (!product) return sum;
    const unitPrice = item.unitPrice ?? product.price;
    return sum + unitPrice * item.qty;
  }, 0);

  // If editing an existing Bon de Commande, hydrate state from the store
  useEffect(() => {
    if (!editingOrderId) return;
    const existing = getBonCommande(editingOrderId);
    if (!existing) return;

    // Ensure client exists in local clients list
    let clientId = clients.find(
      (c) =>
        c.name === existing.clientName && c.phone === existing.clientPhone
    )?.id;
    if (!clientId) {
      clientId = `C${clients.length + 1}`;
      const newClient = {
        id: clientId,
        name: existing.clientName,
        phone: existing.clientPhone
      };
      setClients((prev) => [...prev, newClient]);
    }

    setSelectedClientId(clientId);
    setStep(2);

    // Map order items into cart entries
    const cartItems: CartItem[] = existing.items.map((item) => ({
      productId: item.productId,
      qty: item.quantity,
      unitPrice: item.unitPrice
    }));
    setCart(cartItems);
  }, [editingOrderId]);

  const handleCreateClient = () => {
    const errors: { name?: string; phone?: string } = {};
    if (!newClientName.trim()) {
      errors.name = "Name is required.";
    }
    if (!newClientPhone.trim()) {
      errors.phone = "Phone is required.";
    }
    setNewClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newId = `C${clients.length + 1}`;
    const newClient = {
      id: newId,
      name: newClientName.trim(),
      phone: newClientPhone.trim()
    };

    setClients((prev) => [...prev, newClient]);
    setSelectedClientId(newId);
    setStep(2);

    setNewClientName("");
    setNewClientPhone("");
    setNewClientErrors({});
    setNewClientOpen(false);
  };

  const handleValidate = () => {
    if (!selectedClient || cart.length === 0) return;

    const orderId =
      editingOrderId ??
      `CMD-${Date.now().toString().slice(-6)}`;

    const items = cart.map((item) => {
      const product = mockProducts.find((p) => p.id === item.productId)!;
      const unitPrice = item.unitPrice ?? product.price;
      return {
        productId: item.productId,
        name: product.name,
        reference: product.reference,
        quantity: item.qty,
        unitPrice
      };
    });

    const order: BonCommande = {
      id: orderId,
      clientName: selectedClient.name,
      clientPhone: selectedClient.phone,
      sellerName: "Seller Name",
      date: new Date().toISOString().slice(0, 10),
      status: "pending",
      totalAmount,
      items
    };

    upsertBonCommande(order);
    router.push("/seller");
  };

  return (
    <div className="space-y-6">
      <Header role="seller" name="Seller Name" />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
        <div className="space-y-4">
          {/* Step indicator */}
          <Card className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
              <button
                className={`flex items-center gap-2 rounded-full px-3 py-1 ${
                  step === 1 ? "bg-slate-900 text-white" : "bg-slate-100"
                }`}
                onClick={() => setStep(1)}
              >
                <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
                  1
                </span>
                Select client
              </button>
              <span className="h-px w-10 bg-slate-200" />
              <button
                className={`flex items-center gap-2 rounded-full px-3 py-1 ${
                  step === 2 ? "bg-slate-900 text-white" : "bg-slate-100"
                }`}
                onClick={() => selectedClient && setStep(2)}
              >
                <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
                  2
                </span>
                Select products
              </button>
            </div>
          </Card>

          {step === 1 ? (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Select client
                  </h2>
                  <p className="text-xs text-slate-500">
                    Search existing clients or create a new one.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewClientOpen(true)}
                  className="rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-medium shadow-soft hover:bg-slate-800"
                >
                  + New client
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search client by name or phone..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setStep(2);
                    }}
                    className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left text-xs hover:bg-slate-50 ${
                      client.id === selectedClientId
                        ? "border border-slate-900/10 bg-slate-50"
                        : "border border-transparent"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-800">{client.name}</p>
                      <p className="text-slate-500">{client.phone}</p>
                    </div>
                    <span className="text-[11px] text-slate-400">Select</span>
                  </button>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Select products
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add items to the Bon de Commande.
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  Client:{" "}
                  <span className="font-medium text-slate-800">
                    {selectedClient?.name}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search by name or reference..."
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <div className="flex gap-2 text-[11px]">
                  {["All", "Sanitaire", "Accessoires", "Tuyaux", "Others"].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`rounded-full px-3 py-1 ${
                          categoryFilter === cat
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => {
                  const inCart = cart.some(
                    (item) => item.productId === product.id
                  );
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product.id)}
                      className={`flex flex-col items-start rounded-2xl border px-3 py-3 text-left text-xs shadow-soft/40 transition ${
                        inCart
                          ? "border-slate-900 bg-slate-50 shadow-soft"
                          : "border-slate-100 bg-white hover:shadow-soft"
                      }`}
                    >
                      <div className="relative mb-2 w-full overflow-hidden rounded-2xl bg-slate-50">
                        <div className="pt-[75%]" />
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <p className="font-medium text-slate-800 line-clamp-2">
                        {product.name}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Ref. {product.reference}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {product.price.toFixed(2)} MAD
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] ${
                          inCart
                            ? "bg-slate-200 text-slate-700"
                            : "bg-slate-900 text-white"
                        }`}
                      >
                        {inCart ? "Selected" : "Add"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Cart */}
        <Card className="space-y-4 bg-gradient-to-br from-pastel.yellow/70 via-white to-pastel.pink/70">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Bon de Commande
              </h2>
              <p className="text-xs text-slate-500">
                Review items and validate the order.
              </p>
            </div>
            {selectedClient && (
              <div className="text-[11px] text-right text-slate-500">
                <p className="font-medium text-slate-800">
                  {selectedClient.name}
                </p>
                <p>{selectedClient.phone}</p>
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-xs text-slate-400">
                No products yet. Add items from the left panel.
              </p>
            ) : (
              cart.map((item) => {
                const product = mockProducts.find(
                  (p) => p.id === item.productId
                )!;
                const unitPrice = item.unitPrice ?? product.price;
                const isSelected = selectedCartIds.includes(item.productId);
                return (
                  <div
                    key={item.productId}
                    className={`flex items-center justify-between rounded-2xl px-3 py-2 text-xs ${
                      isSelected ? "bg-slate-100" : "bg-white/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCartSelect(item.productId)}
                        className="h-3 w-3 rounded border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500"
                        aria-label={`Select ${product.name} for delete`}
                      />
                      <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-slate-100">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {product.reference}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1">
                        <button
                          onClick={() => updateQty(product.id, -1)}
                          className="px-2 text-[11px] text-slate-600"
                        >
                          −
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.qty}
                          onChange={(e) =>
                            setQty(product.id, Number(e.target.value) || 1)
                          }
                          className="w-8 border-0 bg-transparent px-1 text-center text-[11px] font-medium text-slate-800 outline-none"
                        />
                        <button
                          onClick={() => updateQty(product.id, 1)}
                          className="px-2 text-[11px] text-slate-600"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500">
                          <span className="uppercase tracking-wide">
                            Unit price
                          </span>
                          <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                            <span className="text-[10px] text-slate-400">
                              MAD
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={unitPrice}
                              onChange={(e) =>
                                updateUnitPrice(
                                  product.id,
                                  Number(e.target.value) || 0
                                )
                              }
                              className="w-20 bg-transparent text-right text-[11px] text-slate-700 outline-none"
                            />
                          </div>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {(unitPrice * item.qty).toFixed(2)} MAD
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Total amount
              </p>
              <p className="text-xl font-semibold text-slate-900">
                {totalAmount.toFixed(2)} MAD
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedCartIds.length > 0 && (
                <button
                  type="button"
                  onClick={deleteSelectedCartItems}
                  className="rounded-full bg-red-50 px-4 py-2 text-[11px] font-medium text-red-600 hover:bg-red-100"
                >
                  Delete selected ({selectedCartIds.length})
                </button>
              )}
              <button
                disabled={!selectedClient || cart.length === 0}
                onClick={handleValidate}
                className="rounded-full bg-slate-900 text-white px-5 py-3 text-xs font-semibold shadow-soft disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Validate Bon de Commande
              </button>
            </div>
          </div>
        </Card>
      </div>
      {/* New client modal */}
      {newClientOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-900">
              Add new client
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Enter client information to use it in this Bon de Commande.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label
                  htmlFor="new-client-name"
                  className="block text-[11px] font-medium text-slate-600"
                >
                  Name
                </label>
                <input
                  id="new-client-name"
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Client full name or company"
                />
                {newClientErrors.name && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {newClientErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="new-client-phone"
                  className="block text-[11px] font-medium text-slate-600"
                >
                  Phone
                </label>
                <input
                  id="new-client-phone"
                  type="tel"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="+212 ..."
                />
                {newClientErrors.phone && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {newClientErrors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewClientOpen(false);
                  setNewClientErrors({});
                }}
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateClient}
                className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-soft hover:bg-slate-800"
              >
                Save client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewBonDeCommandePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NewBonDeCommandePageContent />
    </Suspense>
  );
}


