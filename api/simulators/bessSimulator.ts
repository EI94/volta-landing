import { BessData, BessStatus } from '../../types/bess';

class BessSimulator {
  private currentState: BessData;
  private status: BessStatus;
  private degradationRate: number = 0.0001; // Tasso di degradazione per ciclo
  private timeStep: number = 15; // minuti
  
  constructor() {
    this.currentState = {
      capacityMW: 9,
      capacityMWh: 36,
      currentChargePercent: 65,
      batteryHealthPercent: 98,
      temperatureC: 25,
      cycleCount: 500,
      lastMaintenance: new Date().toISOString(),
      efficiency: 0.92,
      stateOfHealth: 98,
      depthOfDischarge: 35,
      chargeRate: 0,
      dischargeRate: 0
    };

    this.status = {
      isOperational: true,
      faultCodes: [],
      warnings: [],
      lastUpdated: new Date()
    };
  }

  private updateTemperature(power: number) {
    // Simulazione dell'aumento di temperatura basato sul carico
    const ambientTemp = 25;
    const powerFactor = Math.abs(power) / this.currentState.capacityMW;
    const tempIncrease = powerFactor * 5; // Max 5°C increase at full power
    
    this.currentState.temperatureC = ambientTemp + tempIncrease;
    
    // Aggiungi warning se la temperatura è alta
    if (this.currentState.temperatureC > 35) {
      this.status.warnings.push('High temperature warning');
    }
  }

  private updateHealth() {
    // Degradazione basata sui cicli
    const cycleImpact = this.currentState.cycleCount * this.degradationRate;
    // Impatto temperatura
    const tempImpact = Math.max(0, (this.currentState.temperatureC - 25) * 0.01);
    
    this.currentState.batteryHealthPercent = Math.max(
      0,
      100 - cycleImpact - tempImpact
    );
    
    this.currentState.stateOfHealth = this.currentState.batteryHealthPercent;
  }

  public charge(amount: number) {
    if (!this.status.isOperational) return;
    
    const maxCharge = Math.min(
      this.currentState.capacityMW,
      (100 - this.currentState.currentChargePercent) * this.currentState.capacityMWh / 100
    );
    
    const actualCharge = Math.min(amount, maxCharge);
    this.currentState.chargeRate = actualCharge;
    this.currentState.currentChargePercent += (actualCharge / this.currentState.capacityMWh) * 100;
    this.currentState.cycleCount += actualCharge / this.currentState.capacityMWh;
    
    this.updateTemperature(actualCharge);
    this.updateHealth();
  }

  public discharge(amount: number) {
    if (!this.status.isOperational) return;
    
    const maxDischarge = Math.min(
      this.currentState.capacityMW,
      (this.currentState.currentChargePercent * this.currentState.capacityMWh) / 100
    );
    
    const actualDischarge = Math.min(amount, maxDischarge);
    this.currentState.dischargeRate = actualDischarge;
    this.currentState.currentChargePercent -= (actualDischarge / this.currentState.capacityMWh) * 100;
    this.currentState.cycleCount += actualDischarge / this.currentState.capacityMWh;
    
    this.updateTemperature(-actualDischarge);
    this.updateHealth();
  }

  public getCurrentState(): BessData {
    return { ...this.currentState };
  }

  public getStatus(): BessStatus {
    return { ...this.status };
  }

  public simulateTimeStep() {
    // Simulazione del self-discharge (0.1% al giorno)
    const selfDischargeRate = 0.1 / (24 * 60 / this.timeStep);
    this.currentState.currentChargePercent *= (1 - selfDischargeRate);
    
    // Raffreddamento naturale
    const coolingRate = 0.1; // °C per timestep
    if (this.currentState.temperatureC > 25) {
      this.currentState.temperatureC = Math.max(
        25,
        this.currentState.temperatureC - coolingRate
      );
    }
    
    // Aggiorna timestamp
    this.status.lastUpdated = new Date();
  }
}

export default BessSimulator; 