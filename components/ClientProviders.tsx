// components/ClientProviders.tsx
"use client";

import { LanguageProvider } from "../context/LanguageContext";

export default function ClientProviders({ children }: { children: React.ReactNode }): JSX.Element {
  return <LanguageProvider>{children}</LanguageProvider>;
}
