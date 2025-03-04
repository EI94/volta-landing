import { NextResponse } from 'next/server';

// Funzione per verificare la chiave API
const isApiKeyValid = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  return apiKey && 
         apiKey.trim() !== '' && 
         (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-'));
};

// Handler per verificare lo stato dell'API
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const keyStatus = isApiKeyValid();
  const maskKey = apiKey 
    ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` 
    : 'non disponibile';

  return NextResponse.json({
    apiKeyPresent: !!apiKey,
    apiKeyValid: keyStatus,
    apiKeyMasked: maskKey,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
} 