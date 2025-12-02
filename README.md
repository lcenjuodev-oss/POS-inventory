## POS Dashboard – Offline‑First Template

This template is a **full offline‑capable POS dashboard** using:

- **Next.js 14 (App Router) + Tailwind CSS** for the UI (manager & seller dashboards, Bon de Commande flow).
- **Electron + SQLite + Prisma** for the desktop app with a background sync worker.
- **Capacitor + SQLite** for Android/iOS using the same Next.js frontend.
- **Neon PostgreSQL + Prisma** for the cloud backend hosted on Vercel.
- **Offline sync + WebSocket realtime events** for `invoice_added`, `product_updated`, `stock_changed`.

The default UI follows a **soft pastel, rounded, glassy dashboard** similar to your reference.

### 1. Getting started

```bash
cd "POS Project"
npm install
```

Create an `.env` file:

```bash
DATABASE_URL_LOCAL="file:./dev.db"
DATABASE_URL_CLOUD="postgresql://USER:PASSWORD@YOUR-NEON-HOST/DB?sslmode=require"
```

Generate Prisma clients and run migrations:

```bash
npm run prisma:generate:local
PRISMA_SCHEMA=./prisma/schema.local.prisma npx prisma migrate dev --name init-local

npm run prisma:generate:cloud
PRISMA_SCHEMA=./prisma/schema.cloud.prisma npx prisma migrate dev --name init-cloud
```

Run the web app:

```bash
npm run dev
```

Open `http://localhost:3000` for the **manager dashboard**, `http://localhost:3000/seller` for the **seller dashboard**, and `/seller/bon-de-commande/new` for the Bon de Commande flow.

### 2. Project structure

- `app/` – Next.js App Router pages and API routes
  - `page.tsx` – Manager dashboard
  - `seller/page.tsx` – Seller dashboard
  - `seller/bon-de-commande/new/page.tsx` – Bon de Commande UI
  - `api/sync/route.ts` – Cloud sync endpoint (Last‑write‑wins)
  - `api/realtime/route.ts` – WebSocket endpoint for realtime events
- `components/`
  - `layout/Header.tsx` – Shared header (manager/seller)
  - `ui/Card.tsx` – Glassy dashboard card
  - `charts/*` – Line, donut, and bar charts using Recharts
  - `realtime/RealtimeListener.tsx` – Hooks WebSocket events into the UI
- `lib/local-db` – Local database helpers
  - `client.ts` – Prisma client for **SQLite** (Electron/offline)
  - `mobile-sqlite.ts` – Capacitor SQLite helper
- `lib/cloud-db` – Prisma client for **PostgreSQL (Neon)**
- `lib/sync`
  - `localQueue.ts` – Local sync queue stored in SQLite
  - `syncClient.js` – Sync client used by Electron worker (Last‑write‑wins)
- `lib/realtime`
  - `events.ts` – Event names/types
  - `client.ts` – WebSocket client hook
- `electron/`
  - `main.js` – Electron bootstrap (loads Next, starts background worker)
  - `preload.js` – Exposes `window.posSync.syncNow()` to the renderer
  - `sync-worker.js` – Background loop that calls the sync client while online
- `mobile/`
  - `capacitor.config.ts` – Capacitor configuration (Android APK + iOS project)
- `prisma/`
  - `schema.local.prisma` – SQLite schema (desktop/mobile offline)
  - `schema.cloud.prisma` – Postgres schema (Neon cloud backend)

### 3. Offline sync (Last‑write‑wins)

- Local changes are written to SQLite **and** appended to the `SyncOperation` table via `lib/sync/localQueue.ts`.
- The Electron background worker (`electron/sync-worker.js`) periodically runs `runSyncOnce()` which:
  - Sends pending operations + last sync cursor to `/api/sync`.
  - Receives all rows updated since `lastSyncAt` from the cloud.
  - Upserts them into the local SQLite DB.
  - Marks local operations as sent and updates `SyncCursor.lastSync`.
- The `/api/sync` route in `app/api/sync/route.ts`:
  - Applies incoming operations to Neon PostgreSQL.
  - Uses **`updatedAt` on each record as the Last‑write‑wins field**.
  - Returns all updated `Product`, `Client`, and `Order` rows since the client’s last sync.

### 4. Realtime events

- `app/api/realtime/route.ts` implements an **Edge WebSocket endpoint** on `/api/realtime`.
- `components/realtime/RealtimeListener.tsx` subscribes on the client and logs events; extend this to update local React state (for new invoices, stock changes, etc.).
- Call `broadcastRealtimeEvent()` (exported from the same route file) from server code whenever you:
  - Create an invoice → `invoice_added`
  - Update a product → `product_updated`
  - Change stock → `stock_changed`

### 5. Desktop (Electron)

Build the web app then package the desktop app:

```bash
npm run build
npm run build:desktop
```

- macOS output: `.dmg`
- Windows output: `.exe` (NSIS installer)

During runtime:

- Electron loads the Next.js UI.
- `sync-worker.js` polls the network and triggers background sync.
- From the renderer you can also call `window.posSync.syncNow()` to force a manual sync.

### 6. Mobile (Capacitor)

Build the static web assets:

```bash
npm run build
npx next export -o out
```

Then from the project root:

```bash
npx cap sync ios android --configuration ./mobile/capacitor.config.ts
```

This generates:

- **Android APK** project (open in Android Studio, then build APK/AAB).
- **iOS Xcode project** (open in Xcode and run on simulator/device).

The mobile app loads the exported Next.js UI and can use the Capacitor SQLite helper in `lib/local-db/mobile-sqlite.ts` for offline storage and the same `/api/sync` endpoint when online.

### 7. Example CRUD + sync

- Add local CRUD using Prisma in API routes or server actions (e.g. create `app/api/orders/route.ts` that:
  - Writes an `Order` and `OrderItem` records to **local SQLite** (for Electron/mobile).
  - Enqueues a `SyncOperation` with `entity="order"` and `operation="create"`.
  - Broadcasts `invoice_added` over WebSockets.
- On next sync, the order is persisted to Neon PostgreSQL and propagated to other devices.

This template intentionally keeps the sync logic small but fully wired so you can expand models, validation, and conflict resolution rules while preserving the **pastel, rounded, modern dashboard** you requested.


