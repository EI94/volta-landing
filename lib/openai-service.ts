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

      // Utilizza sempre l'URL relativo per l'API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model,
          temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella chiamata API');
      }

      const data = await response.json();
      return data.choices[0].message.content;
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