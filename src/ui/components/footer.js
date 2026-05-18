/**
 * Componente: Footer
 * Ubicación: src/ui/components/footer.js
 */

export function initFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  // Agregar año actual automáticamente
  const yearSpan = footer.querySelector('.footer-bottom p');
  if (yearSpan) {
    const currentYear = new Date().getFullYear();
    yearSpan.innerHTML = yearSpan.innerHTML.replace('2026', currentYear);
  }

  // Smooth scroll para links del footer
  footer.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  console.log('[Footer] Initialized');
}

export default initFooter;