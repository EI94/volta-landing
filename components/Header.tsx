// components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../translations";

export default function Header(): JSX.Element {
  const langContext = useContext(LanguageContext);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Se il componente non è ancora montato, renderizza una versione semplificata dell'header
  // per evitare problemi di hydration
  if (!mounted) {
    return (
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="w-[150px] h-[50px]"></div>
          <nav className="hidden md:flex space-x-8">
            <div className="text-gray-700"></div>
            <div className="text-gray-700"></div>
          </nav>
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white px-5 py-2 rounded-full"></div>
            <div className="border border-gray-300 rounded px-3 py-1"></div>
          </div>
        </div>
      </header>
    );
  }
  
  const { language, toggleLanguage } = langContext;
  const t = translations[language].header;

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/Volta-logo-RGB-Black.png"
            alt="Volta Logo"
            width={150}
            height={50}
            className="object-contain"
          />
        </Link>
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            {t.home}
          </Link>
          <Link href="/demo" className="text-gray-700 hover:text-blue-600">
            {t.demo}
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="https://calendly.com/volta-energy"
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
          >
            {t.talkToUs}
          </Link>
          <button onClick={toggleLanguage} className="border border-gray-300 rounded px-3 py-1">
            {t.switchLanguage}
          </button>
        </div>
      </div>
    </header>
  );
}



