"use client";

import React, { useState, useEffect, useContext } from 'react';
import EnergyMarketDashboard from './EnergyMarketDashboard';
import WeatherOpen from './WeatherOpen';
import AIActionSuggestions, { AIAction } from './AIActionSuggestions';
import { Tab } from '@headlessui/react';
import { Gauge, Battery, Cpu, BarChart3, RefreshCw, MessageSquare, PlusCircle, Sun, TrendingUp, Currency, Layout, Activity, Zap } from 'lucide-react';
import Link from 'next/link';
import OpenAIService, { ChatMessage } from '../lib/openai-service';
import BessStateChart from './BessStateChart';
import { CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import PVDataChart from './PVDataChart';
import BESSDataChart from '@/components/BESSDataChart';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../translations';

// Tipi di asset
interface Asset {
  id: string;
  name: string; 
  type: 'bess' | 'pv';
  location: string; 
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
}

interface RevenueItem {
  name: string;
  vendita: number;
  servizi: number;
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
  // Context di lingua
  const langContext = useContext(LanguageContext);
  if (!langContext) {
    throw new Error("LanguageContext is not provided");
  }
  const { language } = langContext;
  const t = translations[language].demo;

  // Stati
  const [selectedCity] = useState<string>("Milano");
  const [batteryCharge, _setBatteryCharge] = useState(65);
  const [simulationData, _setSimulationData] = useState({
    power: 0,
    mode: 'idle',
    revenue: 0,
  });
  const [autoExecuteEnabled, setAutoExecuteEnabled] = useState(false);
  const [suggestedActions, _setSuggestedActions] = useState<AIAction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {role: 'assistant', content: t.assistantGreeting}
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
  
  // Dati finti per i grafici
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
  
  // Dati per PV revenue stream
  const pvRevenueData = [
    { name: 'Merchant', value: 3200 },
    { name: 'PPA', value: 4800 },
    { name: 'Incentivi', value: 1500 },
    { name: 'Servizi Rete', value: 750 },
  ];

  // Dati simulati per la visualizzazione
  const bessRevenueData: RevenueItem[] = [
    { name: 'Gen', vendita: 400, servizi: 240 },
    { name: 'Feb', vendita: 300, servizi: 138 },
    { name: 'Mar', vendita: 200, servizi: 980 },
    { name: 'Apr', vendita: 280, servizi: 390 },
    { name: 'Mag', vendita: 180, servizi: 480 }
  ];

  // Dati di stato per fotovoltaico ed acquisto / vendita di energia
  const battery = 65; // Valore fissato per il livello della batteria

  // Simulazione carica della batteria
  const BatterySimulator = ({assetType}: {assetType: string}) => {
    return (
      <div className={`${assetType === 'bess' ? 'block' : 'hidden'}`}>
        <h3 className="text-2xl mb-4">{t.state}</h3>
        <Battery className="h-8 w-8 mb-4" />
        <div className="text-lg font-bold mb-6">{t.batteryLevel.replace('{level}', battery.toString())}</div>
        
        <h3 className="text-xl mb-4">{t.chargeDischargeHistory}</h3>
        <div className="mt-6 mb-8">
          <BessStateChart data={batterHistoryData} assetType="bess" />
        </div>
        
        <div className="mt-8 mb-6">
          <BESSDataChart dataFile="bess_60MW_4h_viterbo_may2025.csv" />
        </div>
        
        <h3 className="text-xl mb-4">{t.marketPredictions}</h3>
        <div className="grid grid-cols-2 gap-2 pb-2 text-sm font-medium text-gray-500">
          <div>{t.hour}</div>
          <div>{t.price}</div>
        </div>
        {[...Array(24)].map((_, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 py-2 border-b">
            <div>{i}:00</div>
            <div>{Math.round(40 + Math.random() * 60)}</div>
          </div>
        ))}
        
        <h3 className="text-xl mt-6 mb-4">{t.revenueStream}</h3>
        <div className="h-64">
          <BarChart
            data={bessRevenueData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="vendita" fill="#8884d8" name={t.energySale} />
            <Bar dataKey="servizi" fill="#82ca9d" name={t.gridServices} />
          </BarChart>
        </div>
      </div>
    );
  };

  // Simulazione pannelli solari
  const PVSimulator = () => {
    if (!selectedAsset || selectedAsset.type !== 'pv') {
      return (
        <div className="p-3 sm:p-4 text-center">
          <p className="text-gray-500">Seleziona un asset di tipo fotovoltaico per visualizzare i dati.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8 mb-8">
        <div className="bg-white rounded-lg p-3 sm:p-4 space-y-4 sm:space-y-6">
          <h3 className="text-lg font-medium mb-2 sm:mb-4">Stato Impianto {selectedAsset.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">{t.currentProduction}</h4>
                <span className="text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{t.inverter}: {pvData.inverterStatus}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 sm:p-4 rounded-lg border border-yellow-100">
                  <div className="flex items-center">
                    <Sun className="h-6 w-6 text-yellow-500 mr-2" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">{t.power}</p>
                      <p className="text-lg sm:text-xl font-semibold text-gray-900">{pvData.currentProduction} kW</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                      <span>{t.totalToday}</span>
                      <span>{pvData.dailyProduction} kWh</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">{t.efficiency}</p>
                      <p className="text-lg sm:text-xl font-semibold text-gray-900">{pvData.efficiency}%</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                      <span>{t.temperature}</span>
                      <span>{pvData.temperature}°C</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 sm:mb-4 mt-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">{t.irradiance}</p>
                      <p className="text-lg sm:text-xl font-semibold text-gray-900">{pvData.irradiance} W/m²</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-3 sm:p-4 rounded-lg border border-green-100">
                  <p className="text-xs sm:text-sm text-gray-500 mr-1">{t.productionForecast}: </p>
                  <p className="text-sm sm:text-base font-semibold text-green-600">{t.optimal}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">{t.weatherForecast}</h4>
                <button className="text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t.refresh}
                </button>
              </div>
              <WeatherOpen city={selectedAsset.location} />
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
              {t.productionHistory}
            </h4>
            <span className="text-xs text-gray-500">{t.pvPlantMilan}</span>
          </div>
          <div className="h-auto">
            <PVDataChart dataFile="inverter_data_12MW_north_milan_july2023.csv" />
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
              {t.marketForecast}
            </h4>
            <span className="text-xs text-gray-500">{t.next24Hours}</span>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.hour}</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.price}</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.trend}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marketForecastData.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900">{item.hour}</td>
                    <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900">{item.price}</td>
                    <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.trend === 'up' 
                          ? 'bg-red-100 text-red-800' 
                          : item.trend === 'down' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '–'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Currency className="w-4 h-4 mr-1 text-green-600" />€
              {t.revenueStream}
            </h4>
            <span className="text-xs text-gray-500">{t.weeklyForecast}</span>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pvRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="vendita" fill="#82ca9d" name={t.energySale} />
                <Bar dataKey="incentivi" fill="#8884d8" name={t.incentives} />
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

  const handleExecuteAIAction = () => {
    console.log("Esecuzione azione AI");
  };

  const generateAISuggestions = () => {
    console.log("Generazione suggerimenti AI");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-2 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h2 className="text-xl font-bold text-center">{t.pageTitle}</h2>
        <p className="text-center text-white/80 text-sm">{t.subTitle}</p>
      </div>
      
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-4 mb-8 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h2 className="text-lg font-medium flex items-center">
              <Layout className="mr-2 h-5 w-5 text-blue-500" />
              {t.selectedAsset}
            </h2>
            <div className="text-sm text-gray-600">
              {selectedAsset ? 
                selectedAsset.type === 'bess' ? 
                  t.batteryViterbo : 
                  `${selectedAsset.name} (${selectedAsset.capacity} MW)` 
                : 'None'}
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link href="/asset-registration" className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600">
              <Plus className="mr-2 h-4 w-4" />
              {t.registerNewAsset}
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-4">
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium flex items-center">
                <Activity className="mr-2 h-5 w-5 text-indigo-500" />
                Menu
              </h3>
            </div>
            <div className="p-4">
              <nav className="-mx-3 space-y-3">
                <button 
                  onClick={() => setActiveTab('status')} 
                  className={`flex items-center px-3 py-2 w-full text-sm font-medium rounded-md ${
                    activeTab === 'status' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Activity className="mr-3 flex-shrink-0 h-5 w-5" />
                  <span>{t.status}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('market')} 
                  className={`flex items-center px-3 py-2 w-full text-sm font-medium rounded-md ${
                    activeTab === 'market' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="mr-3 flex-shrink-0 h-5 w-5" />
                  <span>{t.market}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('optimization')} 
                  className={`flex items-center px-3 py-2 w-full text-sm font-medium rounded-md ${
                    activeTab === 'optimization' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Zap className="mr-3 flex-shrink-0 h-5 w-5" />
                  <span>{t.optimization}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('assistant')} 
                  className={`flex items-center px-3 py-2 w-full text-sm font-medium rounded-md ${
                    activeTab === 'assistant' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="mr-3 flex-shrink-0 h-5 w-5" />
                  <span>{t.assistant}</span>
                </button>
              </nav>
            </div>
            
            {/* ... resto del codice del menu ... */}
          </div>
          
          <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">
                {activeTab === 'status' && t.status}
                {activeTab === 'market' && t.market}
                {activeTab === 'optimization' && t.optimization}
                {activeTab === 'assistant' && t.assistant}
              </h3>
            </div>
            
            <div className="p-4">
              {activeTab === 'status' && (
                <>
                  {selectedAsset?.type === 'bess' && (
                    <BatterySimulator assetType="bess" />
                  )}
                  {selectedAsset?.type === 'pv' && (
                    <PVSimulator />
                  )}
                </>
              )}
              
              {/* ... altri contenuti per altri tab ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}