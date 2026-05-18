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
    console.log('[App] Initializing...');
    
    // Exponer queue global para mini-apps
    window.queue = queue;
    window.MP_REPO = 'mipincha/mipincha.github.io'; // Configurar aquí o vía build
    // window.MP_API_TOKEN = 'ghp_...'; // Inyectar de forma segura

    await this.loadSnapshots();
    this.bindUI();
    this.render();
    
    console.log('[App] Ready');
    window.dispatchEvent(new Event('mipincha:ready'));
  }

  async loadSnapshots() {
    try {
      const month = new Date().toISOString().slice(0, 7);
      const res = await fetch(`./data/snapshots/jobs-${month}.json`);
      if (res.ok) {
        this.snapshots.jobs = (await res.json()).jobs || [];
      }
    } catch (err) {
      console.warn('[App] Snapshot load failed, using empty state');
    }
  }

  bindUI() {
    // Registro Candidato
    document.querySelectorAll('[data-action="register-candidate"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = document.getElementById('register-candidate-form');
        if (form) {
          const data = new FormData(form);
          queue.enqueue('candidate_register', {
            name: data.get('name'),
            email: data.get('email'),
            phone: data.get('phone'),
            role: 'candidate'
          });
          alert('✅ Registro enviado. Se procesará en la próxima sincronización.');
          form.reset();
        }
      });
    });

    // Registro Empresa
    document.querySelectorAll('[data-action="register-company"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = document.getElementById('register-company-form');
        if (form) {
          const data = new FormData(form);
          queue.enqueue('company_register', {
            name: data.get('name'),
            email: data.get('email'),
            sector: data.get('sector'),
            role: 'company'
          });
          alert('✅ Empresa registrada. Se procesará en la próxima sincronización.');
          form.reset();
        }
      });
    });

    // Publicar Vacante
    document.querySelectorAll('[data-action="publish-job"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = document.getElementById('publish-job-form');
        if (form) {
          const data = new FormData(form);
          queue.enqueue('job_publish', {
            title: data.get('title'),
            category: data.get('category'),
            location: data.get('location'),
            modality: data.get('modality'),
            description: data.get('description')
          });
          alert('✅ Vacante enviada a revisión. Aparecerá tras compactación.');
          form.reset();
        }
      });
    });
  }

  render() {
    // Renderizar jobs desde snapshot
    const grid = document.getElementById('jobs-grid');
    if (grid && this.snapshots.jobs.length > 0) {
      grid.innerHTML = this.snapshots.jobs.slice(-4).map(job => `
        <article class="job-card">
          <div class="job-header">
            <h3 class="job-title">${job.payload.category || 'General'}</h3>
            <span class="job-subtitle">${job.payload.title}</span>
          </div>
          <div class="job-meta">
            <span class="job-location">📍 ${job.payload.location || 'La Habana'}</span>
            <span class="job-type job-type--${(job.payload.modality||'remoto').toLowerCase().replace(/ /g,'-')}">${job.payload.modality || 'Remoto'}</span>
          </div>
          <div class="job-footer">
            <span class="job-date">${new Date(job.meta.ts).toLocaleDateString('es-CU')}</span>
          </div>
        </article>
      `).join('');
    }

    // Stats dinámicos
    document.getElementById('stat-found').textContent = `+${this.snapshots.jobs.length + 100}`;
  }
}

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MiPinchaApp().init());
} else {
  new MiPinchaApp().init();
}

export default MiPinchaApp;