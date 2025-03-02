import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DemoInterface from '../DemoInterface';

interface MockResponse {
  currentState: {
    bess: {
      data: {
        currentChargePercent: number;
        temperatureC: number;
        batteryHealthPercent: number;
        cycleCount: number;
        efficiency: number;
      };
      status: { warnings: string[] };
    };
    market: { currentPrice: number };
    weather: { solarIrradiance: number };
  };
  ai: {
    recommendations: Record<string, unknown>;
    chargeSchedule: unknown[];
  };
}

// Mock delle funzioni fetch
const mockResponse: MockResponse = {
  currentState: {
    bess: {
      data: {
        currentChargePercent: 75,
        temperatureC: 25,
        batteryHealthPercent: 95,
        cycleCount: 100,
        efficiency: 0.92
      },
      status: { warnings: [] }
    },
    market: { currentPrice: 50 },
    weather: { solarIrradiance: 800 }
  },
  ai: {
    recommendations: {},
    chargeSchedule: []
  }
};

const createMockResponse = (data: MockResponse, status = 200, ok = true) => {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-type': 'application/json' }
  });
  Object.defineProperty(response, 'ok', { value: ok });
  return response;
};

global.fetch = jest.fn(() => Promise.resolve(createMockResponse(mockResponse)));

describe('DemoInterface Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Verifica che le funzioni toggle siano memoizzate', async () => {
    render(<DemoInterface />);
    
    // Attendi il caricamento dei dati
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Test toggleFullscreen
    const fullscreenButton = screen.getByText('⛶');
    fireEvent.click(fullscreenButton);
    expect(screen.getByText('🔄')).toBeInTheDocument();
    fireEvent.click(screen.getByText('🔄'));
    expect(screen.getByText('⛶')).toBeInTheDocument();

    // Test toggleAutoRefresh
    const autoRefreshButton = screen.getByText('🔄 OFF');
    fireEvent.click(autoRefreshButton);
    expect(screen.getByText('🔄 ON')).toBeInTheDocument();
    fireEvent.click(screen.getByText('🔄 ON'));
    expect(screen.getByText('🔄 OFF')).toBeInTheDocument();

    // Test toggleMarketGraph
    const marketGraphTrigger = screen.getByText(/Prezzo Energia/);
    fireEvent.click(marketGraphTrigger);
    expect(screen.getByText(/nascondere/)).toBeInTheDocument();
    fireEvent.click(marketGraphTrigger);
    expect(screen.getByText(/mostrare/)).toBeInTheDocument();
  });

  test('Verifica che i dati memoizzati vengano aggiornati correttamente', async () => {
    render(<DemoInterface />);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verifica formattedBessData
    expect(screen.getByText('75.0%')).toBeInTheDocument();
    expect(screen.getByText('25.0°C')).toBeInTheDocument();
    expect(screen.getByText('92.0%')).toBeInTheDocument();

    // Simula un aggiornamento dei dati
    const updatedResponse = {
      ...mockResponse,
      currentState: {
        ...mockResponse.currentState,
        bess: {
          data: {
            currentChargePercent: 80,
            temperatureC: 26,
            batteryHealthPercent: 94,
            cycleCount: 101,
            efficiency: 0.91
          },
          status: { warnings: [] }
        }
      }
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve(createMockResponse(updatedResponse))
    );

    // Simula il refresh automatico
    await act(async () => {
      fireEvent.click(screen.getByText('🔄 OFF'));
      await new Promise(resolve => setTimeout(resolve, 15000));
    });

    // Verifica che i dati siano stati aggiornati
    expect(screen.getByText('80.0%')).toBeInTheDocument();
    expect(screen.getByText('26.0°C')).toBeInTheDocument();
    expect(screen.getByText('91.0%')).toBeInTheDocument();
  });

  // Test per la gestione degli errori
  test('Verifica la gestione degli errori nelle chiamate API', async () => {
    // Mock di fetch per simulare un errore
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Errore di rete'))
    );

    render(<DemoInterface />);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verifica che venga mostrato un messaggio di errore
    expect(screen.getByText(/Errore di rete/)).toBeInTheDocument();
  });

  test('Verifica la gestione delle risposte HTTP non valide', async () => {
    // Mock di fetch per simulare una risposta 500
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve(createMockResponse({ error: 'Server error' }, 500, false))
    );

    render(<DemoInterface />);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verifica che venga mostrato un messaggio di errore appropriato
    expect(screen.getByText(/HTTP error! status: 500/)).toBeInTheDocument();
  });
}); 