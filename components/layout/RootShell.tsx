"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SunMedium,
  MoonStar,
  LayoutDashboard,
  Boxes,
  FileText,
  ClipboardList,
  Users,
  Truck,
  WalletCards,
  ShieldCheck,
  Settings,
  LifeBuoy,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { RealtimeListener } from "@/components/realtime/RealtimeListener";

interface RootShellProps {
  children: ReactNode;
}

export function RootShell({ children }: RootShellProps) {
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <html lang="en" className={dark ? "dark" : ""}>
      <body className="min-h-screen bg-background text-slate-900">
        <div className="relative flex min-h-screen bg-gradient-to-br from-slate-100 via-background to-slate-100">
          {/* Desktop sidebar overlay */}
          {sidebarOpen && (
            <button
              type="button"
              className="fixed inset-0 z-40 hidden md:block bg-black/30"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation overlay"
            />
          )}
          <aside
            className={`fixed inset-y-4 left-4 z-50 hidden md:flex w-64 flex-col px-6 py-8 gap-6 bg-slate-900 text-white rounded-3xl shadow-soft origin-bottom-left transform transition-all duration-200 ${
              sidebarOpen
                ? "scale-100 opacity-100"
                : "scale-75 opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pastel.yellow to-pastel.pink flex items-center justify-center text-slate-900 font-bold">
                  ☆
                </div>
                <div>
                  <p className="font-semibold text-lg">Starline POS</p>
                  <p className="text-xs text-slate-300">Smart Retail Suite</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                aria-label="Hide sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-1.5 text-xs text-slate-200 mt-4">
              <Link
                href="/"
                className={`w-full rounded-xl px-3 py-2 text-left flex items-center gap-2 transition ${
                  pathname === "/"
                    ? "bg-white/10 text-white font-medium shadow-soft/30"
                    : "hover:bg-white/10"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link
                href="/inventory"
                className={`w-full rounded-xl px-3 py-2 text-left flex items-center gap-2 transition ${
                  pathname === "/inventory"
                    ? "bg-white/10 text-white font-medium shadow-soft/30"
                    : "hover:bg-white/10"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Boxes className="h-4 w-4" />
                <span className="text-sm">Inventory</span>
              </Link>
              <button
                className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/10 transition flex items-center gap-2"
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm">Sales &amp; Invoices</span>
              </button>
              <button
                className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/10 transition flex items-center gap-2"
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                <ClipboardList className="h-4 w-4" />
                <span className="text-sm">Orders</span>
              </button>
              <button
                className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/10 transition flex items-center gap-2"
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                <Users className="h-4 w-4" />
                <span className="text-sm">Customers</span>
              </button>
              <button
                className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/10 transition flex items-center gap-2"
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                <Truck className="h-4 w-4" />
                <span className="text-sm">Suppliers</span>
              </button>
              <button
                className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/10 transition flex items-center gap-2"
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                <WalletCards className="h-4 w-4" />
                <span className="text-sm">Expenses &amp; Reports</span>
              </button>
              <button
                className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/10 transition flex items-center gap-2"
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm">Users &amp; Permissions</span>
              </button>
              <button
                className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/10 transition flex items-center gap-2"
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">Settings</span>
              </button>
              <button
                className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/10 transition flex items-center gap-2"
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                <LifeBuoy className="h-4 w-4" />
                <span className="text-sm">Help &amp; Support</span>
              </button>
            </nav>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Light / Dark</span>
              <button
                onClick={() => setDark((d) => !d)}
                className="inline-flex h-8 w-14 items-center rounded-full bg-slate-700 px-1"
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-900 transition-transform ${
                    dark ? "translate-x-5" : ""
                  }`}
                >
                  {dark ? (
                    <MoonStar className="h-3 w-3" />
                  ) : (
                    <SunMedium className="h-3 w-3" />
                  )}
                </div>
              </button>
            </div>
          </aside>
          {/* Sidebar toggle button (desktop, compact and non-obtrusive) */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="hidden md:inline-flex fixed bottom-6 left-6 z-30 h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-soft hover:bg-slate-900"
            aria-label="Open sidebar"
          >
            <LayoutDashboard className="h-4 w-4" />
          </button>
          <main className="flex-1 px-4 md:px-8 py-6 md:py-8">
            <RealtimeListener />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}


