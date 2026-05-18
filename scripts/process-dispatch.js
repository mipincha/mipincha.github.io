/**
 * Procesa batches enviados vía repository_dispatch
 * Ubicación: scripts/process-dispatch.js
 */
const fs = require('fs');
const path = require('path');

const BATCH_DIR = path.join(__dirname, '..', 'data', 'queue', 'incoming');
fs.mkdirSync(BATCH_DIR, { recursive: true });

const payload = process.env.BATCH_DATA;
const secret = process.env.PAYLOAD_SECRET;

if (!payload || !secret) {
  console.log('[Dispatch] No payload. Skipping.');
  process.exit(0);
}

try {
  // Validar secret
  const expectedSecret = process.env.EXPECTED_SECRET || 'mp_sync_2026';
  if (secret !== expectedSecret) {
    console.warn('[Dispatch] Secret inválido. Ignorando.');
    process.exit(0);
  }

  // Decodificar y guardar
  const batch = JSON.parse(Buffer.from(payload, 'base64').toString());
  const filename = `batch-${batch.batch_id}.json`;
  fs.writeFileSync(path.join(BATCH_DIR, filename), JSON.stringify(batch, null, 2));
  console.log(`[Dispatch] Batch guardado: ${filename}`);
  
} catch (err) {
  console.error('[Dispatch] Error:', err.message);
}