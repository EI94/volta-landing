// pages/api/weatherOpen.js
export default async function handler(req, res) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    // Prende il parametro "city" dalla query string; se non presente, default "Viterbo,IT"
    const { city } = req.query;
    const location = city || "Viterbo,IT";
    const apiKey = process.env.OPENWEATHER_API_KEY;
  
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Error fetching weather data" });
      }
      const data = await response.json();
      if (!data.list || !Array.isArray(data.list)) {
        return res.status(500).json({ error: "Unexpected data format", data });
      }
      // Estrai le previsioni per i primi 5 periodi
      const labels = data.list.slice(0, 5).map((entry) => {
        const date = new Date(entry.dt * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      });
      const temperatures = data.list.slice(0, 5).map((entry) => entry.main.temp);
      // Simula irradiance in base alla temperatura (ad esempio: (temp - 20)*50, ma garantiamo >=0)
      const irradiance = temperatures.map((temp) => Math.max(0, (temp - 20) * 50));
      res.status(200).json({
        location: data.city.name + ", " + data.city.country,
        forecast: { labels, temperatures, irradiance },
        favorable: temperatures.every((temp) => temp > 20),
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }
  