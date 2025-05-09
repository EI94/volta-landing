// context/LanguageContext.tsx
"use client";

import { createContext, useState, ReactNode, useEffect } from "react";

export type Language = "it" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
}

// Definisci un valore di contesto predefinito
const defaultContextValue: LanguageContextType = {
  language: "it",
  toggleLanguage: () => {},
};

export const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export function LanguageProvider({ children }: { children: ReactNode }): JSX.Element {
  const [language, setLanguage] = useState<Language>("it");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Imposta mounted a true quando il componente è montato sul client
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "it" ? "en" : "it"));
  };
  
  // Evita discrepanze di hydration ritardando il rendering dei contenuti dipendenti dalla lingua
  // finché il componente non è montato sul client
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}



