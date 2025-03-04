import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Funzione di utilità per il log
const logRequest = (message: string, data?: unknown) => {
  console.log(`[OpenAI API] ${message}`, data ? JSON.stringify(data).substring(0, 200) : '');
};

// Configurazione del client OpenAI - sicura perché eseguita lato server
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Funzione per verificare se è una chiave di test
const isTestKey = (key: string | undefined) => {
  return key && (key === 'sk-demo1234567890' || key.includes('demo'));
};

// Funzione per verificare la chiave API
const isApiKeyValid = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('[OpenAI API] Chiave API presente:', !!apiKey);
  console.log('[OpenAI API] Formato chiave:', apiKey ? apiKey.substring(0, 10) + '...' : 'non disponibile');
  
  return apiKey && 
         apiKey.trim() !== '' && 
         (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-'));
};

// Configurazione delle intestazioni CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handler per le richieste OPTIONS (preflight CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  // Aggiungi intestazioni CORS alla risposta
  const responseInit = {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  };

  try {
    // Verifica la chiave API
    if (!isApiKeyValid()) {
      logRequest('Errore: Chiave API OpenAI non configurata o non valida');
      return NextResponse.json(
        { error: 'Chiave API OpenAI non configurata o non valida. Controlla le variabili d\'ambiente.' },
        { status: 500, ...responseInit }
      );
    }

    // Parsing del corpo della richiesta
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      logRequest('Errore nel parsing del JSON della richiesta', error);
      return NextResponse.json(
        { error: 'Formato della richiesta non valido. È richiesto JSON valido.' },
        { status: 400, ...responseInit }
      );
    }

    const { messages, model = 'gpt-4', temperature = 0.7, maxTokens = 1000 } = requestBody;

    // Validazione dei parametri
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      logRequest('Errore: Array di messaggi mancante o non valido');
      return NextResponse.json(
        { error: 'È richiesto un array di messaggi non vuoto' },
        { status: 400, ...responseInit }
      );
    }

    logRequest(`Chiamata a OpenAI con modello ${model}`, { 
      numMessages: messages.length, 
      firstMessageRole: messages[0]?.role,
      temperature, 
      maxTokens 
    });
    
    // Se è una chiave di test, restituisci una risposta simulata
    if (isTestKey(process.env.OPENAI_API_KEY)) {
      logRequest('Utilizzo della modalità di test con risposta simulata');
      return NextResponse.json({ 
        message: "Questa è una risposta di test dell'AI. La tua chiave API è in modalità demo. Contatta l'amministratore per attivare una chiave API reale di OpenAI." 
      }, responseInit);
    }

    // Effettua la chiamata a OpenAI
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const message = response.choices[0]?.message?.content || '';
    logRequest('Risposta ricevuta da OpenAI', { messageLength: message.length });

    return NextResponse.json({ message }, responseInit);
  } catch (error: unknown) {
    // Gestione specifica degli errori di OpenAI
    logRequest('Errore durante la chiamata a OpenAI', error);
    
    // Definiamo un'interfaccia per gli errori di OpenAI
    interface OpenAIErrorWithStatus extends Error {
      status?: number;
    }
    
    const statusCode = error instanceof Error && 'status' in error 
      ? ((error as OpenAIErrorWithStatus).status || 500) 
      : 500;
    const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore imprevisto';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode, ...responseInit }
    );
  }
} 