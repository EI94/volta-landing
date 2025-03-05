"use client";

import React, { useState, useEffect } from 'react';
import EnergyMarketDashboard from './EnergyMarketDashboard';
import WeatherOpen from './WeatherOpen';
import AIActionSuggestions, { AIAction } from './AIActionSuggestions';
import { Tab } from '@headlessui/react';
import { Gauge, Battery, Cpu, BarChart3, RefreshCw, MessageSquare, PlusCircle, Sun, TrendingUp, DollarSign } from 'lucide-react';
import Card from './Card';
import Link from 'next/link';
import OpenAIService, { ChatMessage } from '../lib/openai-service';
import BessStateChart from './BessStateChart';
import { CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

// Tipi di asset
interface Asset {
  id: string;
  name: string; 
  type: 'bess' | 'pv';
  location: string; 
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
}

// Mock iniziale degli asset
const initialAssets: Asset[] = [
  {
    id: '1',
    name: 'Batteria Viterbo',
    type: 'bess',
    location: 'Viterbo',
    capacity: 340,
    status: 'active'
  },
  {
    id: '2',
    name: 'Impianto PV Nord',
    type: 'pv',
    location: 'Milano',
    capacity: 134,
    status: 'active'
  }
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DemoInterface() {
  // Stati
  const [selectedCity] = useState<string>("Milano");
  const [batteryCharge, setBatteryCharge] = useState(65);
  const [simulationData, setSimulationData] = useState({
    power: 0,
    mode: 'idle',
    revenue: 0,
    totalEnergy: 0,
  });
  const [autoExecuteEnabled, setAutoExecuteEnabled] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<AIAction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {role: 'assistant', content: 'Ciao! Sono il tuo assistente Volta AI. Come posso aiutarti con la gestione energetica oggi?'}
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  // Gestione degli asset
  const [assets] = useState<Asset[]>(initialAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(assets[0]);
  
  // Dati PV
  const [pvData] = useState({
    currentProduction: 23.5,
    dailyProduction: 156.3,
    efficiency: 87.2,
    forecast: [25, 28, 30, 32, 28, 25, 20, 10, 0],
    temperature: 42.3,
    irradiance: 856.7,
    inverterStatus: 'online',
  });
  
  // Aggiornamento stato batteria
  const handleBatteryUpdate = (data: {
    chargeLevel: number;
    power: number;
    mode: string;
    revenue: number;
    totalEnergy: number;
  }) => {
    setBatteryCharge(data.chargeLevel);
    setSimulationData(data);
  };

  // Generazione di azioni AI suggerite
  const generateAISuggestions = () => {
    // Esempio di azioni suggerite
    const newActions: AIAction[] = [];
    
    // La logica di generazione può essere più sofisticata basandosi sui dati reali
    if (batteryCharge < 30) {
      newActions.push({
        type: 'CHARGE',
        power: 50,
        expectedRevenue: 120.5,
        confidence: 0.92,
        explanation: "La batteria è sotto il 30% e il prezzo dell'energia è basso. Consiglio di caricare ora.",
        priority: 'high',
        timeframe: '2h',
      });
    } else if (batteryCharge > 80 && Math.random() > 0.5) {
      newActions.push({
        type: 'DISCHARGE',
        power: 70,
        expectedRevenue: 180.25,
        confidence: 0.86,
        explanation: "Il prezzo dell'energia è alto nelle prossime ore. Consiglio di scaricare per massimizzare i profitti.",
        priority: 'medium',
        timeframe: '4h',
      });
    }
    
    // Aggiungi un'azione di manutenzione se la batteria è stata in uso per molto tempo
    if (Math.random() > 0.7) {
      newActions.push({
        type: 'MAINTENANCE',
        power: 0,
        expectedRevenue: -50,
        confidence: 0.78,
        explanation: "La batteria ha completato più di 100 cicli. Consiglio una manutenzione programmata per prevenire degradazioni.",
        priority: 'low',
        timeframe: '24h',
      });
    }
    
    setSuggestedActions(newActions);
  };

  // Richiama la generazione delle azioni AI quando cambia lo stato della simulazione
  useEffect(() => {
    generateAISuggestions();
  }, [simulationData]);

  // Gestisce l'esecuzione delle azioni AI
  const handleExecuteAIAction = (action: AIAction) => {
    // Implementa la logica per eseguire l'azione
    console.log(`Executing action: ${action.type}`);
    
    // Aggiorna lo stato in base all'azione
    if (action.type === 'CHARGE') {
      setSimulationData(prev => ({
        ...prev,
        mode: 'charging',
        power: action.power || 50
      }));
    } else if (action.type === 'DISCHARGE') {
      setSimulationData(prev => ({
        ...prev,
        mode: 'discharging',
        power: action.power || 50
      }));
    }
    
    // Rimuovi l'azione dalla lista
    setSuggestedActions(prev => prev.filter(a => a !== action));
  };

  // Esegui automaticamente azioni con priorità alta se in modalità auto
  useEffect(() => {
    if (autoExecuteEnabled && suggestedActions.length > 0) {
      const criticalActions = suggestedActions.filter(action => action.priority === 'high');
      if (criticalActions.length > 0) {
        handleExecuteAIAction(criticalActions[0]);
      }
    }
  }, [suggestedActions, autoExecuteEnabled]);

  // Componente Battery Simulator
  const BatterySimulator = () => {
    if (!selectedAsset || selectedAsset.type !== 'bess') {
      return (
        <div className="p-3 sm:p-4 text-center">
          <p className="text-gray-500">Seleziona un asset di tipo batteria per visualizzare i dati.</p>
        </div>
      );
    }
    
    // Dati di simulazione per lo storico della batteria
    const batterHistoryData = [
      { timestamp: new Date(Date.now() - 8 * 3600000), chargePercent: 45, healthPercent: 98, temperature: 28, outputMW: 1.2, performanceRatio: 96 },
      { timestamp: new Date(Date.now() - 7 * 3600000), chargePercent: 52, healthPercent: 98, temperature: 29, outputMW: 1.4, performanceRatio: 97 },
      { timestamp: new Date(Date.now() - 6 * 3600000), chargePercent: 60, healthPercent: 97, temperature: 30, outputMW: 1.5, performanceRatio: 97 },
      { timestamp: new Date(Date.now() - 5 * 3600000), chargePercent: 68, healthPercent: 97, temperature: 32, outputMW: 1.3, performanceRatio: 98 },
      { timestamp: new Date(Date.now() - 4 * 3600000), chargePercent: 75, healthPercent: 97, temperature: 31, outputMW: 1.2, performanceRatio: 97 },
      { timestamp: new Date(Date.now() - 3 * 3600000), chargePercent: 82, healthPercent: 96, temperature: 30, outputMW: 1.0, performanceRatio: 96 },
      { timestamp: new Date(Date.now() - 2 * 3600000), chargePercent: 78, healthPercent: 96, temperature: 29, outputMW: 0.8, performanceRatio: 95 },
      { timestamp: new Date(Date.now() - 1 * 3600000), chargePercent: batteryCharge, healthPercent: 96, temperature: 28, outputMW: simulationData.power / 1000, performanceRatio: 96 },
    ];
    
    // Dati di simulazione per le previsioni di mercato
    const marketForecastData = [
      { hour: '14:00', price: '89.50', trend: 'up', forecast: 'Picco' },
      { hour: '15:00', price: '95.20', trend: 'up', forecast: 'Picco' },
      { hour: '16:00', price: '92.70', trend: 'down', forecast: 'Calo' },
      { hour: '17:00', price: '87.30', trend: 'down', forecast: 'Calo' },
      { hour: '18:00', price: '91.40', trend: 'up', forecast: 'Picco' },
      { hour: '19:00', price: '104.20', trend: 'up', forecast: 'Picco' },
      { hour: '20:00', price: '110.50', trend: 'up', forecast: 'Picco' },
      { hour: '21:00', price: '98.30', trend: 'down', forecast: 'Calo' },
    ];
    
    // Dati simulati per i revenue stream
    const revenueData = [
      { name: 'MGP', value: 2450 },
      { name: 'MSD', value: 1830 },
      { name: 'MB', value: 950 },
      { name: 'UVAM', value: 1200 },
    ];
    
    return (
      <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium mb-2 sm:mb-4">Stato Batteria {selectedAsset.name}</h3>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Livello di Carica: {batteryCharge}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={batteryCharge}
              onChange={(e) => setBatteryCharge(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potenza: {simulationData.power} kW
            </label>
            <input
              type="range"
              min="-1000"
              max="1000"
              step="50"
              value={simulationData.power}
              onChange={(e) => setSimulationData(prev => ({ ...prev, power: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-1000 kW (Scarica)</span>
              <span>0 kW</span>
              <span>1000 kW (Carica)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <button
              onClick={() => setSimulationData(prev => ({ ...prev, mode: 'charging', power: 500 }))}
              className={`py-2 px-4 rounded-lg flex items-center justify-center ${
                simulationData.mode === 'charging'
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-green-600 text-green-600 hover:bg-green-50'
              }`}
            >
              <Battery className="w-4 h-4 mr-2" /> Carica
            </button>
            <button
              onClick={() => setSimulationData(prev => ({ ...prev, mode: 'discharging', power: -500 }))}
              className={`py-2 px-4 rounded-lg flex items-center justify-center ${
                simulationData.mode === 'discharging'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Battery className="w-4 h-4 mr-2" /> Scarica
            </button>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
              Storia Carica/Scarica
            </h4>
            <span className="text-xs text-gray-500">Ultime 8 ore</span>
          </div>
          <div className="h-48 sm:h-64">
            <BessStateChart data={batterHistoryData} assetType="bess" />
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-green-600" />
              Previsioni di Mercato
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ora</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prezzo (€/MWh)</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marketForecastData.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900">{item.hour}</td>
                    <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900">{item.price}</td>
                    <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.forecast === 'Picco' ? 'bg-green-100 text-green-800' :
                        item.forecast === 'Salita' ? 'bg-blue-100 text-blue-800' :
                        item.forecast === 'Discesa' ? 'bg-yellow-100 text-yellow-800' :
                        item.forecast === 'Bassa' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.forecast}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => [`€${value}`, 'Ricavi']} />
                <Legend />
                <Bar dataKey="value" name="Ricavi" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Componente PV Simulator
  const PVSimulator = () => {
    if (!selectedAsset || selectedAsset.type !== 'pv') {
      return (
        <div className="p-3 sm:p-4 text-center">
          <p className="text-gray-500">Seleziona un asset di tipo fotovoltaico per visualizzare i dati.</p>
        </div>
      );
    }

    // Dati di simulazione per lo storico della produzione fotovoltaica
    const pvHistoryData = [
      { timestamp: new Date(Date.now() - 8 * 3600000), chargePercent: 0, healthPercent: 98, temperature: 28, outputMW: 0.8, performanceRatio: 82 },
      { timestamp: new Date(Date.now() - 7 * 3600000), chargePercent: 0, healthPercent: 98, temperature: 29, outputMW: 1.0, performanceRatio: 85 },
      { timestamp: new Date(Date.now() - 6 * 3600000), chargePercent: 0, healthPercent: 97, temperature: 30, outputMW: 1.2, performanceRatio: 88 },
      { timestamp: new Date(Date.now() - 5 * 3600000), chargePercent: 0, healthPercent: 97, temperature: 32, outputMW: 1.4, performanceRatio: 92 },
      { timestamp: new Date(Date.now() - 4 * 3600000), chargePercent: 0, healthPercent: 97, temperature: 31, outputMW: 1.3, performanceRatio: 90 },
      { timestamp: new Date(Date.now() - 3 * 3600000), chargePercent: 0, healthPercent: 96, temperature: 30, outputMW: 0.9, performanceRatio: 84 },
      { timestamp: new Date(Date.now() - 2 * 3600000), chargePercent: 0, healthPercent: 96, temperature: 29, outputMW: 0.7, performanceRatio: 80 },
      { timestamp: new Date(Date.now() - 1 * 3600000), chargePercent: 0, healthPercent: 96, temperature: 28, outputMW: 0.6, performanceRatio: 78 },
    ];
    
    // Dati di simulazione per le previsioni meteo
    const weatherForecastData = [
      { hour: '14:00', irradiance: 780, clouds: 'Soleggiato' },
      { hour: '16:00', irradiance: 650, clouds: 'Poco nuvoloso' },
      { hour: '18:00', irradiance: 400, clouds: 'Parzialmente nuvoloso' },
      { hour: '20:00', irradiance: 150, clouds: 'Tramonto' },
      { hour: '08:00', irradiance: 300, clouds: 'Alba' },
    ];
    
    return (
      <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium mb-2 sm:mb-4">Stato Impianto {selectedAsset.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">Produzione Attuale</h4>
              <span className="text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Inverter: {pvData.inverterStatus}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 sm:p-4 rounded-lg border border-yellow-100">
                <div className="flex items-center">
                  <Sun className="h-6 w-6 text-yellow-500 mr-2" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Potenza</p>
                    <p className="text-lg sm:text-xl font-semibold text-gray-900">{pvData.currentProduction} kW</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                    <span>Totale Oggi</span>
                    <span>{pvData.dailyProduction} kWh</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Efficienza</p>
                    <p className="text-lg sm:text-xl font-semibold text-gray-900">{pvData.efficiency}%</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                    <span>Temperatura</span>
                    <span>{pvData.temperature}°C</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 sm:mb-4 mt-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Irradianza</p>
                    <p className="text-lg sm:text-xl font-semibold text-gray-900">{pvData.irradiance} W/m²</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-3 sm:p-4 rounded-lg border border-green-100">
                <p className="text-xs sm:text-sm text-gray-500 mr-1">Previsione di produzione: </p>
                <p className="text-sm sm:text-base font-semibold text-green-600">Ottimale</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">Previsioni Meteo</h4>
              <button className="text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center">
                <RefreshCw className="h-3 w-3 mr-1" />
                Aggiorna
              </button>
            </div>
            <WeatherOpen city={selectedAsset.location} />
          </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
              Storia Produzione
            </h4>
            <span className="text-xs text-gray-500">Ultime 8 ore</span>
          </div>
          <div className="h-48 sm:h-64">
            <BessStateChart data={pvHistoryData} assetType="pv" />
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-green-600" />
              Revenue Stream
            </h4>
          </div>
          <div className="mt-4 h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => [`€${value}`, 'Ricavi']} />
                <Legend />
                <Bar dataKey="value" name="Ricavi" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Componente Chat integrato con OpenAI
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoadingChat) return;

    const userMessage: ChatMessage = { role: 'user', content: inputMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoadingChat(true);

    try {
      // Dati sui revenue stream per la chat
      const revenueStreams = {
        bess: {
          MGP: { value: 12500, description: 'Mercato del Giorno Prima' },
          MSD: { value: 8700, description: 'Mercato dei Servizi di Dispacciamento' },
          MB: { value: 5400, description: 'Mercato di Bilanciamento' },
          UVAM: { value: 3200, description: 'Unità Virtuali Abilitate Miste' }
        },
        pv: {
          merchant: { value: 15700, description: 'Vendita diretta sul mercato' },
          PPA: { value: 9500, description: 'Power Purchase Agreement' },
          incentivi: { value: 4200, description: 'Incentivi governativi' }
        }
      };
      
      // Preparazione dei messaggi per la chiamata all'API
      const messagesToSend: ChatMessage[] = [
        {
          role: 'system',
          content: `${OpenAIService.getEnergyAgentSystemPrompt({
            batteryCharge,
            marketPrice: 85, // esempio di prezzo di mercato
            solarIrradiance: pvData.irradiance,
            temperature: pvData.temperature,
            efficiency: pvData.efficiency
          })}
          
          Informazioni aggiuntive sui revenue stream disponibili:
          ${selectedAsset?.type === 'bess' 
            ? Object.entries(revenueStreams.bess).map(([key, data]) => `- ${key} (${data.description}): ${data.value} €`).join('\n')
            : Object.entries(revenueStreams.pv).map(([key, data]) => `- ${key} (${data.description}): ${data.value} €`).join('\n')
          }
          
          Se l'utente chiede di analizzare i revenue stream o richiede informazioni sui ricavi, fornisci un'analisi dettagliata basata su questi dati.`
        },
        ...chatMessages,
        userMessage
      ];

      // Chiamata all'API OpenAI tramite il servizio
      const response = await OpenAIService.getChatCompletion({
        messages: messagesToSend,
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      });

      // Aggiunta della risposta ai messaggi
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Errore durante la chiamata a OpenAI:', error);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Mi dispiace, ho avuto un problema di connessione. Puoi riprovare tra qualche istante?'
        }
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 max-w-7xl">
      <div className="flex flex-col mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Volta Energy Platform - Demo</h1>
        <p className="text-gray-600 text-sm sm:text-base">Visualizzazione ed ottimizzazione in tempo reale degli asset energetici</p>
      </div>
      
      {/* Selettore degli asset */}
      <div className="mb-6 bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-3 sm:mb-0">
            <h2 className="text-base sm:text-lg font-medium">Asset selezionato</h2>
            <select 
              className="mt-1 block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedAsset?.id || ''}
              onChange={(e) => {
                const assetId = e.target.value;
                const newAsset = assets.find(a => a.id === assetId) || null;
                setSelectedAsset(newAsset);
              }}
            >
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.type === 'bess' ? 'Batteria' : 'Fotovoltaico'})
                </option>
              ))}
            </select>
          </div>
          <Link href="/asset-registration" className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <PlusCircle className="w-4 h-4 mr-1" />
            Registra Nuovo Asset
          </Link>
        </div>
      </div>

      {/* Schede principali */}
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 overflow-x-auto">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full sm:w-auto flex-shrink-0 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-medium leading-5',
                'flex items-center justify-center focus:outline-none',
                selected
                  ? 'bg-white shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            <Gauge className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Stato
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full sm:w-auto flex-shrink-0 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-medium leading-5',
                'flex items-center justify-center focus:outline-none',
                selected
                  ? 'bg-white shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Mercato
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full sm:w-auto flex-shrink-0 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-medium leading-5',
                'flex items-center justify-center focus:outline-none',
                selected
                  ? 'bg-white shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Ottimizzazione
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full sm:w-auto flex-shrink-0 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-medium leading-5',
                'flex items-center justify-center focus:outline-none',
                selected
                  ? 'bg-white shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Assistente
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          {/* Pannello Stato */}
          <Tab.Panel className="rounded-xl bg-white p-3 sm:p-4 shadow-sm">
            {selectedAsset?.type === 'bess' ? <BatterySimulator /> : <PVSimulator />}
          </Tab.Panel>
          
          {/* Pannello Mercato */}
          <Tab.Panel className="rounded-xl bg-white p-3 sm:p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Mercato dell'Energia</h3>
            <EnergyMarketDashboard city={selectedCity} />
          </Tab.Panel>
          
          {/* Pannello Ottimizzazione */}
          <Tab.Panel className="rounded-xl bg-white p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-lg font-medium">Suggerimenti AI</h3>
                <div className="mt-2 sm:mt-0 flex items-center">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      name="auto-execute" 
                      id="auto-execute" 
                      checked={autoExecuteEnabled}
                      onChange={() => setAutoExecuteEnabled(!autoExecuteEnabled)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      htmlFor="auto-execute" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${autoExecuteEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                    ></label>
                  </div>
                  <label htmlFor="auto-execute" className="text-xs sm:text-sm text-gray-700">Esecuzione Automatica</label>
                  <button 
                    onClick={generateAISuggestions}
                    className="ml-2 sm:ml-4 inline-flex items-center p-1 sm:p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <AIActionSuggestions 
                actions={suggestedActions} 
                onExecute={handleExecuteAIAction} 
                autoExecuteEnabled={autoExecuteEnabled}
              />
            </div>
          </Tab.Panel>
          
          {/* Pannello Assistente */}
          <Tab.Panel className="rounded-xl bg-white p-3 sm:p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Assistente Volta AI</h3>
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 overflow-auto mb-4 rounded-lg border border-gray-200 p-3 sm:p-4">
                {chatMessages.map((message, idx) => (
                  <div 
                    key={idx} 
                    className={`flex mb-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] sm:max-w-[70%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
                {isLoadingChat && (
                  <div className="flex justify-start mb-3">
                    <div className="max-w-[80%] sm:max-w-[70%] p-3 rounded-lg bg-gray-100 text-gray-800 rounded-tl-none">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Scrivi un messaggio..."
                  className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoadingChat || !inputMessage.trim()}
                  className="bg-blue-600 text-white p-2 sm:p-3 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                >
                  Invia
                </button>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}