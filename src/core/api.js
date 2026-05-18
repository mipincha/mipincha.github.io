/**
 * API Proxy Seguro - Sin tokens expuestos
 * Ubicación: src/core/api.js
 */

const API_BASE = ''; // GitHub Pages base

class SafeAPI {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutos
  }

  async get(endpoint, options = {}) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTimeout) {
        return data;
      }
    }

    try {
      const url = `${API_BASE}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache exitoso
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('[API] GET error:', error);
      throw error;
    }
  }

  async getSnapshot(collection, month) {
    return this.get(`/data/snapshots/${collection}-${month}.json`);
  }

  async getCategories() {
    return this.get('/data/registry/categories.json');
  }

  async getLocations() {
    return this.get('/data/registry/locations.json');
  }

  clearCache(endpoint) {
    if (endpoint) {
      const keys = Array.from(this.cache.keys());
      keys.forEach(key => {
        if (key.startsWith(endpoint)) {
          this.cache.delete(key);
        }
      });
    } else {
      this.cache.clear();
    }
  }
}

export const api = new SafeAPI();
export default api;