// 🔑 CONFIGURACIÓN SUPABASE
const SUPABASE_URL = 'https://yznkrbhfsrcoskyoyfxs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bmtyYmhmc3Jjb3NreW95ZnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjczNzQsImV4cCI6MjA5NTI0MzM3NH0.TF_iauRfdaICpT7KipXwrphQYyGu4X4v2_FzQOIl1qw';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

//  BASE DE DATOS LOCAL (Mitigación: <8KB, funciona sin red, respuesta <50ms)
const searchData = {
    categories: [
        "Tecnología e Informática", "Salud y Medicina", "Educación y Formación",
        "Administración y Oficina", "Finanzas y Contabilidad", "Legal y Jurídico",
        "Ingeniería y Arquitectura", "Construcción y Oficios", "Transporte y Logística",
        "Ventas y Comercial", "Marketing y Publicidad", "Arte, Cultura y Entretenimiento",
        "Hostelería y Turismo", "Limpieza y Mantenimiento", "Manufactura y Producción",
        "Agricultura, Ganadería y Pesca", "Seguridad y Defensa", "Recursos Humanos",
        "Ciencia e Investigación", "Medios y Comunicación", "Deportes y Fitness",
        "Servicios Domésticos", "Freelance y Economía Digital", "Energía y Medio Ambiente",
        "Blockchain, Cripto y Web3", "Inteligencia Artificial y Automatización"
    ],
    positions: [
        "Desarrollador Frontend", "Desarrollador Backend", "Desarrollador Full Stack",
        "Ingeniero de Software", "Programador Web", "Administrador de Sistemas",
        "Técnico de Soporte IT", "QA Tester", "Analista de Datos",
        "Especialista en IA", "Diseñador UX/UI", "Médico General",
        "Enfermero", "Odontólogo", "Farmacéutico", "Nutricionista",
        "Profesor de Idiomas", "Tutor Académico", "Capacitador Empresarial",
        "Administrativo", "Recepcionista", "Asistente Ejecutivo",
        "Contador", "Auditor", "Analista Financiero", "Cajero",
        "Abogado", "Asistente Legal", "Notario",
        "Ingeniero Civil", "Ingeniero Industrial", "Arquitecto",
        "Electricista", "Plomero", "Carpintero", "Mecánico Industrial",
        "Chofer", "Repartidor", "Operador Logístico",
        "Vendedor", "Ejecutivo Comercial", "Teleoperador",
        "Community Manager", "Diseñador Gráfico", "Copywriter", "Trafficker Digital",
        "Chef", "Cocinero", "Camarero", "Bartender",
        "Recepcionista de Hotel", "Guía Turístico",
        "Personal de Limpieza", "Operario de Producción", "Agricultor",
        "Guardia de Seguridad", "Vigilante",
        "Reclutador", "Especialista Nómina",
        "Entrenador Personal", "Niñera", "Cuidador",
        "Freelancer", "Consultor Independiente",
        "Técnico Solar", "Desarrollador Blockchain", "Prompt Engineer"
    ]
};

let currentFilter = { keyword: '', location: '', category: '' };
let debounceTimer;

// 🚀 INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    setupButtons();
});

// 🔒 AUTH GATE
async function initApp() {
    const { data: { session } } = await supabase.auth.getSession();
    const gate = document.getElementById('authGate');
    const app = document.getElementById('mainApp');
    
    if (!session) {
        gate.classList.remove('hidden');
        app.classList.add('blur-sm', 'pointer-events-none');
        switchAuthTab('login'); 
    } else {
        gate.classList.add('hidden');
        app.classList.remove('blur-sm', 'pointer-events-none');
        const userType = session.user.user_metadata?.user_type === 'company' ? 'Empresa' : 'Candidato';
        const name = session.user.user_metadata?.full_name || session.user.email;
        document.getElementById('userBadge').textContent = `${name} (${userType})`;
        loadJobs();
    }
}

