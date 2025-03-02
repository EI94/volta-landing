import { z } from 'zod';

// Tipi di revenue stream supportati
export type RevenueStreamType = 
  | 'MERCHANT'   // Vendita diretta sul mercato energetico
  | 'PPA'        // Power Purchase Agreement
  | 'TOLLING'    // Contratto di Tolling
  | 'MACSE'      // Mercato Ambientale di Capacità di Stoccaggio Energetico
  | 'CM';        // Capacity Market

// Definizione dei parametri per ciascun revenue stream
export interface MerchantConfig {
  type: 'MERCHANT';
  preferredMarkets: Array<'MGP' | 'MI' | 'MD' | 'MSD'>;
  minimumPrice: number;     // Soglia minima di prezzo per far partire la scarica
  maximumPrice: number;     // Soglia massima di prezzo per far partire la carica
}

export interface PPAConfig {
  type: 'PPA';
  contractPrice: number;    // Prezzo concordato nel contratto
  contractDuration: number; // Durata del contratto in mesi
  counterparty: string;     // Nome della controparte
  minimumSupply: number;    // Energia minima da fornire in MWh
  penaltyRate: number;      // Tasso di penale per mancata fornitura
}

export interface TollingConfig {
  type: 'TOLLING';
  feePerMWh: number;        // Tariffa per MWh elaborato
  minimumOperation: number; // Operazione minima in MWh
  contractedCapacity: number; // Capacità contrattata in MW
}

export interface MACESConfig {
  type: 'MACSE';
  certificationPrice: number; // Prezzo del certificato
  certificationPeriod: number; // Durata della certificazione in mesi
  minimumAvailability: number; // Disponibilità minima richiesta in %
}

export interface CMConfig {
  type: 'CM';
  capacityPrice: number;    // Prezzo della capacità in €/MW/anno
  contractedCapacity: number; // Capacità contrattata in MW
  deliveryPeriod: number;   // Periodo di fornitura in mesi
  penalties: number;        // Penali per mancata disponibilità
}

// Unione dei tipi di configurazione
export type RevenueStreamConfig = 
  | MerchantConfig
  | PPAConfig
  | TollingConfig
  | MACESConfig
  | CMConfig;

// Modello per la configurazione di un asset
export interface AssetConfig {
  id: string;
  name: string;
  location: {
    city: string;
    country: string;
    zone: string; // Zona di mercato (NORD, CNOR, CSUD, SUD, SICI, SARD)
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  capacity: {
    power: number; // MW
    energy: number; // MWh
  };
  efficiency: number; // % di efficienza del ciclo di carica/scarica
  revenueStream: RevenueStreamConfig;
  constraints: {
    maxCycles: number; // Numero massimo di cicli al giorno
    minSOC: number;   // Stato di carica minimo (%)
    maxSOC: number;   // Stato di carica massimo (%)
    minSOH: number;   // Stato di salute minimo (%)
  };
}

// Schema Zod per la validazione della configurazione dell'asset
export const AssetConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  location: z.object({
    city: z.string(),
    country: z.string(),
    zone: z.enum(['NORD', 'CNOR', 'CSUD', 'SUD', 'SICI', 'SARD']),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    })
  }),
  capacity: z.object({
    power: z.number().positive(),
    energy: z.number().positive()
  }),
  efficiency: z.number().min(0).max(100),
  revenueStream: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('MERCHANT'),
      preferredMarkets: z.array(z.enum(['MGP', 'MI', 'MD', 'MSD'])),
      minimumPrice: z.number().nonnegative(),
      maximumPrice: z.number().nonnegative()
    }),
    z.object({
      type: z.literal('PPA'),
      contractPrice: z.number().nonnegative(),
      contractDuration: z.number().positive(),
      counterparty: z.string(),
      minimumSupply: z.number().nonnegative(),
      penaltyRate: z.number().nonnegative()
    }),
    z.object({
      type: z.literal('TOLLING'),
      feePerMWh: z.number().nonnegative(),
      minimumOperation: z.number().nonnegative(),
      contractedCapacity: z.number().nonnegative()
    }),
    z.object({
      type: z.literal('MACSE'),
      certificationPrice: z.number().nonnegative(),
      certificationPeriod: z.number().positive(),
      minimumAvailability: z.number().min(0).max(100)
    }),
    z.object({
      type: z.literal('CM'),
      capacityPrice: z.number().nonnegative(),
      contractedCapacity: z.number().nonnegative(),
      deliveryPeriod: z.number().positive(),
      penalties: z.number().nonnegative()
    })
  ]),
  constraints: z.object({
    maxCycles: z.number().nonnegative(),
    minSOC: z.number().min(0).max(100),
    maxSOC: z.number().min(0).max(100),
    minSOH: z.number().min(0).max(100)
  })
});

