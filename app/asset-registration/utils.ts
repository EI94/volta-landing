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
  return stream.type === 'ppa';
}

export function isTollingRevenueStream(stream: RevenueStreamData): stream is TollingRevenueStream {
  return stream.type === 'tolling';
}

export function isCapacityMarketRevenueStream(stream: RevenueStreamData): stream is CapacityMarketRevenueStream {
  return stream.type === 'capacityMarket';
}

export function isMACSeRevenueStream(stream: RevenueStreamData): stream is MACSeRevenueStream {
  return stream.type === 'macse';
}

export function isMerchantRevenueStream(stream: RevenueStreamData): stream is MerchantRevenueStream {
  return stream.type === 'merchant';
}

// Funzione per ottenere i campi disponibili in base al tipo di revenue stream
export function getFieldsForRevenueStreamType(type: string): string[] {
  switch (type) {
    case 'ppa':
      return ['counterparty', 'contractDuration', 'priceType', 'strikePrice', 'fixedPrice', 'startDate', 'endDate'];
    case 'tolling':
      return ['counterparty', 'contractDuration', 'tollingRemunerationType', 'startDate', 'endDate'];
    case 'capacityMarket':
      return ['counterparty', 'contractDuration', 'capacityVolume'];
    case 'macse':
      return ['counterparty', 'contractDuration', 'macseServiceType'];
    case 'merchant':
      return ['estimatedRevenue'];
    default:
      return [];
  }
} 