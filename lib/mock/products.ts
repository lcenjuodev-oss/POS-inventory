export type ProductStatus = "active" | "inactive";

export type ProductCategory =
  | "Sanitary"
  | "Accessories"
  | "Pipes"
  | "Tools"
  | "Others";

export interface Supplier {
  id: string;
  name: string;
}

export interface Warehouse {
  id: string;
  name: string;
}

export interface StockLogEntry {
  id: string;
  productId: string;
  date: string; // ISO string
  action: "Added" | "Sold" | "Returned" | "Adjusted";
  quantity: number; // positive or negative
  user: string;
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  reference: string;
  category: ProductCategory;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  supplierId: string;
  supplierName: string;
   // Single-warehouse assignment in the mock layer. In the real DB, use ProductStock.
  warehouseId: string;
  warehouseName: string;
  status: ProductStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithLog extends Product {
  stockLog: StockLogEntry[];
}

export const mockWarehouses: Warehouse[] = [
  { id: "w1", name: "Main Warehouse" },
  { id: "w2", name: "Secondary Warehouse" },
  { id: "w3", name: "Outlet Stockroom" }
];

export const mockSuppliers: Supplier[] = [
  { id: "s1", name: "AquaFlow Distributors" },
  { id: "s2", name: "Sanitaire Pro Supply" },
  { id: "s3", name: "Metro Pipes & Fittings" },
  { id: "s4", name: "Premium Tools Co." },
  { id: "s5", name: "Universal Hardware" }
];

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `prod-${Math.random().toString(36).slice(2, 11)}`;
}

function createProduct(partial: Omit<ProductWithLog, "id" | "createdAt" | "updatedAt" | "stockLog"> & {
  createdDaysAgo?: number;
}): ProductWithLog {
  const createdAt = daysAgo(partial.createdDaysAgo ?? 10);
  const updatedAt = createdAt;
  return {
    id: generateId(),
    createdAt,
    updatedAt,
    stockLog: [],
    ...partial
  };
}

