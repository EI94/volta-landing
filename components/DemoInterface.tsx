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
        <div className="p-4 text-center">
          <p className="text-gray-500">Seleziona un asset di tipo batteria per visualizzare i dati.</p>
        </div>
      );
    }
    
    // Dati di simulazione per lo storico della batteria
    const batterHistoryData = [
      { timestamp: new Date(Date.now() - 8 * 3600000), chargePercent: 45, healthPercent: 98, temperature: 28, outputMW: 1.2 },
      { timestamp: new Date(Date.now() - 7 * 3600000), chargePercent: 52, healthPercent: 98, temperature: 29, outputMW: 1.4 },
      { timestamp: new Date(Date.now() - 6 * 3600000), chargePercent: 60, healthPercent: 97, temperature: 30, outputMW: 1.5 },
      { timestamp: new Date(Date.now() - 5 * 3600000), chargePercent: 68, healthPercent: 97, temperature: 32, outputMW: 1.3 },
      { timestamp: new Date(Date.now() - 4 * 3600000), chargePercent: 75, healthPercent: 97, temperature: 31, outputMW: 1.2 },
      { timestamp: new Date(Date.now() - 3 * 3600000), chargePercent: 82, healthPercent: 96, temperature: 30, outputMW: 1.0 },
      { timestamp: new Date(Date.now() - 2 * 3600000), chargePercent: 78, healthPercent: 96, temperature: 29, outputMW: 0.8 },
      { timestamp: new Date(Date.now() - 1 * 3600000), chargePercent: batteryCharge, healthPercent: 96, temperature: 28, outputMW: simulationData.power / 1000 },
    ];
    
    // Dati di simulazione per le previsioni di mercato
    const marketForecastData = [
      { hour: '08:00', price: 85, forecast: 'Salita' },
      { hour: '12:00', price: 92, forecast: 'Stabile' },
      { hour: '16:00', price: 97, forecast: 'Picco' },
      { hour: '20:00', price: 88, forecast: 'Discesa' },
      { hour: '00:00', price: 75, forecast: 'Bassa' },
    ];
    
    // Dati simulati per i revenue stream
    const revenueData = [
      { name: 'MGP', value: 12500 },
      { name: 'MSD', value: 8700 },
      { name: 'MB', value: 5400 },
      { name: 'UVAM', value: 3200 },
    ];
    
    return (
      <div className="p-4 space-y-6">
        <h3 className="text-lg font-medium mb-4">Stato Batteria {selectedAsset.name}</h3>        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Livello Batteria: {batteryCharge}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={batteryCharge}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setBatteryCharge(value);
                handleBatteryUpdate({
                  chargeLevel: value,
                  power: simulationData.power,
                  mode: value < 20 ? 'charging' : value > 80 ? 'discharging' : 'idle',
                  revenue: simulationData.revenue,
                  totalEnergy: simulationData.totalEnergy
                });
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potenza: {simulationData.power} kW
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={simulationData.power}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setSimulationData(prev => ({
                  ...prev,
                  power: value,
                }));
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => {
                setSimulationData(prev => ({
                  ...prev,
                  mode: 'charging',
                }));
              }}
              className={`px-4 py-2 rounded-lg text-center ${
                simulationData.mode === 'charging'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Carica
            </button>

            <button
              onClick={() => {
                setSimulationData(prev => ({
                  ...prev,
                  mode: 'discharging',
                }));
              }}
              className={`px-4 py-2 rounded-lg text-center ${
                simulationData.mode === 'discharging' 
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Scarica
            </button>
          </div>
        </div>
        
        {/* Sezione Grafico */}
        <div className="mt-8 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
              Storico di Carica e Scarica
            </h4>
            <span className="text-xs text-gray-500">Ultime 8 ore</span>
          </div>
          
          <BessStateChart data={batterHistoryData} assetType="bess" />
        </div>
        
        {/* Previsioni di Mercato */}
        <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-green-600" />
              Previsioni di Mercato
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ora</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prezzo (€/MWh)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marketForecastData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.hour}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.price}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
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
          
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
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

  // Componente PV Dashboard
  const PVDashboard = () => {
    if (!selectedAsset || selectedAsset.type !== 'pv') {
      return (
        <div className="p-4 text-center">
          <p className="text-gray-500">Seleziona un asset di tipo fotovoltaico per visualizzare i dati.</p>
        </div>
      );
    }
    
    // Dati di simulazione per lo storico della produzione fotovoltaica
    const pvHistoryData = [
      { timestamp: new Date(Date.now() - 8 * 3600000), outputMW: 0.2, performanceRatio: 30, temperature: 24 },
      { timestamp: new Date(Date.now() - 7 * 3600000), outputMW: 0.5, performanceRatio: 45, temperature: 26 },
      { timestamp: new Date(Date.now() - 6 * 3600000), outputMW: 0.8, performanceRatio: 65, temperature: 28 },
      { timestamp: new Date(Date.now() - 5 * 3600000), outputMW: 1.1, performanceRatio: 78, temperature: 29 },
      { timestamp: new Date(Date.now() - 4 * 3600000), outputMW: 1.3, performanceRatio: 85, temperature: 30 },
      { timestamp: new Date(Date.now() - 3 * 3600000), outputMW: 1.2, performanceRatio: 80, temperature: 31 },
      { timestamp: new Date(Date.now() - 2 * 3600000), outputMW: 0.9, performanceRatio: 70, temperature: 30 },
      { timestamp: new Date(Date.now() - 1 * 3600000), outputMW: pvData.currentProduction / 1000, performanceRatio: pvData.efficiency, temperature: pvData.temperature },
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
      <div className="p-4 space-y-6">
        <h3 className="text-lg font-medium mb-4">Stato Impianto {selectedAsset.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">Produzione Attuale</h4>
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">Attivo</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{pvData.currentProduction} kW</div>
            <div className="mt-2 text-sm text-gray-600">Produzione giornaliera: {pvData.dailyProduction} kWh</div>
            <div className="mt-4 flex items-center">
              <div className="text-sm font-medium text-gray-700 mr-2">Efficienza:</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${pvData.efficiency}%` }}
                ></div>
              </div>
              <div className="ml-2 text-sm text-green-600">{pvData.efficiency}%</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">Condizioni Pannelli</h4>
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Inverter: {pvData.inverterStatus}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Temperatura</div>
                <div className="text-xl font-bold text-gray-900">{pvData.temperature} °C</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Irradianza</div>
                <div className="text-xl font-bold text-gray-900">{pvData.irradiance} W/m²</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Previsione produzione</div>
              <div className="h-16 flex items-end">
                {pvData.forecast.map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-yellow-400 mx-0.5 rounded-t-sm"
                    style={{ height: `${(value / 32) * 100}%` }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Ora</span>
                <span>+8h</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sezione Grafico Storico */}
        <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
              Storico della Produzione
            </h4>
            <span className="text-xs text-gray-500">Ultime 8 ore</span>
          </div>
          
          <BessStateChart data={pvHistoryData} assetType="pv" />
        </div>
        
        {/* Previsioni Meteo */}
        <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Sun className="w-4 h-4 mr-1 text-yellow-500" />
              Previsioni Meteo
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ora</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Irradianza (W/m²)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condizioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weatherForecastData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.hour}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.irradiance}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.clouds === 'Soleggiato' ? 'bg-yellow-100 text-yellow-800' :
                        item.clouds === 'Poco nuvoloso' ? 'bg-blue-100 text-blue-800' :
                        item.clouds === 'Parzialmente nuvoloso' ? 'bg-gray-100 text-gray-800' :
                        item.clouds === 'Tramonto' ? 'bg-orange-100 text-orange-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.clouds}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

  // Componente per la selezione degli asset
  const AssetSelector = () => {
    return (
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1 max-w-xs">
          <label htmlFor="asset-select" className="block text-sm font-medium text-gray-700 mb-1">
            Seleziona Asset
          </label>
          <div className="relative">
            <select
              id="asset-select"
              value={selectedAsset?.id || ''}
              onChange={(e) => {
                const selected = assets.find(a => a.id === e.target.value);
                setSelectedAsset(selected || null);
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>Seleziona un asset</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.type === 'bess' ? 'Batteria' : 'Fotovoltaico'}) - {asset.capacity} {asset.type === 'bess' ? 'MWh' : 'MWp'}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <Link 
          href="/asset-registration" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Registra Nuovo Asset
        </Link>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-6">
      <AssetSelector />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prima colonna */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dashboard principale */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-blue-600" />
                Dashboard di Sistema
              </h2>
              <button 
                onClick={generateAISuggestions} 
                className="flex items-center px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Aggiorna
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-600">Stato Asset</h3>
                  {selectedAsset?.type === 'bess' ? (
                    <Battery className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div className="mt-2">
                  {selectedAsset ? (
                    <>
                      <div className="text-2xl font-bold text-gray-800">
                        {selectedAsset.type === 'bess' ? 
                          `${batteryCharge}%` : 
                          `${pvData.currentProduction} kW`
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedAsset.type === 'bess' ? (
                          <>Modalità: <span className="font-medium capitalize">{simulationData.mode}</span></>
                        ) : (
                          <>Efficienza: <span className="font-medium">{pvData.efficiency}%</span></>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600">Seleziona un asset</div>
                  )}
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  {selectedAsset?.type === 'bess' && (
                    <div
                      className={`h-2.5 rounded-full ${
                        batteryCharge > 70 ? 'bg-green-500' : 
                        batteryCharge > 30 ? 'bg-yellow-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${batteryCharge}%` }}
                    ></div>
                  )}
                  {selectedAsset?.type === 'pv' && (
                    <div
                      className="h-2.5 rounded-full bg-yellow-500"
                      style={{ width: `${pvData.efficiency}%` }}
                    ></div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-600">
                    {selectedAsset?.type === 'bess' ? 'Potenza' : 'Produzione'}
                  </h3>
                  <BarChart3 className="w-5 h-5 text-green-500" />
                </div>
                <div className="mt-2">
                  {selectedAsset ? (
                    <>
                      <div className="text-2xl font-bold text-gray-800">
                        {selectedAsset.type === 'bess' ? 
                          `${simulationData.power} kW` : 
                          `${pvData.dailyProduction} kWh`
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        Ricavi: <span className="font-medium">
                          {selectedAsset.type === 'bess' ? 
                            `${simulationData.revenue.toFixed(2)}` : 
                            `${(pvData.dailyProduction * 0.15).toFixed(2)}`
                          } €
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600">Seleziona un asset</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200">
              <Tab.Group>
                <Tab.List className="flex border-b border-gray-200">
                  <Tab
                    className={({ selected }: { selected: boolean }) =>
                      classNames(
                        'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                        'focus:outline-none',
                        selected
                          ? 'border-b-2 border-blue-500'
                          : 'hover:bg-gray-100'
                      )
                    }
                  >
                    Stato
                  </Tab>
                  <Tab
                    className={({ selected }: { selected: boolean }) =>
                      classNames(
                        'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                        'focus:outline-none',
                        selected
                          ? 'border-b-2 border-blue-500'
                          : 'hover:bg-gray-100'
                      )
                    }
                  >
                    Mercato Energia
                  </Tab>
                  <Tab
                    className={({ selected }: { selected: boolean }) =>
                      classNames(
                        'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                        'focus:outline-none',
                        selected
                          ? 'border-b-2 border-blue-500'
                          : 'hover:bg-gray-100'
                      )
                    }
                  >
                    Meteo
                  </Tab>
                </Tab.List>
                <Tab.Panels className="mt-2">
                  <Tab.Panel className="p-3">
                    {selectedAsset?.type === 'bess' ? <BatterySimulator /> : <PVDashboard />}
                  </Tab.Panel>
                  <Tab.Panel className="p-3">
              <EnergyMarketDashboard />
                  </Tab.Panel>
                  <Tab.Panel className="p-3">
                    <WeatherOpen city={selectedCity} />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
          
          {/* Azioni AI suggerite */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Cpu className="w-5 h-5 mr-2 text-blue-600" />
                Azioni Consigliate
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Agent</span>
                <button
                  onClick={() => setAutoExecuteEnabled(!autoExecuteEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoExecuteEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                      autoExecuteEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <AIActionSuggestions 
              actions={suggestedActions} 
              onExecute={handleExecuteAIAction} 
              isAutoModeEnabled={autoExecuteEnabled}
            />
          </div>
        </div>

        {/* Seconda colonna - Assistente AI */}
        <div className="lg:col-span-1">
          <div className="h-full">
            <Card title="Assistente Volta AI" className="h-full">
              <div className="h-full flex flex-col">
                <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
                  {chatMessages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`mb-3 ${msg.role === 'assistant' ? 'text-left' : 'text-right'}`}
                    >
                      <div 
                        className={`inline-block max-w-[85%] rounded-lg px-4 py-2 ${
                          msg.role === 'assistant' 
                            ? 'bg-white border border-gray-200 text-gray-800' 
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {msg.content}
                      </div>
            </div>
          ))}
                  {isLoadingChat && (
                    <div className="text-left mb-3">
                      <div className="inline-block bg-white border border-gray-200 text-gray-500 rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
        </div>
                <div className="flex items-center">
          <input
            type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isLoadingChat}
          />
          <button
                    onClick={handleSendMessage}
                    className={`ml-2 p-2 rounded-md ${
                      isLoadingChat 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white transition-colors`}
                    disabled={isLoadingChat}
                  >
                    <MessageSquare className="w-4 h-4" />
          </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}