// Utility per creare una nuova configurazione asset
export function createAssetConfig(data: Partial<AssetConfig>): AssetConfig {
  // Valori di default
  const defaultConfig: AssetConfig = {
    id: crypto.randomUUID(),
    name: 'Nuovo Asset',
    location: {
      city: 'Roma',
      country: 'IT',
      zone: 'CSUD',
      coordinates: {
        lat: 41.9028,
        lng: 12.4964
      }
    },
    capacity: {
      power: 10,
      energy: 40
    },
    efficiency: 90,
    revenueStream: {
      type: 'MERCHANT',
      preferredMarkets: ['MGP', 'MI'],
      minimumPrice: 80,
      maximumPrice: 30
    },
    constraints: {
      maxCycles: 1,
      minSOC: 10,
      maxSOC: 90,
      minSOH: 80
    }
  };

  // Combina i dati forniti con i valori di default
  const mergedConfig = {
    ...defaultConfig,
    ...data,
    location: {
      ...defaultConfig.location,
      ...(data.location || {})
    },
    capacity: {
      ...defaultConfig.capacity,
      ...(data.capacity || {})
    },
    constraints: {
      ...defaultConfig.constraints,
      ...(data.constraints || {})
    }
  };

  // Gestisci il caso speciale di revenueStream, che è un'unione discriminata
  if (data.revenueStream) {
    mergedConfig.revenueStream = data.revenueStream;
  }

  return mergedConfig;
}

// Elenco delle zone di mercato in Italia
export const MARKET_ZONES = ['NORD', 'CNOR', 'CSUD', 'SUD', 'SICI', 'SARD'] as const;

// Descrizioni dei tipi di revenue stream
export const REVENUE_STREAM_DESCRIPTIONS: Record<RevenueStreamType, string> = {
  'MERCHANT': 'Vendita diretta sul mercato energetico senza contratti a lungo termine',
  'PPA': 'Contratto a lungo termine per l\'acquisto di energia a un prezzo fisso',
  'TOLLING': 'Servizio di trasformazione dell\'energia con tariffa a consumo',
  'MACSE': 'Mercato dei certificati ambientali per lo stoccaggio energetico',
  'CM': 'Partecipazione al mercato della capacità per garantire disponibilità'
};

// Funzione per calcolare i ricavi stimati in base al tipo di revenue stream
export function estimateRevenue(
  config: AssetConfig, 
  marketPrice: number, 
  energyProduced: number
): number {
  switch(config.revenueStream.type) {
    case 'MERCHANT':
      return energyProduced * marketPrice;
    
    case 'PPA':
      return energyProduced * config.revenueStream.contractPrice;
    
    case 'TOLLING':
      return energyProduced * config.revenueStream.feePerMWh;
    
    case 'MACSE':
      // Semplificazione del calcolo per MACSE
      return (energyProduced * marketPrice) + 
        (config.revenueStream.certificationPrice * config.capacity.power);
    
    case 'CM':
      // Ricavo base dal CM più eventuale vendita sul mercato
      const cmRevenue = (config.revenueStream.capacityPrice * config.revenueStream.contractedCapacity) / 365;
      return cmRevenue + (energyProduced * marketPrice * 0.5); // assumiamo che solo il 50% venga venduto
    
    default:
      return 0;
  }
} 