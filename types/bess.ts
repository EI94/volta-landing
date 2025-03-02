export interface BessData {
  capacityMW: number;
  capacityMWh: number;
  currentChargePercent: number;
  batteryHealthPercent: number;
  temperatureC: number;
  cycleCount: number;
  lastMaintenance: string;
  efficiency: number;
  stateOfHealth: number;
  depthOfDischarge: number;
  chargeRate: number;
  dischargeRate: number;
}

export interface BessControl {
  targetChargePercent: number;
  maxChargeRate: number;
  maxDischargeRate: number;
  operationMode: 'charge' | 'discharge' | 'idle';
}

export interface BessStatus {
  isOperational: boolean;
  faultCodes: string[];
  warnings: string[];
  lastUpdated: Date;
} 