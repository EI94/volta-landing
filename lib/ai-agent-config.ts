/**
 * Configurazione dell'agente AI
 */

// Definizione dei modelli AI disponibili
export const AI_MODELS = {
  GPT4: 'gpt-4',
  GPT35TURBO: 'gpt-3.5-turbo'
};

// Soglie di notifica
export const THRESHOLDS = {
  BATTERY: {
    MIN_CHARGE: 20,
    MAX_CHARGE: 90,
    MIN_EFFICIENCY: 75,
    MIN_HEALTH: 80,
    MAX_TEMPERATURE: 45
  },
  MARKET: {
    MIN_PRICE: 50,
    MAX_PRICE: 300,
    VOLATILITY_THRESHOLD: 0.3
  },
  SOLAR: {
    MIN_IRRADIANCE: 100,
    OPTIMAL_IRRADIANCE: 800
  },
  REVENUE: {
    PROFIT_MARGIN_MIN: 10,
    ROI_THRESHOLD: 5
  }
};

// Definizione delle priorità delle azioni
export const ACTION_PRIORITIES = {
  CRITICAL: {
    LABEL: 'critical',
    CONFIDENCE_THRESHOLD: 0.8
  },
  IMPORTANT: {
    LABEL: 'important',
    CONFIDENCE_THRESHOLD: 0.7
  },
  NORMAL: {
    LABEL: 'normal',
    CONFIDENCE_THRESHOLD: 0.6
  }
};

// Prompt di sistema per vari scenari
export const SYSTEM_PROMPTS = {
  GENERAL: 
    `Sei un assistente AI specializzato nella gestione di sistemi di accumulo di energia (BESS - Battery Energy Storage Systems) e impianti fotovoltaici.
    Il tuo compito è fornire suggerimenti per ottimizzare l'uso delle batterie e massimizzare i ricavi in base alle condizioni di mercato e meteo.`,
  
  BATTERY_MANAGEMENT:
    `Analizza lo stato attuale della batteria, i prezzi dell'energia e le previsioni meteo per suggerire il momento ottimale per caricare e scaricare.
    Considera le seguenti variabili:
    - Livello di carica attuale della batteria
    - Prezzo attuale dell'energia
    - Previsione dei prezzi dell'energia
    - Irraggiamento solare attuale e previsto
    - Temperatura della batteria
    - Stato di salute della batteria
    - Numero di cicli completati`,
  
  MARKET_ANALYSIS:
    `Analizza i dati del mercato dell'energia per identificare opportunità di arbitraggio.
    Considera:
    - Volatilità dei prezzi
    - Trend giornalieri
    - Eventi speciali che potrebbero influenzare i prezzi
    - Stagionalità e pattern ricorrenti`,
  
  MAINTENANCE:
    `Analizza lo stato della batteria o dell'impianto fotovoltaico per suggerire interventi di manutenzione preventiva.
    Identifica potenziali problemi come:
    - Degrado accelerato
    - Temperature anomale
    - Calo di efficienza
    - Soiling dei pannelli solari
    - Anomalie nelle prestazioni`
};

// Strategie di carica/scarica
export const STRATEGIES = {
  PROFIT_MAXIMIZE: 'Massimizzazione del profitto',
  GRID_SUPPORT: 'Supporto alla rete',
  PEAK_SHAVING: 'Peak shaving',
  SELF_CONSUMPTION: 'Autoconsumo'
};

// Definizione dei timeframe per le previsioni
export const FORECAST_TIMEFRAMES = {
  SHORT: {
    LABEL: 'breve termine',
    HOURS: 24
  },
  MEDIUM: {
    LABEL: 'medio termine',
    HOURS: 72
  },
  LONG: {
    LABEL: 'lungo termine',
    HOURS: 168
  }
};

export default {
  AI_MODELS,
  THRESHOLDS,
  ACTION_PRIORITIES,
  SYSTEM_PROMPTS,
  STRATEGIES,
  FORECAST_TIMEFRAMES,
}; 