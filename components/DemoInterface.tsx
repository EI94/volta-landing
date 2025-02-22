"use client";

import { useState, useEffect } from "react";
import MultiSiteSelector from "./MultiSiteSelector";
import { calculateROI, BessData } from "../lib/roiCalculator";
import EnergyMarketDashboard from "./EnergyMarketDashboard";
import WeatherOpen from "./WeatherOpen";

// Risposte simulate per gli scenari
const simulatedResponses: { [key: string]: string } = {
  market:
    "Market Participation: Based on current market data, selling energy now could maximize returns.",
  maintenance:
    "Predictive Maintenance: Battery health is optimal with minimal degradation. Routine maintenance is recommended after 50 cycles.",
  multisite:
    "Multi-Site Management: Asset A and Asset B complement each other. Adjusting load balancing could improve overall efficiency by 15%.",
  scenario:
    "Scenario Analysis: A 20% increase in renewable generation in Viterbo is projected to boost revenue by approximately 12% over the next day.",
  report:
    "Intervention Report:\n1. Inspect battery modules for overheating.\n2. Verify state-of-charge sensors.\n3. Calibrate the maintenance schedule based on historical performance data.\nEstimated maintenance window: 48 hours.\nDo you want to send these instructions to the Field Team? (Type 'Yes' to confirm.)",
};

// Informazioni aggiornate sugli asset con investimento per il calcolo del ROI
const assetInfo: { [key: string]: { 
  name: string; 
  description: string; 
  location: string; 
  mapUrl: string; 
  investment: number; 
} } = {
  siteA: {
    name: "Asset A",
    description: "BESS 9 MW / 36 MWh",
    location: "Viterbo (VT), Italy",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2785.159174435637!2d12.04460231560748!3d42.4254803791825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132f61e7e11b7a13%3A0xdda7b6abda2f2738!2sViterbo%2C%20VT%2C%20Italy!5e0!3m2!1sen!2sus!4v1691741946232!5m2!1sen!2sus",
    investment: 65000000, // 65M per BESS
  },
  siteB: {
    name: "Asset B",
    description: "PV 150 MW",
    location: "Rome (RM), Italy",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2931.3015181209244!2d12.48293211533496!3d41.893320979219175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132f6055edc3f203%3A0x5a2d3c5d0e8b2a0e!2sRome%2C%20Italy!5e0!3m2!1sen!2sus!4v169174XXXXX!5m2!1sen!2sus", // Aggiorna l'URL se necessario
    investment: 200000000, // 200M per PV
  },
};

