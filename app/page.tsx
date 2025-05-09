// app/page.tsx
"use client";

import React, { useContext } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../translations";
import MLOptimizationDashboard from '../components/MLOptimizationDashboard';

// Dati di esempio per il test
const mockBessData = Array.from({ length: 24 }, (_, i) => {
  const date = new Date(2024, 0, 1, i);
  return {
    timestamp: date,
    chargePercent: Math.round(Math.random() * 100),
    healthPercent: Math.round(95 + Math.random() * 5),
    temperature: Math.round(25 + Math.random() * 10)
  };
});

const mockPvData = Array.from({ length: 24 }, (_, i) => {
  const date = new Date(2024, 0, 1, i);
  return {
    timestamp: date,
    outputMW: Math.round(Math.random() * 10 * 100) / 100,
    performanceRatio: Math.round(85 + Math.random() * 15),
    temperature: Math.round(20 + Math.random() * 15)
  };
});

export default function HomePage(): JSX.Element {
  // Utilizza il contesto e verifica che non sia undefined
  const langContext = useContext(LanguageContext);
  if (!langContext) {
    throw new Error("LanguageContext is not provided");
  }
  const { language } = langContext;
  const t = translations[language].home;

  return (
    <>
      <Header />
      <main>
        {/* Sezione Hero con video di sfondo */}
        <section className="relative flex flex-col items-center justify-center py-20 bg-gray-900">
          <video
            autoPlay
            loop
            muted
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/video.renewables.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 text-center text-white">
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
              {t.title}
            </h1>
            <p className="text-2xl md:text-3xl mb-10 max-w-3xl mx-auto">
              {t.subtitle}
            </p>
            <Link
              href="/demo"
              className="inline-block bg-blue-600 text-white px-10 py-4 rounded-full text-2xl font-semibold shadow-lg hover:bg-blue-700 transition duration-300"
            >
              {t.exploreDemo}
            </Link>
          </div>
        </section>
        {/* Sezione Soluzione */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">
              {t.solution}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t.solutionText}
            </p>
          </div>
        </section>
        <MLOptimizationDashboard
          bessData={mockBessData}
          pvData={mockPvData}
        />
      </main>
      <Footer />
    </>
  );
}
