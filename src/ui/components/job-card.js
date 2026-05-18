/**
 * Componente: Job Card
 * Ubicación: src/ui/components/job-card.js
 */

export function createJobCard(job) {
  const article = document.createElement('article');
  article.className = 'job-card';
  article.dataset.category = job.category;
  article.dataset.jobId = job.id;
  article.setAttribute('tabindex', '0');
  article.setAttribute('role', 'button');
  article.setAttribute('aria-label', `Ver detalles de ${job.title}`);

  const modalityClass = getModalityClass(job.modality);

  article.innerHTML = `
    <div class="job-header">
      <h3 class="job-title">${job.categoryName || job.category}</h3>
      <span class="job-subtitle">${job.title}</span>
    </div>
    <div class="job-meta">
      <span class="job-location">📍 ${job.location}</span>
      <span class="job-type job-type--${modalityClass}">${job.modality}</span>
    </div>
    <div class="job-footer">
      <span class="job-salary">${job.salary || 'No especificado'}</span>
      <span class="job-date">${formatDate(job.postedAt)}</span>
    </div>
  `;

  // Event listeners
  article.addEventListener('click', () => handleJobClick(job.id));
  article.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleJobClick(job.id);
  });

  return article;
}

function getModalityClass(modality) {
  const map = {
    'Remoto': 'remote',
    'Presencial': 'presencial',
    'Híbrido': 'hybrid',
    'Temporal': 'temporal',
    'Por proyecto': 'project',
    'Freelance': 'freelance'
  };
  return map[modality] || 'default';
}

function formatDate(dateString) {
  if (!dateString) return 'Reciente';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  
  return date.toLocaleDateString('es-CU');
}

function handleJobClick(jobId) {
  console.log('[JobCard] Clicked:', jobId);
  // En producción: window.location.href = `/empleo/${jobId}`;
  
  // Registrar click
  if (window.queue) {
    window.queue.enqueue({
      type: 'job_view',
      payload: { jobId, timestamp: Date.now() }
    });
  }
}

export default createJobCard;