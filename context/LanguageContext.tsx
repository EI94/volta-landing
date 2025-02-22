// context/LanguageContext.tsx
"use client";

import { createContext, useState, ReactNode } from "react";

export type Language = "it" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }): JSX.Element {
  const [language, setLanguage] = useState<Language>("it");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "it" ? "en" : "it"));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}



