/**
 * Compact Queue Script
 * Ubicación: scripts/compact-queue.js
 */
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ROOT = path.join(__dirname, '..');
const INCOMING_DIR = path.join(ROOT, 'data', 'queue', 'incoming');
const ARCHIVE_DIR = path.join(ROOT, 'data', 'queue', 'archive');
const SNAPSHOT_DIR = path.join(ROOT, 'data', 'snapshots');
const SCHEMA_DIR = path.join(ROOT, 'data', 'schema');

const ajv = new Ajv();

class Compactor {
  constructor() {
    this.month = new Date().toISOString().slice(0, 7);
    this.processed = 0;
  }

  run() {
    console.log(`[Compactor] Iniciando para ${this.month}`);
    
    if (!fs.existsSync(INCOMING_DIR)) {
      console.log('[Compactor] Sin batches pendientes.');
      return;
    }

    const batches = this.readIncomingBatches();
    if (batches.length === 0) return;

    const jobs = this.processBatches(batches);
    console.log(`[Compactor] ${jobs.length} jobs validados.`);

    const snapshotPath = path.join(SNAPSHOT_DIR, `jobs-${this.month}.json`);
    const existing = this.loadSnapshot(snapshotPath);
    const merged = this.mergeJobs(existing.jobs || [], jobs);

    this.saveSnapshot(snapshotPath, {
      version: '1.0',
      month: this.month,
      updated: new Date().toISOString(),
      totalJobs: merged.length,
      jobs: merged
    });

    this.archiveBatches(batches);
    console.log('[Compactor] Finalizado ✓');
  }

  readIncomingBatches() {
    return fs.readdirSync(INCOMING_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(INCOMING_DIR, f), 'utf8')));
  }

  processBatches(batches) {
    const jobs = [];
    const jobSchema = this.loadSchema('job.schema.json');
    const validate = jobSchema ? ajv.compile(jobSchema) : null;

    batches.forEach(b => {
      b.jobs.forEach(job => {
        if (validate && !validate(job.payload)) {
          console.warn(`[Compactor] Job ${job.id} rechazado por schema`);
          return;
        }
        jobs.push(job);
        this.processed++;
      });
    });
    return jobs;
  }

  mergeJobs(existing, newJobs) {
    const map = new Map();
    existing.forEach(j => map.set(j.id, j));
    newJobs.forEach(j => {
      const ex = map.get(j.id);
      if (!ex || j.meta.ts > ex.meta.ts) map.set(j.id, j);
    });
    return Array.from(map.values());
  }

  loadSnapshot(p) {
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : { jobs: [] };
  }

  saveSnapshot(p, data) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  }

  archiveBatches(batches) {
    const now = new Date().toISOString().split('T')[0];
    const archivePath = path.join(ARCHIVE_DIR, now);
    fs.mkdirSync(archivePath, { recursive: true });
    
    batches.forEach(b => {
      const src = path.join(INCOMING_DIR, `batch-${b.batch_id}.json`);
      const dest = path.join(archivePath, `batch-${b.batch_id}.json`);
      if (fs.existsSync(src)) fs.renameSync(src, dest);
    });
  }

  loadSchema(name) {
    const p = path.join(SCHEMA_DIR, name);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  }
}

new Compactor().run();