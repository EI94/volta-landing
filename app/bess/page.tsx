"use client";

import React, { useContext } from 'react';
import BESSConfig from '@/components/BESSConfig';
import { LanguageContext } from '@/context/LanguageContext';
import { translations } from '@/translations';

export default function BESSPage() {
  const langContext = useContext(LanguageContext);
  if (!langContext) {
    throw new Error("LanguageContext is not provided");
  }
  const { language } = langContext;
  const t = translations[language].bess;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">{t.title}</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <BESSConfig />
      </div>
    </div>
  );
} 