import { 
  RevenueStreamData, 
  PPARevenueStream, 
  TollingRevenueStream, 
  CapacityMarketRevenueStream, 
  MACSeRevenueStream, 
  MerchantRevenueStream
} from './types';

// Type guards per verificare il tipo di RevenueStreamData
export function isPPARevenueStream(stream: RevenueStreamData): stream is PPARevenueStream {
  return stream.type === 'PPA';
}

export function isTollingRevenueStream(stream: RevenueStreamData): stream is TollingRevenueStream {
  return stream.type === 'TOLLING';
}

export function isCapacityMarketRevenueStream(stream: RevenueStreamData): stream is CapacityMarketRevenueStream {
  return stream.type === 'CM';
}

export function isMACSeRevenueStream(stream: RevenueStreamData): stream is MACSeRevenueStream {
  return stream.type === 'MACSE';
}

export function isMerchantRevenueStream(stream: RevenueStreamData): stream is MerchantRevenueStream {
  return stream.type === 'MERCHANT';
}

// Funzione per ottenere i campi disponibili in base al tipo di revenue stream
export function getFieldsForRevenueStreamType(type: string): string[] {
  switch (type) {
    case 'PPA':
      return ['counterparty', 'contractDuration', 'priceType', 'strikePrice', 'fixedPrice', 'startDate', 'endDate'];
    case 'TOLLING':
      return ['counterparty', 'contractDuration', 'tollingRemunerationType', 'startDate', 'endDate'];
    case 'CM':
      return ['counterparty', 'contractDuration', 'capacityVolume'];
    case 'MACSE':
      return ['counterparty', 'contractDuration', 'macseServiceType'];
    case 'MERCHANT':
      return ['estimatedRevenue'];
    default:
      return [];
  }
} 