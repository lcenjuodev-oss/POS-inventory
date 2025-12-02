This project now supports warehouses in the data model.

High-level Prisma schema design (cloud and local):
- Warehouse: physical location where stock is stored.
- ProductStock: join table that links a Product to a Warehouse with a quantity.

model Warehouse {
  id        String        @id @default(cuid())
  name      String
  code      String        @unique
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  stocks    ProductStock[]
}

model ProductStock {
  id          String   @id @default(cuid())
  productId   String
  warehouseId String
  quantity    Int      @default(0)

  product     Product   @relation(fields: [productId], references: [id])
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id])

  @@unique([productId, warehouseId])
}

NOTE:
- The existing Product.stock field is kept for now to avoid breaking the current mock-based UI.
- When you later switch to real APIs, you can:
  - Either map Product.stock to the sum of ProductStock.quantity across warehouses.
  - Or deprecate Product.stock and use ProductStock exclusively in your queries.


