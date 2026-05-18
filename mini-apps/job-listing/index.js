/**
 * Mini-App: Listado de Vacantes Destacadas
 * Ubicación: mini-apps/job-listing/index.js
 */

export async function init(context) {
  const { db, ui } = context;
  const container = document.querySelector('[data-mini-app="job-listing"]');

  if (!container) {
    console.warn('[JobListing] Container not found');
    return;
  }

  try {
    // Cargar snapshot más reciente
    const currentDate = new Date();
    const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const jobsData = await fetch(`/data/snapshots/jobs-${month}.json`)
      .then(r => r.ok ? r.json() : getMockJobs());

    renderJobs(container, jobsData.jobs || jobsData);
    
  } catch (error) {
    console.error('[JobListing] Error:', error);
    ui?.notify('Error cargando vacantes', 'error');
    renderFallback(container);
  }
}

function getMockJobs() {
  return [
    {
      id: 'job_001',
      category: 'ingenieria',
      categoryName: 'Ingeniería y Arquitectura',
      title: 'Diseñador Industrial',
      location: 'Centro Habana',
      modality: 'Remoto',
      salary: '$30.0 - $40.0 USD',
      postedAt: 'Hace 2 días'
    },
    {
      id: 'job_002',
      category: 'educacion',
      categoryName: 'Educación y Formación',
      title: 'Profesor de Idiomas',
      location: 'Vedado',
      modality: 'Presencial',
      salary: '$30.0 - $40.0 USD',
      postedAt: 'Hace 4 días'
    },
    {
      id: 'job_003',
      category: 'domesticos',
      categoryName: 'Servicios Domésticos',
      title: 'Niñera',
      location: 'Habana Vieja',
      modality: 'Temporal',
      salary: '$50.0 USD',
      postedAt: 'Hace 1 día'
    },
    {
      id: 'job_004',
      category: 'construccion',
      categoryName: 'Construcción y Oficios',
      title: 'Electricista',
      location: 'Playa',
      modality: 'Por proyecto',
      salary: '$ ---',
      postedAt: 'Hoy'
    }
  ];
}

function renderJobs(container, jobs) {
  container.innerHTML = jobs.map(job => `
    <article class="job-card" data-category="${job.category}" data-job-id="${job.id}">
      <div class="job-header">
        <h3 class="job-title">${job.categoryName || job.category}</h3>
        <span class="job-subtitle">${job.title}</span>
      </div>
      <div class="job-meta">
        <span class="job-location">📍 ${job.location}</span>
        <span class="job-type job-type--${getModalityClass(job.modality)}">${job.modality}</span>
      </div>
      <div class="job-footer">
        <span class="job-salary">${job.salary}</span>
        <span class="job-date">${job.postedAt}</span>
      </div>
    </article>
  `).join('');

  // Agregar event listeners a las tarjetas
  const cards = container.querySelectorAll('.job-card');
  cards.forEach(card => {
    card.addEventListener('click', () => handleJobClick(card.dataset.jobId));
  });
}

function getModalityClass(modality) {
  const map = {
    'Remoto': 'remote',
    'Presencial': 'presencial',
    'Temporal': 'temporal',
    'Por proyecto': 'project',
    'Híbrido': 'hybrid'
  };
  return map[modality] || 'default';
}

function handleJobClick(jobId) {
  console.log('[JobListing] Job clicked:', jobId);
  // En producción: window.location.href = `/empleo/${jobId}`;
}

function renderFallback(container) {
  container.innerHTML = `
    <div class="fallback-message">
      <p>No hay vacantes disponibles en este momento.</p>
      <button class="btn btn--naranja">Ver todas las categorías</button>
    </div>
  `;
}

export default { init };