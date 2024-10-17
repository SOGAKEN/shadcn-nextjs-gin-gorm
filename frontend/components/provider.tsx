"use client";

import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Header />
      <main>{children}</main>
    </SessionProvider>
  );
}
