//  CONFIG SUPABASE
const SUPABASE_URL = 'https://yznkrbhfsrcoskyoyfxs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bmtyYmhmc3Jjb3NreW95ZnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjczNzQsImV4cCI6MjA5NTI0MzM3NH0.TF_iauRfdaICpT7KipXwrphQYyGu4X4v2_FzQOIl1qw';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 💾 DATOS PARA AUTOCOMPLETADO (Solo para sugerencias rápidas)
const searchData = {
    categories: ["Tecnología e Informática","Salud y Medicina","Educación y Formación","Administración y Oficina","Finanzas y Contabilidad","Legal y Jurídico","Ingeniería y Arquitectura","Construcción y Oficios","Transporte y Logística","Ventas y Comercial","Marketing y Publicidad","Arte, Cultura y Entretenimiento","Hostelería y Turismo","Limpieza y Mantenimiento","Manufactura y Producción","Agricultura, Ganadería y Pesca","Seguridad y Defensa","Recursos Humanos","Ciencia e Investigación","Medios y Comunicación","Deportes y Fitness","Servicios Domésticos","Freelance y Economía Digital","Energía y Medio Ambiente","Blockchain, Cripto y Web3","Inteligencia Artificial y Automatización"],
    positions: ["Desarrollador Frontend","Desarrollador Backend","Médico General","Profesor de Idiomas","Administrativo","Contador","Abogado","Ingeniero Civil","Electricista","Vendedor","Community Manager","Chef","Personal de Limpieza","Operario","Agricultor","Guardia de Seguridad","Reclutador","Periodista","Entrenador Personal","Niñera","Cocinero","Fontanero","Taxista","Teleoperador","Fotógrafo","Recepcionista"]
};

let currentFilter = { keyword: '', location: '', category: '' };
let debounceTimer;

document.addEventListener('DOMContentLoaded', async () => {
    setupButtons();
    await checkAuthState();
    loadJobs();
});

async function checkAuthState() {
    const { data: { session } } = await supabase.auth.getSession();
    const guestEl = document.getElementById('authGuest');
    const userEl = document.getElementById('authUser');
    const badge = document.getElementById('userBadge');

    if (session) {
        guestEl.classList.add('hidden');
        userEl.classList.remove('hidden');
        userEl.classList.add('flex');
        const userType = session.user.user_metadata?.user_type === 'company' ? 'Empresa' : 'Candidato';
        badge.textContent = `${session.user.user_metadata?.full_name || session.user.email} (${userType})`;
    } else {
        guestEl.classList.remove('hidden');
        userEl.classList.add('hidden');
        userEl.classList.remove('flex');
    }
}

function setupButtons() {
    // Búsqueda principal
    document.getElementById('searchBtn').addEventListener('click', () => {
        currentFilter.keyword = document.getElementById('searchKeyword').value;
        currentFilter.category = document.getElementById('searchCategory').value;
        currentFilter.location = document.getElementById('searchLocation').value;
        loadJobs();
    });

    // Autocompletado (solo sugerencias, no reemplaza selects)
    const searchInput = document.getElementById('searchKeyword');
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50 hidden';
    searchInput.parentElement.appendChild(dropdown);
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const val = e.target.value.trim().toLowerCase();
        if (val.length < 2) { dropdown.classList.add('hidden'); return; }
        
        debounceTimer = setTimeout(() => {
            const posMatches = searchData.positions.filter(p => p.toLowerCase().includes(val)).slice(0, 5);
            const catMatches = searchData.categories.filter(c => c.toLowerCase().includes(val)).slice(0, 3);
            
            let html = '';
            catMatches.forEach(c => html += `<div class="suggestion-item font-semibold px-4 py-2 cursor-pointer hover:bg-orange-50 hover:text-pincha-orange border-b border-gray-100" onclick="selectSuggestion('${c}', 'category')">${c} <span class="text-xs text-gray-400 ml-1">Categoría</span></div>`);
            posMatches.forEach(p => html += `<div class="suggestion-item px-4 py-2 cursor-pointer hover:bg-orange-50 hover:text-pincha-orange border-b border-gray-100" onclick="selectSuggestion('${p}', 'position')">${p}</div>`);
            
            if (!html) html = '<div class="p-3 text-gray-500 text-sm">Sin coincidencias</div>';
            dropdown.innerHTML = html;
            dropdown.classList.remove('hidden');
        },