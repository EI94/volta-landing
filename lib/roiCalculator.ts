// lib/roiCalculator.ts
export interface BessData {
  capacityMW: number;
  capacityMWh: number;
  currentChargePercent: number;
  batteryHealthPercent: number;
  marketPriceEURPerMWh: number;
}

export interface ROICalculation {
  estimatedHourlyRevenue: number;
  estimatedDailyRevenue: number;
  estimatedAnnualROI: number;
}

/**
 * Calcola il ROI basato sui dati dell’asset e sull'investimento iniziale.
 */
export function calculateROI(bess: BessData, initialInvestment: number): ROICalculation {
  // Calcola l'energia disponibile (in MWh) sulla base dello stato di carica
  const availableEnergy = (bess.capacityMWh * bess.currentChargePercent) / 100;
  // Calcola il ricavo orario: considera che non tutta l'energia disponibile è vendibile;
  // per semplicità usiamo il valore teorico, ma in produzione aggiungeremmo un fattore di utilizzo.
  const estimatedHourlyRevenue = availableEnergy * bess.marketPriceEURPerMWh;
  const estimatedDailyRevenue = estimatedHourlyRevenue * 24;
  const annualRevenue = estimatedDailyRevenue * 350; // ipotizziamo 350 giorni di operatività
  const estimatedAnnualROI = (annualRevenue / initialInvestment) * 100;
  return { estimatedHourlyRevenue, estimatedDailyRevenue, estimatedAnnualROI };
}
