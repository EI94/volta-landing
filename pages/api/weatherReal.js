// pages/api/weatherReal.js
export default async function handler(req, res) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    // Usa il parametro "city" dalla query, default a "Viterbo,IT"
    const { city } = req.query;
    const location = city || "Viterbo,IT";
    const apiKey = process.env.OPENWEATHER_API_KEY;
  
    // Per verificare che la chiave sia letta correttamente, puoi temporaneamente loggarla (ricordati di rimuovere il log in produzione)
    // console.log("OPENWEATHER_API_KEY:", apiKey);
  
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Error fetching weather data" });
      }
      const data = await response.json();
      // Verifica che data.list sia definito
      if (!data.list || !Array.isArray(data.list)) {
        return res.status(500).json({ error: "Unexpected data format", data });
      }
      // Estrai le previsioni per i prossimi 5 periodi
      const labels = data.list.slice(0, 5).map((entry) => {
        const date = new Date(entry.dt * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      });
      const temperature = data.list.slice(0, 5).map((entry) => entry.main.temp);
      // Simula irradiance in base alla temperatura (valore esemplificativo)
      const irradiance = temperature.map((temp) => Math.max(0, (temp - 20) * 50));
  
      res.status(200).json({
        location: data.city.name + ", " + data.city.country,
        forecast: { labels, irradiance, temperature },
        favorable: temperature.every((t) => t > 20),
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }
  