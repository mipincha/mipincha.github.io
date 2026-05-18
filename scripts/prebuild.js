/**
 * Prebuild Script - Mi Pincha
 * Ubicación: scripts/prebuild.js
 * Funciones: Validación de datos, inyección segura de config, minificación, PWA offline.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

const ENV = {
  REPO: process.env.MP_REPO || 'mipincha/mipincha.github.io',
  DISPATCH_SECRET: process.env.MP_DISPATCH_SECRET || 'mp_sync_2026',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

console.log(`\n🚀 Iniciando Prebuild [${ENV.NODE_ENV.toUpperCase()}]...`);

async function run() {
  try {
    // 1. Limpiar dist
    if (fs.existsSync(DIST_DIR)) fs.rmSync(DIST_DIR, { recursive: true });
    fs.mkdirSync(DIST_DIR, { recursive: true });

    // 2. Validar JSONs críticos
    console.log('🔍 Validando datos...');
    validateJSON(path.join(DATA_DIR, 'registry', 'categories.json'));
    validateJSON(path.join(DATA_DIR, 'registry', 'locations.json'));
    validateJSON(path.join(DATA_DIR, 'registry', 'mini-apps.json'));
    validateJSON(path.join(DATA_DIR, 'registry', 'config.json'));
    console.log('   ✅ JSONs válidos.');

    // 3. Minificar JS con inyección segura
    console.log('📦 Procesando scripts...');
    await buildJS('src/core/queue.js', 'src/core/queue.min.js');
    await buildJS('app.js', 'app.min.js');

    // 4. Minificar CSS
    console.log('🎨 Procesando estilos...');
    await buildCSS('styles.css', 'styles.min.css');

    // 5. Service Worker
    generateSW();

    // 6. Assets y HTML
    copyDir(ASSETS_DIR, path.join(DIST_DIR, 'assets'));
    await buildHTML();

    console.log('\n✅ Prebuild completado. Carpeta dist/ lista.');
  } catch (err) {
    console.error(`\n Prebuild fallido: ${err.message}`);
    process.exit(1);
  }
}

function validateJSON(p) {
  if (!fs.existsSync(p)) throw new Error(`Falta: ${p}`);
  JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function buildJS(src, dest) {
  const code = fs.readFileSync(path.join(ROOT_DIR, src), 'utf8')
    .replace(/__MP_REPO__/g, ENV.REPO)
    .replace(/__MP_DISPATCH_SECRET__/g, ENV.DISPATCH_SECRET);
  
  // Minificación segura nativa (sin dependencias externas)
  const min = code
    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,=+\-*/()])\s*/g, '$1')
    .trim();

  const out = path.join(DIST_DIR, dest);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, ENV.NODE_ENV === 'production' ? min : code);
  console.log(`   ✅ ${src}`);
}

async function buildCSS(src, dest) {
  let css = fs.readFileSync(path.join(ROOT_DIR, src), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

  fs.writeFileSync(path.join(DIST_DIR, dest), css);
  console.log(`   ✅ ${src}`);
}

function generateSW() {
  const sw = `const C='mipincha-${Date.now()}';const A=['/','/index.html','/styles.min.css','/app.min.js','/src/core/queue.min.js'];self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(n=>Promise.all(n.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim()});self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});`;
  fs.writeFileSync(path.join(DIST_DIR, 'sw.js'), sw);
  console.log('   ✅ sw.js generado');
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src, { withFileTypes: true }).forEach(e => {
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  });
}

async function buildHTML() {
  let html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8')
    .replace('href="./styles.css"', 'href="./styles.min.css"')
    .replace('src="./app.js"', 'src="./app.min.js"')
    .replace('src="./src/core/queue.js"', 'src="./src/core/queue.min.js"');

  if (!html.includes('sw.js')) {
    html = html.replace('</body>', `    <script>if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});</script>\n</body>`);
  }
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);
  console.log('   ✅ index.html optimizado');
}

run();