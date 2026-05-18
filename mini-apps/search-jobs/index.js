/**
 * Mini-App: Buscador de Empleo
 * Ubicación: mini-apps/search-jobs/index.js
 */

export async function init(context) {
  const { db, ui, queue, config } = context;
  
  // Elementos del DOM
  const form = document.getElementById('search-form');
  const locationSelect = document.getElementById('location-select');
  const categorySelect = document.getElementById('category-select');
  const tabs = document.querySelectorAll('.search-tab');
  const tags = document.querySelectorAll('.tag');
  const typeButtons = document.querySelectorAll('.type-btn');

  // Cargar datos iniciales
  await loadSelectData(locationSelect, categorySelect);

  // Event Listeners
  if (form) {
    form.addEventListener('submit', handleSearch);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab, tabs));
  });

  tags.forEach(tag => {
    tag.addEventListener('click', () => handleTagClick(tag));
  });

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => switchUserType(btn, typeButtons));
  });

  console.log('[SearchJobs] Mini-app initialized');

  // Funciones
  async function loadSelectData(locationEl, categoryEl) {
    try {
      const [locationsData, categoriesData] = await Promise.all([
        fetch('/data/registry/locations.json').then(r => r.json()),
        fetch('/data/registry/categories.json').then(r => r.json())
      ]);

      // Llenar ubicaciones
      locationsData.municipios.forEach(municipio => {
        const option = document.createElement('option');
        option.value = municipio;
        option.textContent = municipio;
        locationEl.appendChild(option);
      });

      // Llenar categorías
      categoriesData.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categoryEl.appendChild(option);
      });

    } catch (error) {
      console.error('[SearchJobs] Error loading data:', error);
      ui?.notify('Error cargando filtros', 'error');
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const searchData = {
      keyword: formData.get('keyword'),
      location: formData.get('location'),
      category: formData.get('category'),
      type: document.querySelector('.search-tab.active')?.dataset.tab || 'jobs'
    };

    // Registrar búsqueda en queue
    queue?.enqueue({
      type: 'search',
      payload: searchData
    });

    // Aquí iría la navegación a resultados
    ui?.notify(`Buscando: ${searchData.keyword || 'todas las vacantes'}`, 'info');
    
    // En producción: window.location.href = `/buscar?${new URLSearchParams(searchData)}`;
  }

  function switchTab(activeTab, allTabs) {
    allTabs.forEach(tab => tab.classList.remove('active'));
    activeTab.classList.add('active');
  }

  function handleTagClick(tag) {
    const keyword = tag.dataset.filter;
    const input = form.querySelector('input[name="keyword"]');
    if (input && keyword) {
      input.value = keyword;
      input.focus();
    }
  }

  function switchUserType(activeBtn, allButtons) {
    allButtons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
    
    const userType = activeBtn.dataset.type;
    queue?.enqueue({
      type: 'user_type_selected',
      payload: { type: userType }
    });
  }
}

export default { init };