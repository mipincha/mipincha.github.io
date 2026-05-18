/**
 * Registry Manager - Validación de Mini-Apps
 * Ubicación: src/core/registry.js
 */

class MiniAppRegistry {
  constructor() {
    this.registeredApps = new Map();
    this.config = null;
  }

  async load() {
    try {
      const response = await fetch('/data/registry/mini-apps.json');
      this.config = await response.json();
      
      this.config.miniApps.forEach(app => {
        if (app.enabled) {
          this.registeredApps.set(app.id, app);
        }
      });

      console.log('[Registry] Loaded', this.registeredApps.size, 'mini-apps');
      return this.config;
    } catch (error) {
      console.error('[Registry] Load error:', error);
      return null;
    }
  }

  getApp(appId) {
    return this.registeredApps.get(appId);
  }

  hasPermission(appId, permission) {
    const app = this.registeredApps.get(appId);
    if (!app) return false;
    return app.permissions.includes(permission);
  }

  getAllEnabled() {
    return Array.from(this.registeredApps.values());
  }

  async loadAppData(appId) {
    const app = this.registeredApps.get(appId);
    if (!app) throw new Error(`Mini-app ${appId} no registrado`);

    try {
      const response = await fetch(`${app.path}/manifest.json`);
      const manifest = await response.json();
      
      // Validar que el manifest coincida con el registro
      if (manifest.id !== appId) {
        throw new Error(`ID mismatch: ${manifest.id} !== ${appId}`);
      }

      return manifest;
    } catch (error) {
      console.error(`[Registry] Error loading ${appId}:`, error);
      throw error;
    }
  }
}

export const registry = new MiniAppRegistry();
export default registry;