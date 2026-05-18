/**
 * Queue System - APPEND-ONLY + BATCHING
 * Ubicación: src/core/queue.js
 */
const QUEUE_CONFIG = {
  STORAGE_KEY: 'mp_queue_v1',
  MAX_BATCH_SIZE: 10,
  FLUSH_INTERVAL_MS: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000,
  // Se inyecta de forma segura vía build o variable de entorno
  API_BASE: 'https://api.github.com',
  REPO: window.MP_REPO || 'mipincha/mipincha.github.io',
  QUEUE_PATH: 'data/queue'
};

class JobQueue {
  constructor() {
    this.queue = this._load();
    this.isFlushing = false;
    this._scheduleFlush();
    console.log(`[Queue] Init: ${this.queue.length} pending jobs`);
  }

  _load() {
    try {
      const raw = localStorage.getItem(QUEUE_CONFIG.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  _save() {
    localStorage.setItem(QUEUE_CONFIG.STORAGE_KEY, JSON.stringify(this.queue));
  }

  enqueue(type, payload) {
    if (!type || !payload) throw new Error('Job inválido');
    
    const job = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
      type,
      payload,
      meta: {
        ts: Date.now(),
        ua: navigator.userAgent.slice(0, 80),
        origin: location.hostname
      }
    };

    this.queue.push(job);
    this._save();

    if (this.queue.length >= QUEUE_CONFIG.MAX_BATCH_SIZE) {
      this.flush();
    }

    return job.id;
  }

  async flush() {
    if (this.isFlushing || this.queue.length === 0) return;
    this.isFlushing = true;

    const batch = {
      batch_id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
      jobs: this.queue.slice(),
      meta: { count: this.queue.length, created_at: new Date().toISOString() }
    };

    try {
      await this._pushToQueue(batch);
      this.queue = [];
      this._save();
      console.log('[Queue] Flush success');
    } catch (err) {
      console.error('[Queue] Flush failed:', err);
      this._scheduleRetry(batch);
    } finally {
      this.isFlushing = false;
    }
  }

  async _pushToQueue(batch) {
    const now = new Date();
    const shard = `${QUEUE_CONFIG.QUEUE_PATH}/${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
    const filename = `batch-${batch.batch_id}.json`;
    const path = `${shard}/${filename}`;
    const content = btoa(JSON.stringify(batch)); // Base64 para GitHub API

    // Token seguro: inyectado vía build o variable global controlada
    const token = window.MP_API_TOKEN;
    if (!token) throw new Error('MP_API_TOKEN no configurado');

    const response = await fetch(`${QUEUE_CONFIG.API_BASE}/repos/${QUEUE_CONFIG.REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: `chore: queue batch ${batch.batch_id}`,
        content,
        branch: 'main' // O branch dedicado si prefieres
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`GitHub API ${response.status}: ${err.message || 'Unknown'}`);
    }
  }

  _scheduleRetry(batch) {
    let attempts = 0;
    const retry = async () => {
      if (attempts >= QUEUE_CONFIG.MAX_RETRIES) {
        console.warn('[Queue] Max retries reached. Batch saved locally.');
        return;
      }
      attempts++;
      setTimeout(async () => {
        try {
          await this._pushToQueue(batch);
          this.queue = this.queue.filter(j => !batch.jobs.includes(j));
          this._save();
        } catch {
          retry();
        }
      }, QUEUE_CONFIG.RETRY_DELAY_MS * attempts);
    };
    retry();
  }

  _scheduleFlush() {
    setInterval(() => this.flush(), QUEUE_CONFIG.FLUSH_INTERVAL_MS);
    window.addEventListener('beforeunload', () => this.flush());
    window.addEventListener('online', () => this.flush());
  }

  getPendingCount() { return this.queue.length; }
}

export const queue = new JobQueue();
export default queue;