// TODO: replace this mock array with a real API call, e.g. fetch('/api/products')
export const mockProducts: ProductWithLog[] = [
  createProduct({
    name: "Premium Shower Set Chrome",
    sku: "SAN-001",
    reference: "REF-SAN-001",
    category: "Sanitary",
    purchasePrice: 75,
    salePrice: 129,
    stock: 42,
    minStock: 10,
    supplierId: "s2",
    supplierName: "Sanitaire Pro Supply",
    warehouseId: "w1",
    warehouseName: "Main Warehouse",
    status: "active"
  }),
  createProduct({
    name: "Wall Mounted Basin Mixer",
    sku: "SAN-002",
    reference: "REF-SAN-002",
    category: "Sanitary",
    purchasePrice: 55,
    salePrice: 95,
    stock: 12,
    minStock: 8,
    supplierId: "s2",
    supplierName: "Sanitaire Pro Supply",
    warehouseId: "w1",
    warehouseName: "Main Warehouse",
    status: "active",
    createdDaysAgo: 5
  }),
  createProduct({
    name: "Flexible Shower Hose 1.5m",
    sku: "ACC-010",
    reference: "REF-ACC-010",
    category: "Accessories",
    purchasePrice: 8,
    salePrice: 19,
    stock: 6,
    minStock: 10,
    supplierId: "s1",
    supplierName: "AquaFlow Distributors",
    warehouseId: "w2",
    warehouseName: "Secondary Warehouse",
    status: "active",
    createdDaysAgo: 15
  }),
  createProduct({
    name: "Stainless Steel Floor Drain",
    sku: "ACC-011",
    reference: "REF-ACC-011",
    category: "Accessories",
    purchasePrice: 6,
    salePrice: 15,
    stock: 0,
    minStock: 5,
    supplierId: "s1",
    supplierName: "AquaFlow Distributors",
    warehouseId: "w2",
    warehouseName: "Secondary Warehouse",
    status: "active",
    createdDaysAgo: 25
  }),
  createProduct({
    name: "PVC Pipe 32mm - 4m",
    sku: "PIP-032",
    reference: "REF-PIP-032",
    category: "Pipes",
    purchasePrice: 4,
    salePrice: 9,
    stock: 180,
    minStock: 60,
    supplierId: "s3",
    supplierName: "Metro Pipes & Fittings",
    warehouseId: "w1",
    warehouseName: "Main Warehouse",
    status: "active"
  }),
  createProduct({
    name: "PVC Pipe 50mm - 4m",
    sku: "PIP-050",
    reference: "REF-PIP-050",
    category: "Pipes",
    purchasePrice: 6,
    salePrice: 13,
    stock: 22,
    minStock: 40,
    supplierId: "s3",
    supplierName: "Metro Pipes & Fittings",
    warehouseId: "w1",
    warehouseName: "Main Warehouse",
    status: "active"
  }),
  createProduct({
    name: "Copper Pipe 15mm - 3m",
    sku: "PIP-115",
    reference: "REF-PIP-115",
    category: "Pipes",
    purchasePrice: 11,
    salePrice: 24,
    stock: 5,
    minStock: 15,
    supplierId: "s3",
    supplierName: "Metro Pipes & Fittings",
    warehouseId: "w2",
    warehouseName: "Secondary Warehouse",
    status: "active"
  }),
  createProduct({
    name: "Adjustable Pipe Wrench 14\"",
    sku: "TLS-014",
    reference: "REF-TLS-014",
    category: "Tools",
    purchasePrice: 19,
    salePrice: 39,
    stock: 17,
    minStock: 6,
    supplierId: "s4",
    supplierName: "Premium Tools Co.",
    warehouseId: "w3",
    warehouseName: "Outlet Stockroom",
    status: "active"
  }),
  createProduct({
    name: "Adjustable Pipe Wrench 18\"",
    sku: "TLS-018",
    reference: "REF-TLS-018",
    category: "Tools",
    purchasePrice: 24,
    salePrice: 49,
    stock: 9,
    minStock: 6,
    supplierId: "s4",
    supplierName: "Premium Tools Co.",
    warehouseId: "w3",
    warehouseName: "Outlet Stockroom",
    status: "active"
  }),
  createProduct({
    name: "PTFE Thread Seal Tape",
    sku: "OTH-001",
    reference: "REF-OTH-001",
    category: "Others",
    purchasePrice: 0.5,
    salePrice: 1.5,
    stock: 340,
    minStock: 200,
    supplierId: "s5",
    supplierName: "Universal Hardware",
    warehouseId: "w1",
    warehouseName: "Main Warehouse",
    status: "active"
  }),
  createProduct({
    name: "Water Heater Safety Valve",
    sku: "SAN-050",
    reference: "REF-SAN-050",
    category: "Sanitary",
    purchasePrice: 18,
    salePrice: 35,
    stock: 3,
    minStock: 10,
    supplierId: "s2",
    supplierName: "Sanitaire Pro Supply",
    warehouseId: "w2",
    warehouseName: "Secondary Warehouse",
    status: "active"
  }),
  createProduct({
    name: "Bathroom Accessory Set Matte Black",
    sku: "ACC-050",
    reference: "REF-ACC-050",
    category: "Accessories",
    purchasePrice: 32,
    salePrice: 69,
    stock: 8,
    minStock: 5,
    supplierId: "s1",
    supplierName: "AquaFlow Distributors",
    warehouseId: "w2",
    warehouseName: "Secondary Warehouse",
    status: "active"
  }),
  createProduct({
    name: "Under-sink Trap Kit 40mm",
    sku: "SAN-030",
    reference: "REF-SAN-030",
    category: "Sanitary",
    purchasePrice: 9,
    salePrice: 21,
    stock: 25,
    minStock: 12,
    supplierId: "s2",
    supplierName: "Sanitaire Pro Supply",
    warehouseId: "w1",
    warehouseName: "Main Warehouse",
    status: "active"
  }),
  createProduct({
    name: "Compression Fitting Elbow 1/2\"",
    sku: "PIP-210",
    reference: "REF-PIP-210",
    category: "Pipes",
    purchasePrice: 1.2,
    salePrice: 2.8,
    stock: 260,
    minStock: 120,
    supplierId: "s3",
    supplierName: "Metro Pipes & Fittings",
    warehouseId: "w1",
    warehouseName: "Main Warehouse",
    status: "active"
  }),
  createProduct({
    name: "Compression Fitting Tee 1/2\"",
    sku: "PIP-211",
    reference: "REF-PIP-211",
    category: "Pipes",
    purchasePrice: 1.4,
    salePrice: 3.1,
    stock: 140,
    minStock: 120,
    supplierId: "s3",
    supplierName: "Metro Pipes & Fittings",
    warehouseId: "w1",
    warehouseName: "Main Warehouse",
    status: "active"
  }),
  createProduct({
    name: "Safety Gloves Nitrile Grip",
    sku: "TLS-060",
    reference: "REF-TLS-060",
    category: "Tools",
    purchasePrice: 4.5,
    salePrice: 9.5,
    stock: 58,
    minStock: 20,
    supplierId: "s4",
    supplierName: "Premium Tools Co.",
    warehouseId: "w3",
    warehouseName: "Outlet Stockroom",
    status: "active"
  }),
  createProduct({
    name: "Pipe Cutter 3-28mm",
    sku: "TLS-070",
    reference: "REF-TLS-070",
    category: "Tools",
    purchasePrice: 15,
    salePrice: 32,
    stock: 0,
    minStock: 5,
    supplierId: "s4",
    supplierName: "Premium Tools Co.",
    warehouseId: "w3",
    warehouseName: "Outlet Stockroom",
    status: "inactive"
  }),
  createProduct({
    name: "Wall Plug & Screw Kit",
    sku: "OTH-020",
    reference: "REF-OTH-020",
    category: "Others",
    purchasePrice: 3.2,
    salePrice: 7.5,
    stock: 95,
    minStock: 40,
    supplierId: "s5",
    supplierName: "Universal Hardware",
    warehouseId: "w2",
    warehouseName: "Secondary Warehouse",
    status: "active"
  }),
  createProduct({
    name: "Corner Shower Shelf Glass",
    sku: "ACC-090",
    reference: "REF-ACC-090",
    category: "Accessories",
    purchasePrice: 14,
    salePrice: 32,
    stock: 14,
    minStock: 8,
    supplierId: "s1",
    supplierName: "AquaFlow Distributors",
    warehouseId: "w2",
    warehouseName: "Secondary Warehouse",
    status: "active"
  }),
  createProduct({
    name: "Floor Standing Cabinet White",
    sku: "OTH-100",
    reference: "REF-OTH-100",
    category: "Others",
    purchasePrice: 65,
    salePrice: 129,
    stock: 4,
    minStock: 4,
    supplierId: "s5",
    supplierName: "Universal Hardware",
    warehouseId: "w1",
    warehouseName: "Main Warehouse",
    status: "active",
    createdDaysAgo: 2
  })
];


