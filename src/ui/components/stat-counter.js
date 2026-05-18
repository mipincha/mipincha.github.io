/**
 * Componente: Contador Animado
 * Ubicación: src/ui/components/stat-counter.js
 */

export function animateCounter(element, targetValue, duration = 2000) {
  if (!element) return;

  const start = 0;
  const increment = targetValue / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      current = targetValue;
      clearInterval(timer);
    }
    
    element.textContent = formatNumber(Math.floor(current));
  }, 16);
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return '+' + (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return '+' + (num / 1000).toFixed(0) + ',000';
  }
  return '+' + num.toLocaleString('es-CU');
}

export async function initStatsCounters() {
  const counters = document.querySelectorAll('[data-count]');
  
  // Intersection Observer para animar solo cuando son visibles
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const targetValue = parseInt(element.dataset.count, 10);
        animateCounter(element, targetValue);
        observer.unobserve(element);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

export default { animateCounter, formatNumber, initStatsCounters };