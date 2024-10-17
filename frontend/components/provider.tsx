"use client";

import { SessionProvider } from "next-auth/react";
import Header from "@/components/components-header";

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Header />
      <main>{children}</main>
    </SessionProvider>
  );
}
