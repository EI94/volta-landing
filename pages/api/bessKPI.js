// pages/api/bessKPI.js

export default function handler(req, res) {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
  
    // Dati simulati ispirati a studi sul BESS
    const mockData = {
      capacityMW: 9,
      capacityMWh: 36,
      currentChargePercent: 65,
      batteryHealthPercent: 98,
      temperatureC: 30, // temperatura media in °C
      cycleCount: 500,
      lastMaintenance: "2023-07-15",
      marketPriceEURPerMWh: 50
    };
  
    res.status(200).json(mockData);
  }
  