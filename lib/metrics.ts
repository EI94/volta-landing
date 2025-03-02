import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

interface MetricData {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  lastUpdated: string;
}

class MetricsCollector {
  private static instance: MetricsCollector;
  private readonly METRICS_KEY = 'api:metrics';
  private readonly WINDOW_SIZE = 60; // 1 minuto in secondi

  private constructor() {}

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  async recordRequest(statusCode: number, responseTime: number) {
    try {
      const now = new Date();
      const currentMinute = Math.floor(now.getTime() / 60000);
      
      // Incrementa il contatore delle richieste per il minuto corrente
      const requestCountKey = `api:requests:${currentMinute}`;
      await redis.incr(requestCountKey);
      await redis.expire(requestCountKey, this.WINDOW_SIZE);

      // Aggiorna le metriche globali
      const metrics = await this.getMetrics();
      const updatedMetrics: MetricData = {
        totalRequests: metrics.totalRequests + 1,
        successfulRequests: metrics.successfulRequests + (statusCode < 400 ? 1 : 0),
        failedRequests: metrics.failedRequests + (statusCode >= 400 ? 1 : 0),
        averageResponseTime: (metrics.averageResponseTime * metrics.totalRequests + responseTime) / (metrics.totalRequests + 1),
        requestsPerMinute: await this.calculateRequestsPerMinute(),
        lastUpdated: now.toISOString()
      };

      await redis.set(this.METRICS_KEY, updatedMetrics);
    } catch (error) {
      console.error('Errore nel salvataggio delle metriche:', error);
    }
  }

  private async calculateRequestsPerMinute(): Promise<number> {
    const now = new Date();
    const currentMinute = Math.floor(now.getTime() / 60000);
    const requestCountKey = `api:requests:${currentMinute}`;
    const count = await redis.get<number>(requestCountKey) || 0;
    return count;
  }

  async getMetrics(): Promise<MetricData> {
    try {
      const metrics = await redis.get<MetricData>(this.METRICS_KEY);
      if (metrics) return metrics;

      // Metriche iniziali se non esistono
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        requestsPerMinute: 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Errore nel recupero delle metriche:', error);
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        requestsPerMinute: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
}

export const metrics = MetricsCollector.getInstance(); 