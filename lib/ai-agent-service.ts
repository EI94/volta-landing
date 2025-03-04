import { AIAction } from '../components/AIActionSuggestions';
import OpenAIService from './openai-service';
import { SYSTEM_PROMPTS, THRESHOLDS } from './ai-agent-config';

interface SystemState {
  batteryCharge: number;
  marketPrice: number;
  solarIrradiance: number;
  temperature: number;
  efficiency: number;
  hasAlert?: boolean;
}

/**
 * Servizio per l'agente AI che genera suggerimenti basati sui dati del sistema
 */
const AIAgentService = {
  /**
   * Genera suggerimenti di azioni basati sullo stato attuale del sistema
   */
  async generateActionSuggestions(state: SystemState): Promise<AIAction[]> {
    try {
      console.log("Generazione suggerimenti AI con stato:", state);
      
      // Prepara il prompt per l'AI
      const prompt = `
${SYSTEM_PROMPTS.BATTERY_MANAGEMENT}

Stato attuale del sistema:
- Livello batteria: ${state.batteryCharge}%
- Prezzo di mercato: ${state.marketPrice} €/MWh
- Irradiazione solare: ${state.solarIrradiance} W/m²
- Temperatura: ${state.temperature}°C
- Efficienza: ${state.efficiency}%
${state.hasAlert ? "- ATTENZIONE: Il sistema ha segnalazioni attive" : ""}

Soglie configurate:
- Batteria: livello minimo ${THRESHOLDS.BATTERY.MIN_CHARGE}%, massimo ${THRESHOLDS.BATTERY.MAX_CHARGE}%
- Temperatura: ottimale ${THRESHOLDS.BATTERY.OPTIMAL_TEMP_MIN}°C - ${THRESHOLDS.BATTERY.OPTIMAL_TEMP_MAX}°C
- Efficienza: minima accettabile ${THRESHOLDS.BATTERY.MIN_EFFICIENCY}%

Fornisci 1-3 suggerimenti di azioni da intraprendere in formato JSON come array di oggetti con i seguenti campi:
type (CHARGE, DISCHARGE, HOLD, MAINTENANCE, OPTIMIZE),
power (potenza in MW, 0-100),
explanation (breve spiegazione),
confidence (0.0-1.0),
priority (high, medium, low),
timeframe (opzionale, es. "immediato", "entro 2 ore"),
expectedRevenue (stima dei ricavi in €)

Rispondi SOLO con l'array JSON senza altro testo.`;

      // Ottieni il completamento dall'AI
      try {
        const response = await OpenAIService.getChatCompletion({
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS.AI_AGENT },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        });
        
        // Parsa la risposta JSON
        try {
          // Estrai la parte JSON dalla risposta
          const jsonMatch = response.match(/\[[\s\S]*\]/);
          const jsonStr = jsonMatch ? jsonMatch[0] : response;
          
          const parsed = JSON.parse(jsonStr);
          
          // Valida e filtra le azioni
          if (Array.isArray(parsed)) {
            const validActions = parsed.filter(action => 
              action.type && action.confidence && action.explanation && action.priority
            );
            
            if (validActions.length > 0) {
              return validActions;
            }
          }
          
          console.warn("Formato di risposta AI non valido, uso azioni di fallback");
        } catch (parseError) {
          console.error("Errore nel parsing della risposta JSON:", parseError);
        }
      } catch (aiError) {
        console.error("Errore nella generazione delle azioni:", aiError);
      }
      
      // Fallback: genera azioni basate sullo stato attuale
      return generateFallbackActions(state);
    } catch (error) {
      console.error("Errore generale nel servizio AI Agent:", error);
      return generateFallbackActions(state);
    }
  }
};

/**
 * Genera azioni di fallback basate sullo stato del sistema
 */
function generateFallbackActions(state: SystemState): AIAction[] {
  const actions: AIAction[] = [];
  
  // Azione 1: Carica/Scarica in base al livello della batteria e prezzo di mercato
  if (state.batteryCharge < THRESHOLDS.BATTERY.MIN_CHARGE + 10) {
    // Se la batteria è bassa, suggerisci di caricare (soprattutto se il prezzo è basso)
    actions.push({
      type: 'CHARGE',
      power: 50,
      expectedRevenue: state.marketPrice < 80 ? 120 : 80,
      confidence: 0.9,
      explanation: `La batteria è al ${state.batteryCharge}%, sotto il livello ottimale. Caricando ora si evita il rischio di non avere energia sufficiente.`,
      priority: 'high',
      timeframe: 'Immediato'
    });
  } else if (state.batteryCharge > THRESHOLDS.BATTERY.MAX_CHARGE - 10 && state.marketPrice > 120) {
    // Se la batteria è alta e il prezzo è alto, suggerisci di scaricare
    actions.push({
      type: 'DISCHARGE',
      power: 70,
      expectedRevenue: 180,
      confidence: 0.85,
      explanation: `Il prezzo di mercato è alto (${state.marketPrice} €/MWh) e la batteria è ben carica. Scaricando ora si massimizza il profitto.`,
      priority: 'medium',
      timeframe: 'Entro 1 ora'
    });
  } else {
    // Mantieni lo stato attuale
    actions.push({
      type: 'HOLD',
      power: 0,
      expectedRevenue: 0,
      confidence: 0.7,
      explanation: 'Le condizioni attuali suggeriscono di mantenere lo stato corrente e attendere opportunità migliori.',
      priority: 'low',
      timeframe: 'Prossime 3 ore'
    });
  }
  
  // Azione 2: In base alla temperatura
  if (state.temperature > THRESHOLDS.BATTERY.OPTIMAL_TEMP_MAX) {
    actions.push({
      type: 'MAINTENANCE',
      power: 0,
      expectedRevenue: -50,
      confidence: 0.8,
      explanation: `La temperatura della batteria (${state.temperature}°C) è sopra il livello ottimale. Si consiglia verifica del sistema di raffreddamento.`,
      priority: 'high',
      timeframe: 'Entro 6 ore'
    });
  }
  
  // Azione 3: In base all'efficienza
  if (state.efficiency < THRESHOLDS.BATTERY.MIN_EFFICIENCY + 5) {
    actions.push({
      type: 'OPTIMIZE',
      power: 0,
      expectedRevenue: 200,
      confidence: 0.75,
      explanation: `L'efficienza del sistema è bassa (${state.efficiency}%). Un'ottimizzazione del sistema può migliorare le performance e ridurre le perdite.`,
      priority: 'medium',
      timeframe: 'Pianificare entro 3 giorni'
    });
  }
  
  // Limita a massimo 3 azioni
  return actions.slice(0, 3);
}

export default AIAgentService; 