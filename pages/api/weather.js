// pages/api/weather.js
export default function handler(req, res) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    // Dati simulati per previsioni meteo (irradianza in W/m², temperatura in °C)
    const data = {
      location: "Viterbo, Italy",
      forecast: {
        labels: ["10:00", "11:00", "12:00", "13:00", "14:00"],
        irradiance: [800, 850, 900, 870, 830],
        temperature: [28, 29, 30, 29, 28]
      },
      favorable: true
    };
    res.status(200).json(data);
  }
  