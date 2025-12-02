"use client";

import { Bell, Settings, UserCircle2 } from "lucide-react";

interface HeaderProps {
  role: "manager" | "seller";
  name: string;
}

export function Header({ role, name }: HeaderProps) {
  return (
    <header className="mb-6 md:mb-8 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {role === "manager" ? "Manager dashboard" : "Seller workspace"}
        </p>
        <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-slate-900">
          Welcome, {name}
          <span className="ml-1"></span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s what&apos;s happening in your store today.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {role === "seller" && (
          <button className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200">
            Logout
          </button>
        )}
        <button className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition shadow-soft/20">
          <Bell className="h-4 w-4" />
        </button>
        <button className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition shadow-soft/20">
          <Settings className="h-4 w-4" />
        </button>
        <div className="hidden md:flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-soft">
          <UserCircle2 className="h-6 w-6 text-slate-500" />
          <div className="text-xs">
            <p className="font-medium text-slate-800">{name}</p>
            <p className="text-slate-400">{role === "manager" ? "Manager" : "Seller"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}


