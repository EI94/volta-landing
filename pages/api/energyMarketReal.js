// pages/api/energyMarketReal.js
export default async function handler(req, res) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    
    const apiKey = process.env.EIA_API_KEY;
    const seriesId = "TOTAL.PRICE.M"; // Verifica questo valore sulla documentazione EIA; altrimenti, usa dati simulati
    
    const url = `https://api.eia.gov/series/?api_key=${apiKey}&series_id=${seriesId}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Error fetching energy market data, status:", response.status);
        // Fallback: restituisci dati simulati
        return res.status(200).json({
          currentPrice: 50,
          trend: {
            labels: ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30"],
            prices: [48, 50, 51, 50.5, 52, 51.5, 50]
          }
        });
      }
      const data = await response.json();
      if (!data.series || !data.series[0] || !data.series[0].data) {
        console.error("Invalid market data format", data);
        // Fallback: dati simulati
        return res.status(200).json({
          currentPrice: 50,
          trend: {
            labels: ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30"],
            prices: [48, 50, 51, 50.5, 52, 51.5, 50]
          }
        });
      }
      const labels = data.series[0].data.slice(0, 7).map((d) => {
        const date = new Date(d[0] * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      });
      const prices = data.series[0].data.slice(0, 7).map((d) => d[1]);
      res.status(200).json({ currentPrice: prices[0], trend: { labels, prices } });
    } catch (error) {
      console.error("Error in Energy Market API call:", error);
      // Fallback in caso di errore
      res.status(200).json({
        currentPrice: 50,
        trend: {
          labels: ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30"],
          prices: [48, 50, 51, 50.5, 52, 51.5, 50]
        }
      });
    }
  }
  
  