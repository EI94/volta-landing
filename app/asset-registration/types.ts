// Definizione delle interfacce per la registrazione degli asset

// Definizioni di base
export interface BaseFormData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  gridConnected: boolean;
  hasIncentives: boolean;
  incentivesDescription: string;
  revenueStreamType?: string;
}

// Definizione corretta per i flussi di ricavi
export type RevenueStreamType = 'PPA' | 'TOLLING' | 'MERCHANT' | 'CM' | 'MACSE';

// Base per tutti i flussi di ricavi
export interface BaseRevenueStream {
  type: RevenueStreamType;
}

// PPA Revenue Stream
export interface PPARevenueStream extends BaseRevenueStream {
  type: 'PPA';
  counterparty: string;
  contractDuration: number;
  priceType: string;
  strikePrice?: number;
  fixedPrice?: number;
  startDate: string;
  endDate: string;
  contractPrice?: number;
  indexed?: boolean;
  indexType?: string;
  guaranteedVolume?: number;
  flexibilityClauses?: string;
}

// Tolling Revenue Stream
export interface TollingRevenueStream extends BaseRevenueStream {
  type: 'TOLLING';
  counterparty: string;
  operator?: string;
  contractDuration: number;
  tollingRemunerationType: string;
  remunerationType?: string;
  remunerationValue?: number;
  penalties?: string;
  startDate: string;
  endDate: string;
}

// Capacity Market Revenue Stream
export interface CapacityMarketRevenueStream extends BaseRevenueStream {
  type: 'CM';
  counterparty: string;
  contractDuration: number;
  capacityVolume: number;
  capacityPrice?: number;
  duration?: number;
}

// MACSE Revenue Stream
export interface MACSeRevenueStream extends BaseRevenueStream {
  type: 'MACSE';
  counterparty: string;
  contractDuration: number;
  macseServiceType: string;
  minPrice?: number;
}

// Merchant Revenue Stream
export interface MerchantRevenueStream extends BaseRevenueStream {
  type: 'MERCHANT';
  estimatedRevenue: number;
  strategy?: string;
  mgp?: boolean;
  mi?: boolean;
  msd?: boolean;
  altro?: boolean;
}

// Union type per tutti i tipi di revenue stream
export type RevenueStreamData = PPARevenueStream | TollingRevenueStream | CapacityMarketRevenueStream | MACSeRevenueStream | MerchantRevenueStream;

// Form data per impianti fotovoltaici
export interface PVFormData extends BaseFormData {
  power: number;
  efficiency: number;
  hasTracking: boolean;
  annualDegradation: number;
  productionCurveFile?: File | string;
  revenueStreams: RevenueStreamData[];
  
  // Campi PPA
  ppaCounterparty?: string;
  ppaContractDuration?: string | number;
  ppaPrice?: string | number;
  ppaIndexed?: boolean;
  ppaIndexType?: string;
  ppaGuaranteedVolume?: string | number;
  ppaFlexibilityClauses?: string;
  
  // Campi MACSE
  macseCounterparty?: string;
  macseContractDuration?: string | number;
  macseServiceType?: string;
  macseMinPrice?: string | number;
  
  // Campi Tolling
  tollingOperator?: string;
  tollingRemunerationType?: string;
  tollingRemunerationValue?: string | number;
  tollingContractDuration?: string | number;
  tollingPenalties?: string;
  
  // Campi Merchant
  merchantMGP?: boolean;
  merchantMI?: boolean;
  merchantMSD?: boolean;
  merchantAltro?: boolean;
  merchantStrategy?: string;
  merchantEstimatedRevenue?: string | number;
  
  // Altri campi
  ritiroTariffa?: string | number;
  ritiroStartDate?: string;
  scambioTipo?: string;
  scambioValoreMedio?: string | number;
  altroDescrizione?: string;
  altroModalitaCalcolo?: string;
}

// Form data per sistemi di accumulo
export interface BESSFormData extends BaseFormData {
  capacity: number;
  power: number;
  roundTripEfficiency: number;
  maxCycles: number;
  degradation: number;
  revenueStreams: RevenueStreamData[];
  
  // Campi tecnici aggiuntivi
  energyCapacity?: string | number;
  powerCapacity?: string | number;
  efficiency?: string | number;
  expectedLifetime?: string | number;
  usageStrategy?: string;
  batteryTechnology?: string;
  
  // Campi Tolling
  tollingOperator?: string;
  tollingRemunerationType?: string;
  tollingRemunerationValue?: string | number;
  tollingContractDuration?: string | number;
  tollingPenalties?: string;
  
  // Campi Capacity Market
  cmCapacityVolume?: string | number;
  cmCapacityPrice?: string | number;
  cmDuration?: string | number;
  
  // Campi MACSE
  macseServiceType?: string;
  macseMinPrice?: string | number;
  
  // Campi PPA
  ppaCounterparty?: string;
  ppaContractDuration?: string | number;
  ppaPrice?: string | number;
  ppaGuaranteedVolume?: string | number;
  
  // Campi Merchant
  merchantMGP?: boolean;
  merchantMI?: boolean;
  merchantMSD?: boolean;
  merchantAltro?: boolean;
  merchantStrategy?: string;
  merchantEstimatedRevenue?: string | number;
} 