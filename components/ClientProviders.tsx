// components/ClientProviders.tsx
"use client";

import { LanguageProvider } from "../context/LanguageContext";
import { Suspense } from "react";

export default function ClientProviders({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <Suspense fallback={null}>
      <LanguageProvider>{children}</LanguageProvider>
    </Suspense>
  );
}
