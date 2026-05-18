/**
 * Componente: Panel de Filtros
 * Ubicación: src/ui/components/filter-panel.js
 */

export async function createFilterPanel() {
  const panel = document.createElement('div');
  panel.className = 'filter-panel';
  
  try {
    const [categories, locations, modalities] = await Promise.all([
      fetch('/data/registry/categories.json').then(r => r.json()),
      fetch('/data/registry/locations.json').then(r => r.json()),
      getModalities()
    ]);

    panel.innerHTML = `
      <div class="filter-section">
        <h4 class="filter-title">Categoría</h4>
        <select class="filter-select" id="filter-category">
          <option value="">Todas las categorías</option>
          ${categories.categories.map(cat => `
            <option value="${cat.id}">${cat.name}</option>
          `).join('')}
        </select>
      </div>

      <div class="filter-section">
        <h4 class="filter-title">Ubicación</h4>
        <select class="filter-select" id="filter-location">
          <option value="">Todas las ubicaciones</option>
          ${locations.municipios.map(loc => `
            <option value="${loc}">${loc}</option>
          `).join('')}
        </select>
      </div>

      <div class="filter-section">
        <h4 class="filter-title">Modalidad</h4>
        <div class="filter-checkboxes">
          ${modalities.map(mod => `
            <label class="checkbox-label">
              <input type="checkbox" name="modality" value="${mod}" />
              <span>${mod}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="filter-section">
        <h4 class="filter-title">Nivel de experiencia</h4>
        <select class="filter-select" id="filter-experience">
          <option value="">Todos los niveles</option>
          <option value="Sin experiencia">Sin experiencia</option>
          <option value="Junior">Junior</option>
          <option value="Semi Senior">Semi Senior</option>
          <option value="Senior">Senior</option>
          <option value="Lead">Lead</option>
          <option value="Manager">Manager</option>
          <option value="Director">Director</option>
        </select>
      </div>

      <button class="btn btn--naranja btn--full" id="apply-filters">
        Aplicar filtros
      </button>
      <button class="btn btn--outline btn--full" id="clear-filters">
        Limpiar filtros
      </button>
    `;

    return panel;
  } catch (error) {