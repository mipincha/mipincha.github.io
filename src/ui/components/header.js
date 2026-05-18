/**
 * Componente: Header
 * Ubicación: src/ui/components/header.js
 */

export function initHeader() {
  const header = document.getElementById('header');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav__link');

  // Mobile menu toggle
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      navToggle.textContent = nav.classList.contains('active') ? '✕' : '☰';
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Cerrar menú mobile si está abierto
          nav?.classList.remove('active');
          if (navToggle) navToggle.textContent = '☰';
        }
      }
    });
  });

  console.log('[Header] Initialized');
}

export default initHeader;