// 🔧 EVENTOS
function setupButtons() {
    document.getElementById('tabLogin').addEventListener('click', () => switchAuthTab('login'));
    document.getElementById('tabRegister').addEventListener('click', () => switchAuthTab('register'));
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('searchBtn').addEventListener('click', () => {
        currentFilter.keyword = document.getElementById('searchInput').value;
        loadJobs();
    });
    document.getElementById('locationFilter').addEventListener('change', (e) => {
        currentFilter.location = e.target.value;
        loadJobs();
    });

    // Autocomplete
    const searchInput = document.getElementById('searchInput');
    const dropdown = document.getElementById('searchDropdown');
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const val = e.target.value.trim().toLowerCase();
        if (val.length < 2) { dropdown.classList.remove('show'); return; }
        
        debounceTimer = setTimeout(() => {
            const posMatches = searchData.positions.filter(p => p.toLowerCase().includes(val)).slice(0, 5);
            const catMatches = searchData.categories.filter(c => c.toLowerCase().includes(val)).slice(0, 3);
            
            let html = '';
            catMatches.forEach(c => html += `<div class="suggestion-item font-semibold px-4 py-2 cursor-pointer hover:bg-orange-50 hover:text-pincha-orange border-b border-gray-100" onclick="selectSuggestion('${c}', 'category')">${c} <span class="text-xs text-gray-400 ml-1">Categoría</span></div>`);
            posMatches.forEach(p => html += `<div class="suggestion-item px-4 py-2 cursor-pointer hover:bg-orange-50 hover:text-pincha-orange border-b border-gray-100" onclick="selectSuggestion('${p}', 'position')">${p}</div>`);
            
            if (!html) html = '<div class="p-3 text-gray-500 text-sm">Sin coincidencias</div>';
            dropdown.innerHTML = html;
            dropdown.classList.add('show');
        }, 200);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.relative')) dropdown.classList.remove('show');
    });

    // Filter Tags
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
            document.getElementById('searchInput').value = '';
            loadJobs();
        });
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.reload();
    });
}

// 🎛️ TAB SWITCHING
function switchAuthTab(tab) {
    const btnLogin = document.getElementById('tabLogin');
    const btnRegister = document.getElementById('tabRegister');
    const formLogin = document.getElementById('loginForm');
    const formRegister = document.getElementById('registerForm');
    document.getElementById('authMsg').classList.add('hidden');

    if (tab === 'login') {
        btnLogin.classList.add('active'); btnLogin.classList.remove('inactive');
        btnRegister.classList.add('inactive'); btnRegister.classList.remove('active');
        formLogin.classList.add('show'); formRegister.classList.remove('show');
    } else {
        btnRegister.classList.add('active'); btnRegister.classList.remove('inactive');
        btnLogin.classList.add('inactive'); btnLogin.classList.remove('active');
        formRegister.classList.add('show'); formLogin.classList.remove('show');
    }
}

// 🔐 LOGIN
async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true; btn.textContent = 'Entrando...';

    const { error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPass').value
    });

    if (error) showAuthMsg(error.message, 'error');
    else window.location.reload();

    btn.disabled = false; btn.textContent = 'Entrar';
}

// 📝 REGISTER
async function handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true; btn.textContent = 'Registrando...';

    const { error } = await supabase.auth.signUp({
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPass').value,
        options: { data: { full_name: document.getElementById('regName').value, user_type: document.getElementById('regType').value } }
    });

    if (error) showAuthMsg(error.message, 'error');
    else showAuthMsg('✅ Registro exitoso. Revisa tu correo.', 'success');

    btn.disabled = false; btn.textContent = 'Registrarme';
}

function showAuthMsg(msg, type) {
    const el = document.getElementById('authMsg');
    el.textContent = msg;
    el.className = `mt-4 text-center text-sm font-bold ${type === 'error' ? 'text-red-500' : 'text-green-500'}`;
    el.classList.remove('hidden');
}

function selectSuggestion(val, type) {
    document.getElementById('searchInput').value = val;
    document.getElementById('searchDropdown').classList.remove('show');
    currentFilter.keyword = val;
    if (type === 'category') currentFilter.category = val;
    loadJobs();
}

// 📦 LOAD JOBS
async function loadJobs() {
    const grid = document.getElementById('jobsGrid');
    grid.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pincha-orange"></div></div>';
    
    try {
        let query = supabase.from('jobs').select('*').eq('is_active', true);
        if (currentFilter.keyword) query = query.or(`title.ilike.%${currentFilter.keyword}%,category.ilike.%${currentFilter.keyword}%`);
        if (currentFilter.location) query = query.ilike('location', `%${currentFilter.location}%`);
        if (currentFilter.category) query = query.ilike('category', `%${currentFilter.category}%`);
        
        const { data, error } = await query.order('created_at', { ascending: false }).limit(12);
        if (error) throw error;
        
        if (!data.length) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border">📭 No se encontraron vacantes.</div>';
            return;
        }
        
        grid.innerHTML = data.map(job => `
            <div class="bg-white border border-gray-200 rounded-xl p-5 hover:border-pincha-orange hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 btn-tactile group">
                <h4 class="text-lg font-bold text-pincha-blue group-hover:text-pincha-orange transition mb-1">${job.title}</h4>
                <p class="text-sm text-gray-500 mb-3">${job.category} • ${job.location || 'La Habana'}</p>
                <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <span class="font-bold text-gray-700">${job.salary || 'A convenir'}</span>
                    <span class="text-xs text-gray-400">${new Date(job.created_at).toLocaleDateString('es-CU')}</span>
                </div>
                <button class="w-full mt-3 py-2 text-sm font-bold text-pincha-orange border border-pincha-orange rounded-lg hover:bg-pincha-orange hover:text-white btn-tactile">
                    Ver detalles
                </button>
            </div>
        `).join('');
        
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">⚠️ Error de conexión.</div>';
    }
}