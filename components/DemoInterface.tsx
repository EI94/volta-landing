// components/DemoInterface.tsx
"use client";

import { useState } from "react";

// Risposte simulate per ogni scenario
const simulatedResponses: { [key: string]: string } = {
  market:
    "Based on your asset capacity (9 MW / 36 MWh) and current market prices, selling energy now would yield approximately €70,000 per hour. Forecast data indicates a slight price increase over the next 3 hours.",
  maintenance:
    "Sensors indicate that battery health is at 98%. Historical data suggests scheduling maintenance after 50 cycles. No immediate issues detected.",
  multisite:
    "Comparing Site A and Site B, Site A is performing optimally while Site B shows a 10% underutilization. A load-balancing strategy could boost overall efficiency by approximately 15%.",
  scenario:
    "If renewable generation increases by 20% in Viterbo due to favorable weather, projected revenue could grow by an estimated 12% over the next day.",
};

export default function DemoInterface(): JSX.Element {
  // Stato per lo scenario selezionato, input corrente e messaggi nella chat
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "ai" }[]>([]);

  // Funzione per selezionare uno scenario: precompila il campo input e resetta la chat
  const handleScenarioSelect = (key: string) => {
    setSelectedScenario(key);
    setInput(`Scenario: ${key}. Please provide insights.`);
    setMessages([]);
  };

  // Funzione per simulare l'invio di un messaggio
  const sendMessage = () => {
    if (!input.trim()) return;
    // Aggiungi il messaggio dell'utente
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    // Recupera la risposta simulata per lo scenario selezionato (se presente)
    const response = simulatedResponses[selectedScenario] || "Please select a scenario first.";
    setMessages((prev) => [...prev, { text: response, sender: "ai" }]);
    setInput("");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Left Panel: Informazioni Asset e Selezione Scenario */}
      <aside className="w-full md:w-1/3 bg-blue-50 p-6 flex flex-col gap-6">
        {/* Informazioni Asset */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Asset Information</h2>
          <p className="text-lg"><strong>Asset:</strong> BESS 9 MW / 36 MWh</p>
          <p className="text-lg"><strong>Location:</strong> Viterbo (VT), Italy</p>
        </div>
        {/* Embed di Google Maps */}
        <div className="w-full h-48 rounded-lg overflow-hidden shadow">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2785.159174435637!2d12.04460231560748!3d42.4254803791825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132f61e7e11b7a13%3A0xdda7b6abda2f2738!2sViterbo%2C%20VT%2C%20Italy!5e0!3m2!1sen!2sus!4v1691741946232!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            title="Asset Location"
          ></iframe>
        </div>
        {/* Selezione Scenario */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Select Scenario</h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleScenarioSelect("market")}
              className={`px-4 py-2 border rounded-lg transition hover:bg-blue-500 hover:text-white ${
                selectedScenario === "market"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600"
              }`}
            >
              Market Participation
            </button>
            <button
              onClick={() => handleScenarioSelect("maintenance")}
              className={`px-4 py-2 border rounded-lg transition hover:bg-blue-500 hover:text-white ${
                selectedScenario === "maintenance"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600"
              }`}
            >
              Predictive Maintenance
            </button>
            <button
              onClick={() => handleScenarioSelect("multisite")}
              className={`px-4 py-2 border rounded-lg transition hover:bg-blue-500 hover:text-white ${
                selectedScenario === "multisite"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600"
              }`}
            >
              Multi-Site Management
            </button>
            <button
              onClick={() => handleScenarioSelect("scenario")}
              className={`px-4 py-2 border rounded-lg transition hover:bg-blue-500 hover:text-white ${
                selectedScenario === "scenario"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600"
              }`}
            >
              Scenario Analysis
            </button>
          </div>
        </div>
      </aside>

      {/* Right Panel: KPI Dashboard e Area Interattiva "Asset Operator" */}
      <section className="flex-1 p-6 flex flex-col gap-6">
        {/* KPI Dashboard */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4">KPI Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-lg font-semibold">Price</p>
              <p className="text-xl">€50/MWh</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-lg font-semibold">Battery Health</p>
              <p className="text-xl">98%</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-lg font-semibold">Charge Level</p>
              <p className="text-xl">65%</p>
            </div>
          </div>
        </div>
        {/* Area Chat/Interazione */}
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


