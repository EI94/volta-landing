// Definizione delle interfacce per la registrazione degli asset

// Interfaccia di base per i campi comuni di tutti i form
export interface BaseFormData {
  name: string;
  latitude: string;
  longitude: string;
  gridConnected: boolean;
  hasIncentives: boolean;
  incentivesDescription?: string; // Campo opzionale per la descrizione degli incentivi
  revenueStreamType: string;
}

// Interfaccia per il form di registrazione PV
export interface PVFormData extends BaseFormData {
  installedCapacity: string;
  panelType: string;
  installationDate: string;
  expectedLifetime: string;
  trackerTechnology: string;
  orientation: string;
  tilt: string;
  pvTechnology: string;
  // Campi specifici per vari revenue stream
  ppaContractLength?: string;
  ppaCounterparty?: string;
  ppaPrice?: string;
  feedInTariff?: string;
  wholeSaleMarketId?: string;
}

// Interfaccia per il form di registrazione BESS
export interface BESSFormData extends BaseFormData {
  energyCapacity: string;
  powerCapacity: string;
  efficiency: string;
  expectedLifetime: string;
  usageStrategy: string;
  batteryTechnology: string;
  roundTripEfficiency: string;
  degradationRate: string;
  // Campi specifici per vari revenue stream
  tollingOperator?: string;
  tollingRate?: string;
  ancillaryServiceType?: string;
  arbitrageStrategy?: string;
} 