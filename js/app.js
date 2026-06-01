// 🔑 CONFIGURACIÓN SUPABASE
const SUPABASE_URL = 'https://yznkrbhfsrcoskyoyfxs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bmtyYmhmc3Jjb3NreW95ZnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjczNzQsImV4cCI6MjA5NTI0MzM3NH0.TF_iauRfdaICpT7KipXwrphQYyGu4X4v2_FzQOIl1qw';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 💾 DATOS PARA AUTOCOMPLETADO (Local, <8KB, sin peticiones extra)
const searchData = {
    categories: [
        "Tecnología e Informática","Salud y Medicina","Educación y Formación",
        "Administración y Oficina","Finanzas y Contabilidad","Legal y Jurídico",
        "Ingeniería y Arquitectura","Construcción y Oficios","Transporte y Logística",
        "Ventas y Comercial","Marketing y Publicidad","Arte, Cultura y Entretenimiento",
        "Hostelería y Turismo","Limpieza y Mantenimiento","Manufactura y Producción",
        "Agricultura, Ganadería y Pesca","Seguridad y Defensa","Recursos Humanos",
        "Ciencia e Investigación","Medios y Comunicación","Deportes y Fitness",
        "Servicios Domésticos","Freelance y Economía Digital","Energía y Medio Ambiente",
        "Blockchain, Cripto y Web3","Inteligencia Artificial y Automatización"
    ],
    positions: [
        "Desarrollador Frontend","Desarrollador Backend","Médico General",
        "Profesor de Idiomas","Administrativo","Contador","Abogado",
        "Ingeniero Civil","Electricista","Vendedor","Community Manager",
        "Chef","Personal de Limpieza","Operario","Agricultor",
        "Guardia de Seguridad","Reclutador","Periodista","Entrenador Personal",
        "Niñera","Cocinero","Fontanero","Taxista","Teleoperador",
        "Fotógrafo","Recepcionista"
    ]
};

let currentFilter = { keyword: '', location: '', category: '' };
let debounceTimer;

// 🚀 INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthState();
    setupSearchAutocomplete();
    setupFilterTags();
    setupSearchButton();
    setupLocationFilter();
    setupLogout();
    loadJobs();
});

// 🔍 VERIFICAR ESTADO DE SESIÓN (Toggle Header)
async function checkAuthState() {
    const { data: { session } } = await sb.auth.getSession();
    const guestEl = document.getElementById('authGuest');
    const userEl = document.getElementById('authUser');
    const badge = document.getElementById('userBadge');

    if (session) {
        guestEl?.classList.add('hidden');
        userEl?.classList.remove('hidden');
        userEl?.classList.add('flex');
        const userType = session.user.user_metadata?.user_type === 'company' ? 'Empresa' : 'Candidato';
        badge.textContent = `${session.user.user_metadata?.full_name || session.user.email} (${userType})`;
    } else {
        guestEl?.classList.remove('hidden');
        userEl?.classList.add('hidden');
        userEl?.classList.remove('flex');
    }
}

// 🔧 CONFIGURACIÓN DE BÚSQUEDA Y AUTOCOMPLETADO
function setupSearchAutocomplete() {
    const searchInput = document.getElementById('searchKeyword');
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50 hidden';
    searchInput.parentElement?.appendChild(dropdown);

    searchInput?.addEventListener('input', (e) => {
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
        }, 200);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.relative')) dropdown.classList.add('hidden');
    });
}

function selectSuggestion(val, type) {
    const input = document.getElementById('searchKeyword');
    if (input) input.value = val;
    document.querySelector('.search-dropdown')?.classList.add('hidden');
    currentFilter.keyword = val;
    if (type === 'category') currentFilter.category = val;
    loadJobs();
}

// 🏷️ FILTROS POR TAGS DE CATEGORÍA
function setupFilterTags() {
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.filter-tag').forEach(t => {
                t.classList.remove('bg-pincha-orange', 'text-white', 'shadow-md');
                t.classList.add('bg-gray-200', 'text-gray-700');
            });
            this.classList.remove('bg-gray-200', 'text-gray-700');
            this.classList.add('bg-pincha-orange', 'text-white', 'shadow-md');

            currentFilter.category = this.dataset.cat;
            currentFilter.keyword = '';
            const input = document.getElementById('searchKeyword');
            if (input) input.value = '';
            loadJobs();
        });
    });
}

// 🔍 BOTÓN DE BÚSQUEDA PRINCIPAL
function setupSearchButton() {
    document.getElementById('searchBtn')?.addEventListener('click', () => {
        currentFilter.keyword = document.getElementById('searchKeyword')?.value || '';
        currentFilter.category = document.getElementById('searchCategory')?.value || '';
        currentFilter.location = document.getElementById('searchLocation')?.value || '';
        loadJobs();
    });
}

