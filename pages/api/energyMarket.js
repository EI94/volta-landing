// pages/api/energyMarket.js
export default function handler(req, res) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    // Dati simulati: prezzi negli ultimi 7 punti temporali (in €/MWh)
    const data = {
      currentPrice: 50,
      trend: {
        labels: ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30"],
        prices: [48, 50, 51, 50.5, 52, 51.5, 50]
      }
    };
    res.status(200).json(data);
  }
  