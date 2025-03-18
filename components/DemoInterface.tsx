"use client";

import React, { useState } from 'react';
import EnergyMarketDashboard from './EnergyMarketDashboard';
import WeatherOpen from './WeatherOpen';
import AIActionSuggestions, { AIAction } from './AIActionSuggestions';
import { Tab } from '@headlessui/react';
import { Gauge, Battery, Cpu, BarChart3, RefreshCw, MessageSquare, PlusCircle, Sun, TrendingUp, Currency } from 'lucide-react';
import Link from 'next/link';
import OpenAIService, { ChatMessage } from '../lib/openai-service';
import BessStateChart from './BessStateChart';
import { CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import PVDataChart from './PVDataChart';
import BESSDataChart from '@/components/BESSDataChart';

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
  const BatterySimulator = ({assetType}: {assetType: string}) => (
    <div className={`${assetType === 'bess' ? 'block' : 'hidden'}`}>
      <h3 className="text-2xl mb-4">Stato</h3>
      <Battery className="h-8 w-8 mb-4" />
      <div className="text-lg font-bold mb-6">Livello: {battery}%</div>
      
      <h3 className="text-xl mb-4">Storia Carica/Scarica</h3>
      <div className="mt-6 mb-8">
        <BessStateChart data={batterHistoryData} assetType="bess" />
      </div>
      
      <div className="mt-8 mb-6">
        <BESSDataChart dataFile="bess_60MW_4h_viterbo_may2025.csv" />
      </div>
      
      <h3 className="text-xl mb-4">Previsioni di Mercato</h3>
      <div className="grid grid-cols-2 gap-2 pb-2 text-sm font-medium text-gray-500">
        <div>Ora</div>
        <div>Prezzo (€/MWh)</div>
      </div>
      {[...Array(24)].map((_, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 py-2 border-b">
          <div>{i}:00</div>
          <div>{Math.round(40 + Math.random() * 60)}</div>
        </div>
      ))}
      
      <h3 className="text-xl mt-6 mb-4">Revenue Stream</h3>
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
          <Bar dataKey="vendita" fill="#8884d8" name="Vendita energia" />
          <Bar dataKey="servizi" fill="#82ca9d" name="Servizi di rete" />
        </BarChart>
      </div>
    </div>
  );

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
        </div>

        <div className="mt-6 sm:mt-8 bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
              Storia Produzione
            </h4>
            <span className="text-xs text-gray-500">Impianto FV Nord Milano - Luglio 2023</span>
          </div>
          <div className="h-auto">
            <PVDataChart dataFile="inverter_data_12MW_north_milan_july2023.csv" />
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
              Previsioni di Mercato
            </h4>
            <span className="text-xs text-gray-500">Prossime 24 ore</span>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm overflow-x-auto">
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
              Revenue Stream
            </h4>
            <span className="text-xs text-gray-500">Previsione settimanale</span>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pvRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="vendita" fill="#82ca9d" name="Vendita energia" />
                <Bar dataKey="incentivi" fill="#8884d8" name="Incentivi" />
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
    <div className="container mx-auto px-2 sm:px-4 py-4 max-w-7xl">
      <div className="flex flex-col mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Energy Operator</h1>
        <p className="text-gray-600 text-sm sm:text-base">AI Powered Energy Assets</p>
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
            {selectedAsset?.type === 'bess' ? <BatterySimulator assetType="bess" /> : <PVSimulator />}
          </Tab.Panel>
          
          {/* Pannello Mercato */}
          <Tab.Panel className="rounded-xl bg-white p-3 sm:p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Mercato dell&apos;Energia</h3>
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
                isAutoModeEnabled={autoExecuteEnabled}
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