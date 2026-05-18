/**
 * Queue System - APPEND-ONLY + BATCHING
 * Ubicación: src/core/queue.js
 * 
 * Los placeholders __MP_REPO__ y __MP_DISPATCH_SECRET__ son reemplazados automáticamente 
 * por el prebuild. NUNCA expongas tokens reales aquí.
 */
const CONFIG = {
  STORAGE_KEY: 'mp_queue_v1',
  MAX_BATCH_SIZE: 10,
  FLUSH_INTERVAL_MS: 30000,
  REPO: '__MP_REPO__',
  DISPATCH_SECRET: '__MP_DISPATCH_SECRET__'
};

class JobQueue {
  constructor() {
    this.queue = this._load();
    this.isSyncing = false;
    this._scheduleAutoFlush();
    console.log(`[Queue] Inicializado. ${this.queue.length} jobs en cola.`);
  }

  _load() {
    try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  _save() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.queue));
  }

  enqueue(type, payload) {
    if (!type || !payload) throw new Error('Job inválido');
    
    this.queue.push({
      id: crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type,
      payload,
      meta: { ts: Date.now(), origin: location.hostname }
    });
    
    this._save();
    if (this.queue.length >= CONFIG.MAX_BATCH_SIZE) this.sync();
  }

  async sync() {
    if (this.isSyncing || this.queue.length === 0) return;
    this.isSyncing = true;

    const batch = {
      batch_id: crypto.randomUUID?.() || Date.now().toString(36),
      jobs: this.queue.slice(),
      meta: { count: this.queue.length, created_at: new Date().toISOString() }
    };

    try {
      await this._dispatch(batch);
      this.queue = [];
      this._save();
      console.log('[Queue] Sincronización exitosa');
      window.dispatchEvent(new CustomEvent('mp:synced', { detail: batch }));
    } catch (err) {
      console.warn('[Queue] Sincronización fallida (se reintentará):', err.message);
    } finally {
      this.isSyncing = false;
    }
  }

  async _dispatch(batch) {
    const url = `https://api.github.com/repos/${CONFIG.REPO}/dispatches`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'queue-batch',
        client_payload: {
          secret: CONFIG.DISPATCH_SECRET,
          batch: btoa(JSON.stringify(batch))
        }
      })
    });
    if (!res.ok && res.status !== 204) throw new Error(`GitHub API ${res.status}`);
  }

  _scheduleAutoFlush() {
    setInterval(() => this.sync(), CONFIG.FLUSH_INTERVAL_MS);
    window.addEventListener('beforeunload', () => this.sync());
    window.addEventListener('online', () => this.sync());
  }

  getPendingCount() { return this.queue.length; }
}

export const queue = new JobQueue();
export default queue;