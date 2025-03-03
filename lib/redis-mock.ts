// Mock client per Redis quando è disabilitato
export const mockRedisClient = {
  get: async <T>(_key: string): Promise<T | null> => {
    console.log(`[Mock Redis] GET: ${_key}`);
    return null;
  },
  
  set: async <T>(_key: string, _value: T, _options?: { ex?: number }): Promise<string> => {
    console.log(`[Mock Redis] SET: ${_key}`);
    return 'OK';
  },
  
  incr: async (_key: string): Promise<number> => {
    console.log(`[Mock Redis] INCR: ${_key}`);
    return 1;
  },
  
  expire: async (_key: string, _seconds: number): Promise<number> => {
    console.log(`[Mock Redis] EXPIRE: ${_key}`);
    return 1;
  },
  
  pipeline: () => {
    return {
      get: () => ({ mockRedisClient }),
      set: () => ({ mockRedisClient }),
      incr: () => ({ mockRedisClient }),
      expire: () => ({ mockRedisClient }),
      exec: async () => []
    };
  }
}; 