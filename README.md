# Volta - Ottimizzazione Asset Energetici con ML

## Descrizione
Volta è una piattaforma web che utilizza algoritmi di Machine Learning per ottimizzare la gestione di asset energetici (BESS e fotovoltaico) in uno scenario merchant. Il sistema analizza i prezzi di mercato, le previsioni meteorologiche e i pattern di consumo per massimizzare il valore economico degli asset.

## Funzionalità
- Ottimizzazione automatica di BESS (Battery Energy Storage System)
- Ottimizzazione di impianti fotovoltaici
- Analisi dei prezzi di mercato
- Previsioni meteorologiche integrate
- Dashboard interattiva per il monitoraggio
- Metriche di performance in tempo reale

## Tecnologie Utilizzate
- Next.js 15
- TypeScript
- Tailwind CSS
- Recharts per la visualizzazione dei dati
- Redis per la cache
- API RESTful

## Requisiti
- Node.js 18+
- Redis (opzionale, viene utilizzato un mock in sviluppo)
- NPM o Yarn

## Installazione
1. Clona il repository:
```bash
git clone https://github.com/yourusername/volta-landing.git
cd volta-landing
```

2. Installa le dipendenze:
```bash
npm install
```

3. Crea un file `.env.local` con le variabili d'ambiente necessarie:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

4. Avvia il server di sviluppo:
```bash
npm run dev
```

## Deployment
Il progetto è configurato per essere deployato su Vercel. Per deployare:

1. Crea un account su Vercel
2. Connetti il tuo repository GitHub
3. Seleziona il repository volta-landing
4. Vercel configurerà automaticamente il deployment

## Licenza
MIT