export default function DemoInterface(): JSX.Element {
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "ai" }[]>([]);
  const [bessData, setBessData] = useState<BessData | null>(null);
  const [roiData, setRoiData] = useState<{
    estimatedHourlyRevenue: number;
    estimatedDailyRevenue: number;
    estimatedAnnualROI: number;
  } | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>("siteA");
  
  // Aggiungiamo due state per gestire la visualizzazione dei dettagli dei grafici
  const [showMarketGraph, setShowMarketGraph] = useState<boolean>(false);
  const [showWeatherDetail, setShowWeatherDetail] = useState<boolean>(false);

  // Carica i dati BESS dalla mock API quando il sito selezionato cambia
  useEffect(() => {
    async function fetchBessData() {
      try {
        const res = await fetch("/api/bessKPI");
        const data = await res.json();
        setBessData(data);
      } catch (error) {
        console.error("Error fetching BESS data", error);
      }
    }
    fetchBessData();
  }, [selectedSite]);

  // Calcola il ROI usando l'investimento specifico per l'asset selezionato
  useEffect(() => {
    if (bessData) {
      const currentAsset = assetInfo[selectedSite];
      const roi = calculateROI(bessData, currentAsset.investment);
      setRoiData(roi);
    }
  }, [bessData, selectedSite]);

  const handleScenarioSelect = (key: string) => {
    setSelectedScenario(key);
    setInput(`Scenario: ${key}. Please provide insights.`);
    setMessages([]);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    if (selectedScenario === "report") {
      if (input.trim().toLowerCase() === "yes") {
        setMessages((prev) => [
          ...prev,
          { text: "Report successfully sent to the Field Team.", sender: "ai" },
        ]);
      } else {
        const response = simulatedResponses["report"];
        setMessages((prev) => [...prev, { text: response, sender: "ai" }]);
      }
    } else {
      const response = simulatedResponses[selectedScenario] || "Please select a scenario first.";
      setMessages((prev) => [...prev, { text: response, sender: "ai" }]);
    }
    setInput("");
  };

  const currentAsset = assetInfo[selectedSite];

  return (
    <div className="flex flex-col md:flex-row min-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Left Panel: Asset Information, Map, and Scenario Selection */}
      <aside className="w-full md:w-1/3 bg-blue-50 p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold mb-4">Asset Information</h2>
        <div>
          <p className="text-lg font-semibold">{currentAsset.name}</p>
          <p className="text-lg">{currentAsset.description}</p>
          <p className="text-lg">{currentAsset.location}</p>
        </div>
        <MultiSiteSelector onSelect={(siteId) => setSelectedSite(siteId)} />
        <div className="w-full h-48 rounded-lg overflow-hidden shadow">
          <iframe
            src={currentAsset.mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            title="Asset Location"
          ></iframe>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Explore Energy Operator</h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleScenarioSelect("market")}
              className={`px-4 py-2 border rounded-lg transition hover:bg-blue-500 hover:text-white ${
                selectedScenario === "market" ? "bg-blue-600 text-white" : "bg-white text-blue-600"
              }`}
            >
              Market Participation
            </button>
            <button
              onClick={() => handleScenarioSelect("maintenance")}
              className={`px-4 py-2 border rounded-lg transition hover:bg-blue-500 hover:text-white ${
                selectedScenario === "maintenance" ? "bg-blue-600 text-white" : "bg-white text-blue-600"
              }`}
            >
              Predictive Maintenance
            </button>
            <button
              onClick={() => handleScenarioSelect("multisite")}
              className={`px-4 py-2 border rounded-lg transition hover:bg-blue-500 hover:text-white ${
                selectedScenario === "multisite" ? "bg-blue-600 text-white" : "bg-white text-blue-600"
              }`}
            >
              Multi-Site Management
            </button>
            <button
              onClick={() => handleScenarioSelect("scenario")}
              className={`px-4 py-2 border rounded-lg transition hover:bg-blue-500 hover:text-white ${
                selectedScenario === "scenario" ? "bg-blue-600 text-white" : "bg-white text-blue-600"
              }`}
            >
              Scenario Analysis
            </button>
            <button
              onClick={() => handleScenarioSelect("report")}
              className={`px-4 py-2 border rounded-lg transition hover:bg-blue-500 hover:text-white ${
                selectedScenario === "report" ? "bg-blue-600 text-white" : "bg-white text-blue-600"
              }`}
            >
              Intervention Report
            </button>
          </div>
        </div>
      </aside>

      {/* Right Panel: KPI Dashboard, Graphs and Chat */}
      <section className="flex-1 p-6 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4">KPI Dashboard</h2>
          {roiData && bessData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setShowMarketGraph((prev) => !prev)}
                className="cursor-pointer bg-blue-50 p-4 rounded-lg text-center"
              >
                <p className="text-lg font-semibold">Price</p>
                <p className="text-xl">€{bessData.marketPriceEURPerMWh}/MWh</p>
                <p className="text-sm text-gray-600">Click for details</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-lg font-semibold">Battery Health</p>
                <p className="text-xl">{bessData.batteryHealthPercent}%</p>
              </div>
              <div
                onClick={() => setShowWeatherDetail((prev) => !prev)}
                className="cursor-pointer bg-blue-50 p-4 rounded-lg text-center"
              >
                <p className="text-lg font-semibold">Weather</p>
                <p className="text-xl">View details</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Loading KPI data...</p>
          )}

          {/* Mostra il grafico dell'energia se richiesto */}
          {showMarketGraph && (
            <div className="mt-6">
              <EnergyMarketDashboard />
            </div>
          )}
          {/* Mostra il dettaglio meteo se richiesto */}
          {showWeatherDetail && (
            <div className="mt-6">
              <WeatherOpen city={selectedSite === "siteA" ? "Viterbo,IT" : "Rome,IT"} />
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-gray-100 p-6 rounded-2xl shadow-xl overflow-y-auto space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.sender === "user"
                  ? "bg-blue-100 text-blue-800 text-right"
                  : "bg-gray-200 text-gray-800 text-left"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            className="flex-grow border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Type your command..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}