// 📍 FILTRO DE UBICACIÓN
function setupLocationFilter() {
    document.getElementById('searchLocation')?.addEventListener('change', (e) => {
        currentFilter.location = e.target.value;
        loadJobs();
    });
}

// 🚪 LOGOUT
function setupLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await sb.auth.signOut();
        checkAuthState();
        window.location.reload();
    });
}

// 📦 CARGA DE EMPLEOS CON INYECCIÓN DE SCHEMA.ORG JOBPOSTING
async function loadJobs() {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pincha-orange"></div></div>';

    try {
        let query = sb.from('jobs').select('*').eq('is_active', true);

        if (currentFilter.keyword) {
            query = query.or(`title.ilike.%${currentFilter.keyword}%,category.ilike.%${currentFilter.keyword}%`);
        }
        if (currentFilter.location) {
            query = query.ilike('location', `%${currentFilter.location}%`);
        }
        if (currentFilter.category) {
            query = query.ilike('category', `%${currentFilter.category}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(12);
        if (error) throw error;

        if (!data?.length) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border">📭 No se encontraron vacantes con estos filtros.</div>';
            return;
        }

        // Renderizar tarjetas
        grid.innerHTML = data.map(job => `
            <div class="bg-white border border-gray-200 rounded-xl p-5 hover:border-pincha-orange hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 btn-tactile group" onclick="viewJobDetail('${job.id}')">
                <h4 class="text-lg font-bold text-pincha-blue group-hover:text-pincha-orange transition mb-1">${job.title}</h4>
                <p class="text-sm text-gray-500 mb-3">${job.category} • ${job.location || 'La Habana'}</p>
                <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <span class="font-bold text-gray-700">${job.salary || 'A convenir'}</span>
                    <span class="text-xs text-gray-400">${new Date(job.created_at).toLocaleDateString('es-CU')}</span>
                </div>
                <button class="w-full mt-3 py-2 text-sm font-bold text-pincha-orange border border-pincha-orange rounded-lg hover:bg-pincha-orange hover:text-white btn-tactile">Ver detalles</button>
            </div>
        `).join('');

        // ✅ INYECTAR SCHEMA.ORG JOBPOSTING DINÁMICO (SEO para Google for Jobs)
        injectJobPostings(data);

    } catch (err) {
        console.error('Error loading jobs:', err);
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">⚠️ Error de conexión. Verifica tu red e intenta de nuevo.</div>';
    }
}

// 🧠 GENERAR SCHEMA.ORG JOBPOSTING PARA UNA VACANTE
function generateJobPostingSchema(job) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description || `Vacante de ${job.title} en ${job.location || 'La Habana'}, Cuba.`,
        "datePosted": job.created_at,
        "validThrough": new Date(new Date(job.created_at).getTime() + 30*24*60*60*1000).toISOString().split('T')[0],
        "employmentType": job.contract_type || "FULL_TIME",
        "hiringOrganization": {
            "@type": "Organization",
            "name": job.company_name || "Mi Pincha",
            "sameAs": "https://mipincha.github.io"
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": job.location || "La Habana",
                "addressRegion": "La Habana",
                "addressCountry": "CU"
            }
        },
        "identifier": {
            "@type": "PropertyValue",
            "name": "Mi Pincha Job ID",
            "value": job.id
        }
    };

    // Añadir salario si existe y es parseable
    if (job.salary) {
        const match = job.salary.match(/\$(\d+(?:-\d+)?)/);
        if (match) {
            const [_, amount] = match;
            const [min, max] = amount.includes('-') ? amount.split('-').map(Number) : [Number(amount), Number(amount)];
            schema.baseSalary = {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": {
                    "@type": "QuantitativeValue",
                    "minValue": min,
                    "maxValue": max,
                    "unitText": "MONTH"
                }
            };
        }
    }

    return schema;
}

// 🧠 INYECTAR MÚLTIPLES JOBPOSTING EN EL HEAD
function injectJobPostings(jobs) {
    // Remover schemas previos para evitar duplicados
    document.querySelectorAll('script[type="application/ld+json"][data-jobposting]').forEach(el => el.remove());

    jobs.forEach(job => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.jobposting = 'true';
        script.textContent = JSON.stringify(generateJobPostingSchema(job));
        document.head.appendChild(script);
    });
}

// 👁️ VER DETALLE DE VACANTE (Placeholder para futura página de detalle)
function viewJobDetail(jobId) {
    // En producción: window.location.href = `detalle.html?id=${jobId}`;
    alert(`Viendo detalles de la vacante ID: ${jobId}\n\n(Próximamente: página de detalle completa)`);
}