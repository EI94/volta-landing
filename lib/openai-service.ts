// Rimuoviamo l'importazione non utilizzata
// import OpenAI from 'openai';

// Rimuoviamo la configurazione client diretta
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY || '',
//   dangerouslyAllowBrowser: true // Solo per sviluppo, in produzione usa chiamate server-side
// });

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Servizio per interagire con l'API di OpenAI
 */
export const OpenAIService = {
  /**
   * Ottiene una risposta dal modello di chat di OpenAI
   */
  async getChatCompletion(options: ChatCompletionOptions): Promise<string> {
    try {
      const { messages, model = 'gpt-4', temperature = 0.7, maxTokens = 1000 } = options;

      // Determina l'URL base dell'API
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'http://localhost:3000';
      
      // Utilizza l'URL completo invece del percorso relativo
      const apiUrl = `${baseUrl}/api/ai/chat`;
      
      console.log('Chiamata API a:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model,
          temperature,
          maxTokens
        }),
      });
      
      // Se la risposta non è ok, prova a ottenere informazioni sull'errore
      if (!response.ok) {
        let errorMessage = `Errore API: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Se non è JSON, ottieni il testo della risposta
          const textContent = await response.text();
          console.error('Risposta non JSON ricevuta:', textContent.substring(0, 200));
          errorMessage = `Risposta non valida dal server: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Errore durante la chiamata a OpenAI:', error);
      throw new Error('Impossibile ottenere una risposta dall\'AI. Riprova più tardi.');
    }
  },

  /**
   * Genera un contesto di sistema per l'agente energetico
   */
  getEnergyAgentSystemPrompt(currentState: {
    batteryCharge: number;
    marketPrice: number;
    solarIrradiance: number;
    temperature: number;
    efficiency: number;
  }): string {
    return `Sei un assistente AI specializzato nel settore energetico chiamato VoltaAI.
    
    Informazioni attuali sul sistema energetico:
    - Livello batteria: ${currentState?.batteryCharge || 'N/A'}%
    - Prezzo di mercato: ${currentState?.marketPrice || 'N/A'} €/MWh
    - Irradiazione solare: ${currentState?.solarIrradiance || 'N/A'} W/m²
    - Temperatura: ${currentState?.temperature || 'N/A'}°C
    - Efficienza: ${currentState?.efficiency || 'N/A'}%
    
    Puoi aiutare l'utente a:
    1. Analizzare i dati energetici attuali
    2. Fornire consigli su quando caricare o scaricare la batteria
    3. Ottimizzare il consumo energetico
    4. Prevedere i prezzi dell'energia
    5. Rispondere a domande sul settore energetico
    
    Rispondi in modo conciso, professionale e utile. Se ti vengono chieste informazioni che non hai, indica chiaramente che non puoi fornire quei dati specifici.`;
  }
};

export default OpenAIService; 