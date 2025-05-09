// translations.ts
export const translations = {
    it: {
      header: {
        home: "Home",
        demo: "Demo",
        talkToUs: "Parla con noi",
        switchLanguage: "English",
      },
      home: {
        title: "Ottimizziamo il valore dei tuoi asset energetici in tempo reale",
        subtitle: "I nostri algoritmi basati su AI massimizzano i rendimenti degli asset rinnovabili.",
        exploreDemo: "Esplora la Demo",
        solution: "La Nostra Soluzione",
        solutionText: "Ottimizziamo la performance dei tuoi asset energetici usando AI all'avanguardia e insight basati sui dati."
      },
      dashboard: {
        title: "Dashboard Ottimizzazione ML",
        bess: "BESS",
        pv: "Fotovoltaico",
        resultsTitle: "Risultati Ottimizzazione",
        asset: "Asset",
        battery: "Batteria",
        solarPV: "Fotovoltaico",
        totalRevenue: "Ricavo Totale",
        optimizationScore: "Punteggio Ottimizzazione",
        algorithmTitle: "Algoritmo ML Utilizzato",
        algorithm: "Algoritmo",
        description: "Descrizione",
        trendTitle: "Andamento Storico",
        bessAlgorithm: "Deep Reinforcement Learning (DRL) con Q-Learning",
        bessDescription: "Ottimizza i cicli di carica/scarica per massimizzare il profitto considerando i prezzi di mercato e la degradazione della batteria.",
        pvAlgorithm: "Random Forest con Time Series Analysis",
        pvDescription: "Prevede la produzione solare e ottimizza il timing delle vendite di energia basandosi su dati meteorologici e storici."
      },
      demo: {
        pageTitle: "Energy Operator",
        assetInfo: "Informazioni Asset",
        exploreOperator: "Esplora Energy Operator",
        interventionReportConfirmation: "Report inviato con successo al Field Team.",
        interventionReportPrompt: `Intervention Report:
  1. Controlla i moduli della batteria per surriscaldamento.
  2. Verifica i sensori dello stato di carica.
  3. Regola il programma di manutenzione in base ai dati storici.
  Finestra stimata: 48 ore.
  Vuoi inviare queste istruzioni al Field Team? (Digita "Yes" per confermare.)`,
        subTitle: "AI Powered Energy Assets",
        selectedAsset: "Asset selezionato",
        registerNewAsset: "Registra Nuovo Asset",
        batteryType: "Batteria",
        pvType: "Fotovoltaico",
        productionHistory: "Storia Produzione",
        pvPlantMilan: "Impianto FV Nord Milano - Luglio 2023",
        marketForecast: "Previsioni di Mercato",
        next24Hours: "Prossime 24 ore",
        assistantGreeting: "Ciao! Sono il tuo assistente Volta AI. Come posso aiutarti con la gestione energetica oggi?",
        revenueStreams: {
          MGP: "Mercato del Giorno Prima",
          MSD: "Mercato dei Servizi di Dispacciamento",
          MB: "Mercato di Bilanciamento",
          UVAM: "Unità Virtuali Abilitate Miste",
          merchant: "Vendita diretta sul mercato",
          PPA: "Power Purchase Agreement",
          incentivi: "Incentivi governativi"
        }
      },
      bess: {
        title: "Sistema di Accumulo Energetico (BESS) - 60 MW Viterbo",
        configTitle: "Configurazione BESS",
        dataTitle: "Dati BESS Viterbo",
        dataDescription: "Visualizzazione dati per sistema di accumulo energetico (BESS) da 60 MW / 240 MWh situato a Viterbo. I dati mostrano l'andamento della potenza, dello stato di carica, e altri parametri operativi.",
        operatingModes: "Modalità Operative",
        detectedFaults: "Guasti Rilevati",
        percentTime: "% Tempo",
        count: "Conteggio",
        notes: "Note:",
        notesText: "Dati di un BESS da 60 MW / 240 MWh (4h) situato a Viterbo. Le modalità operative includono carica, scarica e inattività, basate su una strategia di arbitraggio energetico."
      }
    },
    en: {
      header: {
        home: "Home",
        demo: "Demo",
        talkToUs: "Talk to us",
        switchLanguage: "Italiano",
      },
      home: {
        title: "We Optimize the Value of Your Energy Assets in Real-Time",
        subtitle: "Our AI-based algorithms maximize the lifetime returns of your renewable assets.",
        exploreDemo: "Explore the Demo",
        solution: "Our Solution",
        solutionText: "We optimize the performance of your energy assets using state-of-the-art AI and data-driven insights."
      },
      dashboard: {
        title: "ML Optimization Dashboard",
        bess: "BESS",
        pv: "Photovoltaic",
        resultsTitle: "Optimization Results",
        asset: "Asset",
        battery: "Battery",
        solarPV: "Photovoltaic",
        totalRevenue: "Total Revenue",
        optimizationScore: "Optimization Score",
        algorithmTitle: "ML Algorithm Used",
        algorithm: "Algorithm",
        description: "Description",
        trendTitle: "Historical Trend",
        bessAlgorithm: "Deep Reinforcement Learning (DRL) with Q-Learning",
        bessDescription: "Optimizes charge/discharge cycles to maximize profit considering market prices and battery degradation.",
        pvAlgorithm: "Random Forest with Time Series Analysis",
        pvDescription: "Predicts solar production and optimizes energy sales timing based on weather and historical data."
      },
      demo: {
        pageTitle: "Energy Operator",
        assetInfo: "Asset Information",
        exploreOperator: "Explore Energy Operator",
        interventionReportConfirmation: "Report successfully sent to the Field Team.",
        interventionReportPrompt: `Intervention Report:
  1. Inspect battery modules for overheating.
  2. Verify state-of-charge sensors.
  3. Calibrate the maintenance schedule based on historical data.
  Estimated maintenance window: 48 hours.
  Do you want to send these instructions to the Field Team? (Type "Yes" to confirm.)`,
        subTitle: "AI Powered Energy Assets",
        selectedAsset: "Selected Asset",
        registerNewAsset: "Register New Asset",
        batteryType: "Battery",
        pvType: "Photovoltaic",
        productionHistory: "Production History",
        pvPlantMilan: "PV Plant North Milan - July 2023",
        marketForecast: "Market Forecast",
        next24Hours: "Next 24 Hours",
        assistantGreeting: "Hello! I'm your Volta AI assistant. How can I help you with energy management today?",
        revenueStreams: {
          MGP: "Day-Ahead Market",
          MSD: "Dispatching Services Market",
          MB: "Balancing Market",
          UVAM: "Mixed Enabled Virtual Units",
          merchant: "Direct market sale",
          PPA: "Power Purchase Agreement",
          incentivi: "Government incentives"
        }
      },
      bess: {
        title: "Battery Energy Storage System (BESS) - 60 MW Viterbo",
        configTitle: "BESS Configuration",
        dataTitle: "Viterbo BESS Data",
        dataDescription: "Data visualization for a 60 MW / 240 MWh energy storage system (BESS) located in Viterbo. The data shows the trend of power, state of charge, and other operational parameters.",
        operatingModes: "Operating Modes",
        detectedFaults: "Detected Faults",
        percentTime: "% Time",
        count: "Count",
        notes: "Notes:",
        notesText: "Data from a 60 MW / 240 MWh (4h) BESS located in Viterbo. Operating modes include charging, discharging, and idle, based on an energy arbitrage strategy."
      }
    },
  };
  