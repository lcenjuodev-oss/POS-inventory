import "./globals.css";
import { ReactNode } from "react";
import { RootShell } from "@/components/layout/RootShell";

export const metadata = {
  title: "POS Dashboard Template",
  description: "Offline-first POS dashboard with sync and realtime"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <RootShell>{children}</RootShell>;
}
