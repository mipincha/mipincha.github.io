// Interactividad básica
document.addEventListener('DOMContentLoaded', function() {
    
    // Tabs del buscador
    const searchTabs = document.querySelectorAll('.search-tab');
    searchTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            searchTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Tags de búsqueda
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const keyword = this.textContent;
            const searchInput = document.querySelector('.input-group input');
            if(searchInput) {
                searchInput.value = keyword;
            }
        });
    });

    // Botones de tipo de usuario
    const candidateBtn = document.querySelector('.btn-candidate');
    const companyBtn = document.querySelector('.btn-company-outline');
    
    if(candidateBtn && companyBtn) {
        candidateBtn.addEventListener('click', function() {
            alert('Redirigiendo a registro de candidato...');
            // Aquí iría: window.location.href = '/registro?tipo=candidato';
        });

        companyBtn.addEventListener('click', function() {
            alert('Redirigiendo a registro de empresa...');
            // Aquí iría: window.location.href = '/registro?tipo=empresa';
        });
    }

    // Botón de búsqueda
    const searchBtn = document.querySelector('.btn-search');
    if(searchBtn) {
        searchBtn.addEventListener('click', function() {
            const keyword = document.querySelector('.input-group input')?.value;
            const location = document.querySelectorAll('.input-group input')[1]?.value;
            
            if(keyword || location) {
                alert(`Buscando: ${keyword || 'todas'} en ${location || 'todas las ubicaciones'}`);
                // Aquí iría: window.location.href = `/buscar?keyword=${keyword}&location=${location}`;
            } else {
                alert('Por favor ingresa al menos un criterio de búsqueda');
            }
        });
    }

    // Cards de empleo
    const jobCards = document.querySelectorAll('.job-card');
    jobCards.forEach(card => {
        card.addEventListener('click', function() {
            const jobTitle = this.querySelector('.job-title')?.textContent;
            alert(`Viendo detalles de: ${jobTitle}`);
            // Aquí iría: window.location.href = `/empleo/${slug}`;
        });
    });

    // Botones CTA
    const ctaButtons = document.querySelectorAll('.btn-cta, .btn-cta-white');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.toLowerCase();
            if(text.includes('perfil')) {
                alert('Redirigiendo a registro de candidato...');
            } else {
                alert('Redirigiendo a publicación de vacante...');
            }
        });
    });

    console.log('✅ Mi Pincha - Web cargada correctamente');
});