/**
 * Mi Pincha - App Principal
 * Ubicación: app.js
 */
import { queue } from './src/core/queue.js';

class MiPinchaApp {
  constructor() {
    this.snapshots = { jobs: [], candidates: [], companies: [] };
    this.role = localStorage.getItem('mipincha_role') || 'candidate';
  }

  async init() {
    console.log('[App] Iniciando...');
    window.queue = queue;

    await this.loadSnapshots();
    this.bindUI();
    this.render();
    
    // Escuchar sincronizaciones exitosas
    window.addEventListener('mp:synced', () => this.loadSnapshots());
    console.log('[App] Listo');
  }

  async loadSnapshots() {
    try {
      const month = new Date().toISOString().slice(0, 7);
      const res = await fetch(`./data/snapshots/jobs-${month}.json`);
      if (res.ok) {
        const data = await res.json();
        this.snapshots.jobs = data.jobs || [];
      }
    } catch (err) {
      console.warn('[App] Snapshot no disponible aún.');
    }
    this.render();
  }

  bindUI() {
    // Registrar Candidato
    document.querySelectorAll('[data-action="register-candidate"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = document.getElementById('register-candidate-form');
        if (!form) return;
        const fd = new FormData(form);
        queue.enqueue('candidate_register', {
          name: fd.get('name'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          role: 'candidate'
        });
        alert('✅ Registro enviado. Se procesará en la próxima sincronización.');
        form.reset();
      });
    });

    // Registrar Empresa
    document.querySelectorAll('[data-action="register-company"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = document.getElementById('register-company-form');
        if (!form) return;
        const fd = new FormData(form);
        queue.enqueue('company_register', {
          name: fd.get('name'),
          email: fd.get('email'),
          sector: fd.get('sector'),
          role: 'company'
        });
        alert('✅ Empresa registrada. Se procesará en la próxima sincronización.');
        form.reset();
      });
    });

    // Publicar Vacante
    document.querySelectorAll('[data-action="publish-job"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = document.getElementById('publish-job-form');
        if (!form) return;
        const fd = new FormData(form);
        queue.enqueue('job_publish', {
          title: fd.get('title'),
          category: fd.get('category'),
          location: fd.get('location'),
          modality: fd.get('modality'),
          description: fd.get('description')
        });
        alert('✅ Vacante enviada. Aparecerá tras compactación horaria.');
        form.reset();
      });
    });
  }

  render() {
    const grid = document.getElementById('jobs-grid');
    if (!grid) return;

    const jobs = this.snapshots.jobs.length > 0 
      ? this.snapshots.jobs.slice(-4) 
      : [
          { payload: { category: 'Ingeniería', title: 'Diseñador Industrial', location: 'Centro Habana', modality: 'Remoto' }, meta: { ts: Date.now() } },
          { payload: { category: 'Educación', title: 'Profesor de Idiomas', location: 'Vedado', modality: 'Presencial' }, meta: { ts: Date.now() } },
          { payload: { category: 'Servicios', title: 'Niñera', location: 'Habana Vieja', modality: 'Temporal' }, meta: { ts: Date.now() } },
          { payload: { category: 'Construcción', title: 'Electricista', location: 'Playa', modality: 'Por proyecto' }, meta: { ts: Date.now() } }
        ];

    grid.innerHTML = jobs.map(job => `
      <article class="job-card">
        <div class="job-header">
          <h3 class="job-title">${job.payload.category}</h3>
          <span class="job-subtitle">${job.payload.title}</span>
        </div>
        <div class="job-meta">
          <span class="job-location">📍 ${job.payload.location}</span>
          <span class="job-type job-type--${(job.payload.modality||'remoto').toLowerCase().replace(/ /g,'-')}">${job.payload.modality}</span>
        </div>
        <div class="job-footer">
          <span class="job-date">${new Date(job.meta.ts).toLocaleDateString('es-CU')}</span>
        </div>
      </article>
    `).join('');

    document.getElementById('stat-found').textContent = `+${this.snapshots.jobs.length + 100}`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MiPinchaApp().init());
} else {
  new MiPinchaApp().init();
}

export default MiPinchaApp;