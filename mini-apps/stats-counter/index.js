/**
 * Mini-App: Contador de Estadísticas
 * Ubicación: mini-apps/stats-counter/index.js
 */

export async function init(context) {
  const { db, ui } = context;
  const container = document.querySelector('[data-mini-app="stats-counter"]');

  if (!container) return;

  try {
    // Intentar cargar stats reales o usar mock
    const stats = await loadStats();
    updateCounter(container, stats.foundJobs || 100);
    
  } catch (error) {
    console.error('[StatsCounter] Error:', error);
    updateCounter(container, 100); // Fallback
  }
}

async function loadStats() {
  // En producción: cargar desde snapshot
  // const response = await fetch('/data/snapshots/stats-latest.json');
  // return response.json();
  
  // Mock por ahora
  return {
    foundJobs: 100,
    activeUsers: 10000,
    registeredCompanies: 1500,
    publishedJobs: 15000,
    successfulHires: 1000
  };
}

function updateCounter(container, targetValue) {
  const statText = container.querySelector('.stat-text strong');
  if (!statText) return;

  const duration = 2000; // 2 segundos
  const start = 0;
  const increment = targetValue / (duration / 16); // 60fps
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      current = targetValue;
      clearInterval(timer);
    }
    
    statText.textContent = `+${Math.floor(current)}`;
  }, 16);
}

export default { init };