// Rimuovo l'importazione non utilizzata
// import { BessData } from '../types/bess';

// Definisco un'interfaccia per i dati di performance
export interface BESSPerformanceData {
  timestamp: string;
  batteryHealthPercent: number;
  currentChargePercent: number;
  efficiencyPercent: number;
  temperatureC: number;
  cyclesCompleted: number;
  lastMaintenanceDate: string;
  estimatedRemainingLifePercent: number;
  capacityMWh: number;
  marketPriceEURPerMWh: number;
  dailyOperationHours: number;
  dailyRevenue: number;
  monthlyAvailabilityPercent: number;
  performanceScore: number;
}

/**
 * Funzione che recupera i dati di performance del BESS
 * Questa funzione può essere modificata per connettersi a un'API esterna reale o utilizzare dati simulati
 */
export async function fetchBESSPerformance(): Promise<BESSPerformanceData> {
  console.log("Recupero dati di performance del BESS");
  
  // Per ora, restituiamo dati simulati
  const currentDate = new Date();
  
  // Dati di simulazione per un sistema BESS
  const performanceData: BESSPerformanceData = {
    timestamp: currentDate.toISOString(),
    batteryHealthPercent: 95 + (Math.random() * 5 - 2.5), // Valore tra 92.5% e 97.5%
    currentChargePercent: 60 + (Math.random() * 20 - 10), // Valore tra 50% e 70%
    efficiencyPercent: 92 + (Math.random() * 4 - 2),  // Valore tra 90% e 94%
    temperatureC: 25 + (Math.random() * 5 - 2.5),  // Valore tra 22.5°C e 27.5°C
    cyclesCompleted: Math.floor(120 + Math.random() * 10),  // Valore tra 120 e 130 cicli
    lastMaintenanceDate: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni fa
    estimatedRemainingLifePercent: 88 + (Math.random() * 4 - 2),  // Valore tra 86% e 90%
    capacityMWh: 10,
    marketPriceEURPerMWh: 45 + (Math.random() * 20 - 10),  // Valore tra 35 e 55 EUR/MWh
    dailyOperationHours: 4 + (Math.random() * 2), // Valore tra 4 e 6 ore
    dailyRevenue: 2000 + (Math.random() * 500), // Valore tra 2000 e 2500 EUR
    monthlyAvailabilityPercent: 98 + (Math.random() * 2 - 1), // Valore tra 97% e 99%
    performanceScore: 85 + (Math.random() * 10),  // Valore tra 85 e 95
  };
  
  console.log("Dati di performance BESS generati:", performanceData);
  
  return performanceData;
} 