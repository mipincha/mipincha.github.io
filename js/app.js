// 🔑 CONFIGURACIÓN SUPABASE
const SUPABASE_URL = 'https://yznkrbhfsrcoskyoyfxs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bmtyYmhmc3Jjb3NreW95ZnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjczNzQsImV4cCI6MjA5NTI0MzM3NH0.TF_iauRfdaICpT7KipXwrphQYyGu4X4v2_FzQOIl1qw';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 💾 DATOS PARA AUTOCOMPLETADO Y FILTROS
const searchData = {
    categories: [
        "Tecnología e Informática", "Salud y Medicina", "Educación y Formación", "Administración y Oficina",
        "Finanzas y Contabilidad", "Legal y Jurídico", "Ingeniería y Arquitectura", "Construcción y Oficios",
        "Transporte y Logística", "Ventas y Comercial", "Marketing y Publicidad", "Arte, Cultura y Entretenimiento",
        "Hostelería y Turismo", "Limpieza y Mantenimiento", "Manufactura y Producción", "Agricultura, Ganadería y Pesca",
        "Seguridad y Defensa", "Recursos Humanos", "Ciencia e Investigación", "Medios y Comunicación",
        "Deportes y Fitness", "Servicios Domésticos", "Freelance y Economía Digital", "Energía y Medio Ambiente",
        "Blockchain, Cripto y Web3", "Inteligencia Artificial y Automatización"
    ],
    positions: {
        "Tecnología e Informática": ["Desarrollador Frontend", "Desarrollador Backend", "Desarrollador Full Stack", "Ingeniero de Software", "Programador Web", "Administrador de Sistemas", "Técnico de Soporte IT", "QA Tester", "Analista de Datos", "Especialista en IA", "Diseñador UX/UI"],
        "Salud y Medicina": ["Médico General", "Enfermero", "Odontólogo", "Farmacéutico", "Nutricionista", "Técnico de Laboratorio", "Psicólogo Clínico"],
        "Educación y Formación": ["Profesor de Idiomas", "Tutor Académico", "Capacitador Empresarial", "Coordinador Académico"],
        "Administración y Oficina": ["Administrativo", "Recepcionista", "Asistente Ejecutivo", "Secretario"],
        "Finanzas y Contabilidad": ["Contador", "Auditor", "Analista Financiero", "Cajero"],
        "Legal y Jurídico": ["Abogado", "Asistente Legal", "Notario"],
        "Ingeniería y Arquitectura": ["Ingeniero Civil", "Ingeniero Industrial", "Arquitecto"],
        "Construcción y Oficios": ["Electricista", "Plomero", "Carpintero", "Mecánico Industrial"],
        "Transporte y Logística": ["Chofer", "Repartidor", "Operador Logístico"],
        "Ventas y Comercial": ["Vendedor", "Ejecutivo Comercial", "Teleoperador"],
        "Marketing y Publicidad": ["Community Manager", "Diseñador Gráfico", "Copywriter", "Trafficker Digital"],
        "Hostelería y Turismo": ["Chef", "Cocinero", "Camarero", "Bartender", "Recepcionista de Hotel", "Guía Turístico"],
        "Limpieza y Mantenimiento": ["Personal de Limpieza", "Operario de Mantenimiento"],
        "Manufactura y Producción": ["Operario de Producción", "Supervisor de Planta"],
        "Agricultura, Ganadería y Pesca": ["Agricultor", "Técnico Agrícola"],
        "Seguridad y Defensa": ["Guardia de Seguridad", "Vigilante"],
        "Recursos Humanos": ["Reclutador", "Especialista en Nómina"],
        "Ciencia e Investigación": ["Investigador", "Técnico de Laboratorio"],
        "Medios y Comunicación": ["Periodista", "Editor", "Locutor"],
        "Deportes y Fitness": ["Entrenador Personal", "Instructor Deportivo"],
        "Servicios Domésticos": ["Niñera", "Cuidador", "Personal Doméstico"],
        "Freelance y Economía Digital": ["Freelancer", "Consultor Independiente"],
        "Energía y Medio Ambiente": ["Técnico Solar", "Gestor Ambiental"],
        "Blockchain, Cripto y Web3": ["Desarrollador Blockchain", "Analista Cripto"],
        "Inteligencia Artificial y Automatización": ["Prompt Engineer", "Especialista en Automatización"]
    }
};

let currentFilter = { keyword: '', position: '', category: '', location: '' };
let debounceTimer;

// 🚀 INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthState();
    setupHamburger();
    setupSearch();
    setupPublishModal();
    setupSettingsModal();
    setupThemeToggle();
    loadJobs();
    setupModal();
    populatePositionsByCategory();
});

// 🌓 MODO OSCURO
function setupThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const darkToggle = document.getElementById('darkModeToggle');
    const isDark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) document.documentElement.classList.add('dark');
    if (darkToggle) {
        const span = darkToggle.querySelector('span');
        if (isDark) { span.classList.remove('translate-x-1'); span.classList.add('translate-x-6'); }
    }
    
    const setTheme = (dark) => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        if (darkToggle) {
            const span = darkToggle.querySelector('span');
            span.classList.toggle('translate-x-1', !dark);
            span.classList.toggle('translate-x-6', dark);
        }
    };
    
    toggle?.addEventListener('click', () => setTheme(!document.documentElement.classList.contains('dark')));
    darkToggle?.addEventListener('click', () => setTheme(!document.documentElement.classList.contains('dark')));
}

// 🔍 ESTADO DE AUTENTICACIÓN
async function checkAuthState() {
    const { data: { session } } = await sb.auth.getSession();
    const isAuth = !!session;
    
    document.getElementById('navGuest')?.classList.toggle('hidden', isAuth);
    document.getElementById('navUser')?.classList.toggle('hidden', !isAuth);
    document.getElementById('navUser')?.classList.toggle('flex', isAuth);
    document.getElementById('menuGuest')?.classList.toggle('hidden', isAuth);
    document.getElementById('menuUser')?.classList.toggle('hidden', !isAuth);
    
    if (isAuth) {
        const name = session.user.user_metadata?.full_name || session.user.email;
        const badge = document.getElementById('userBadge');
        if (badge) badge.textContent = name;
    }
}

// 🍔 MENÚ HAMBURGUESA
function setupHamburger() {
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    btn?.addEventListener('click', () => menu?.classList.toggle('open'));
    
    document.getElementById('logoutBtn')?.addEventListener('click', async () => { 
        await sb.auth.signOut(); window.location.reload(); 
    });
    document.getElementById('mobileLogoutBtn')?.addEventListener('click', async () => { 
        await sb.auth.signOut(); window.location.reload(); 
    });
}

// 🔍 BUSCADOR INTELIGENTE
function setupSearch() {
    const keywordInput = document.getElementById('searchKeyword');
    const autocompleteList = document.getElementById('autocompleteList');
    
    keywordInput?.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const val = e.target.value.trim().toLowerCase();
        if (val.length < 2) { autocompleteList?.classList.add('hidden'); return; }
        
        debounceTimer = setTimeout(() => {
            const allTerms = [...searchData.categories, ...Object.values(searchData.positions).flat()];
            const matches = allTerms.filter(t => t.toLowerCase().includes(val)).slice(0, 8);
            
            if (!matches.length) { autocompleteList?.classList.add('hidden'); return; }
            
            autocompleteList.innerHTML = matches.map(m => 
                `<div class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm dark:text-white" onclick="selectAutocomplete('${m}')">${m}</div>`
            ).join('');
            autocompleteList.classList.remove('hidden');
        }, 200);
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#searchKeyword') && !e.target.closest('#autocompleteList')) {
            autocompleteList?.classList.add('hidden');
        }
    });
    
    document.getElementById('searchCategory')?.addEventListener('change', populatePositionsByCategory);
    document.getElementById('searchBtn')?.addEventListener('click', loadJobs);
    ['searchKeyword', 'searchPosition', 'searchCategory', 'searchLocation'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', debounceSearch);
    });
}

function selectAutocomplete(term) {
    document.getElementById('searchKeyword').value = term;
    document.getElementById('autocompleteList').classList.add('hidden');
    loadJobs();
}

function populatePositionsByCategory() {
    const category = document.getElementById('searchCategory')?.value;
    const positionSelect = document.getElementById('searchPosition');
    if (!positionSelect) return;
    
    positionSelect.innerHTML = '<option value="">💼 Todos los puestos</option>';
    if (category && searchData.positions[category]) {
        searchData.positions[category].forEach(p => {
            positionSelect.innerHTML += `<option value="${p}">${p}</option>`;
        });
    }
}

function debounceSearch() { 
    clearTimeout(debounceTimer); 
    debounceTimer = setTimeout(loadJobs, 400); 
}

// 📦 CARGA DE VACANTES
async function loadJobs() {
    const grid = document.getElementById('jobsGrid');
    grid.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pincha-orange"></div></div>';
    
    currentFilter.keyword = document.getElementById('searchKeyword')?.value || '';
    currentFilter.position = document.getElementById('searchPosition')?.value || '';
    currentFilter.category = document.getElementById('searchCategory')?.value || '';
    currentFilter.location = document.getElementById('searchLocation')?.value || '';

    try {
        let query = sb.from('jobs').select('*').eq('is_active', true);
        const filters = [];
        
        if (currentFilter.keyword) filters.push(`title.ilike.%${currentFilter.keyword}%`, `description.ilike.%${currentFilter.keyword}%`, `company_name.ilike.%${currentFilter.keyword}%`);
        if (currentFilter.position) filters.push(`title.ilike.%${currentFilter.position}%`);
        if (currentFilter.category) filters.push(`category.ilike.%${currentFilter.category}%`);
        if (currentFilter.location) filters.push(`location.ilike.%${currentFilter.location}%`);
        
        if (filters.length) query = query.or(filters.join(','));
        
        const { data, error } = await query.order('created_at', { ascending: false }).limit(24);
        if (error) throw error;

        if (!data?.length) { 
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-card rounded-xl border">📭 No se encontraron vacantes con estos filtros.</div>'; 
            return; 
        }

        grid.innerHTML = data.map(job => `
            <div class="bg-white dark:bg-dark-card border dark:border-gray-700 rounded-xl p-5 hover:border-pincha-orange hover:shadow-lg transition-all duration-200 group cursor-pointer" onclick="openJobDetail('${job.id}')">
                <h4 class="text-lg font-bold text-pincha-blue dark:text-white group-hover:text-pincha-orange transition mb-1">${job.title}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">${job.category} • ${job.location || 'La Habana'}</p>
                <div class="flex justify-between items-center mt-3 pt-3 border-t dark:border-gray-700">
                    <span class="font-bold text-gray-700 dark:text-gray-300">${job.salary || 'A convenir'}</span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">${new Date(job.created_at).toLocaleDateString('es-CU')}</span>
                </div>
                <button class="w-full mt-3 py-2 text-sm font-bold text-pincha-orange border border-pincha-orange rounded-lg hover:bg-pincha-orange hover:text-white btn-tactile">Ver detalles →</button>
            </div>
        `).join('');
    } catch (err) { 
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">⚠️ Error de conexión. Verifica tu red.</div>'; 
    }
}

// 📖 MODAL DETALLES Y FIX DE CLAVE FORÁNEA (FK)
function setupModal() {
    document.getElementById('jobModal')?.addEventListener('click', (e) => { 
        if (e.target.id === 'jobModal') closeJobModal(); 
    });
}

function closeJobModal() { 
    document.getElementById('jobModal')?.classList.add('hidden'); 
}

async function openJobDetail(jobId) {
    const modal = document.getElementById('jobModal');
    modal?.classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Cargando...';
    
    try {
        const { data: job } = await sb.from('jobs').select('*').eq('id', jobId).single();
        if (!job) throw new Error('Vacante no encontrada');

        document.getElementById('modalTitle').textContent = job.title;
        document.getElementById('modalCompany').textContent = `🏢 ${job.company_name || 'Empresa'}`;
        document.getElementById('modalLocation').textContent = job.location || 'No especificada';
        document.getElementById('modalCategory').textContent = job.category || 'General';
        document.getElementById('modalSalary').textContent = job.salary || 'A convenir';
        document.getElementById('modalDate').textContent = new Date(job.created_at).toLocaleDateString('es-CU');
        document.getElementById('modalDesc').textContent = job.description || 'Sin descripción disponible.';
        
        const applyBtn = document.getElementById('modalApplyBtn');
        const { data: { session } } = await sb.auth.getSession();
        
        if (!session) {
            applyBtn.textContent = 'Inicia sesión para postular';
            applyBtn.onclick = () => window.location.href = 'login.html';
        } else if (session.user.user_metadata?.user_type === 'company') {
            applyBtn.textContent = 'Solo candidatos pueden postularse';
            applyBtn.disabled = true; 
            applyBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            applyBtn.textContent = 'Postularme a esta vacante';
            applyBtn.disabled = false; 
            applyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            
            applyBtn.onclick = async () => {
                applyBtn.textContent = 'Verificando perfil...';
                applyBtn.disabled = true;
                
                try {
                    // 1. Garantizar que existe el perfil base
                    await sb.from('profiles').upsert({ id: session.user.id }, { onConflict: 'id' });

                    const { data: candidate, error: candError } = await sb
                        .from('candidates')
                        .select('profile_id')
                        .eq('profile_id', session.user.id)
                        .maybeSingle();
                    
                    if (candError) throw candError;
                    
                    if (!candidate) {
                        const { error: createError } = await sb
                            .from('candidates')
                            .insert({ 
                                profile_id: session.user.id,
                                is_active: true 
                            });
                        if (createError) throw createError;
                    }
                    
                    applyBtn.textContent = 'Enviando postulación...';
                    const { error: appError } = await sb
                        .from('applications')
                        .insert({ 
                            job_id: job.id, 
                            candidate_id: session.user.id 
                        });
                    
                    if (appError) {
                        if (appError.code === '23505') {
                            alert('✅ Ya te postulaste a esta vacante anteriormente.');
                        } else {
                            throw appError;
                        }
                    } else {
                        alert('✅ ¡Postulación enviada con éxito!');
                        applyBtn.textContent = '✅ Postulado';
                        applyBtn.disabled = true;
                    }
                } catch (err) {
                    alert('Error: ' + err.message);
                    applyBtn.textContent = 'Postularme a esta vacante';
                    applyBtn.disabled = false;
                }
            };
        }
    } catch (e) { 
        document.getElementById('modalTitle').textContent = 'Error'; 
        document.getElementById('modalDesc').textContent = e.message; 
    }
}

// 📢 MODAL PUBLICAR DUAL (CON FIX DE FK EN PROFILES)
function setupPublishModal() {
    const pubCandidate = document.getElementById('pubCandidate');
    const pubCompany = document.getElementById('pubCompany');
    const candidateForm = document.getElementById('pubCandidateForm');
    const companyForm = document.getElementById('pubCompanyForm');
    
    pubCandidate?.addEventListener('click', () => {
        pubCandidate.className = 'pub-tab active flex-1 py-2 rounded-md font-bold text-sm bg-white text-pincha-orange shadow-sm';
        pubCompany.className = 'pub-tab inactive flex-1 py-2 rounded-md font-bold text-sm text-gray-500 hover:text-gray-700';
        candidateForm.classList.remove('hidden'); companyForm.classList.add('hidden');
    });
    
    pubCompany?.addEventListener('click', () => {
        pubCompany.className = 'pub-tab active flex-1 py-2 rounded-md font-bold text-sm bg-white text-pincha-orange shadow-sm';
        pubCandidate.className = 'pub-tab inactive flex-1 py-2 rounded-md font-bold text-sm text-gray-500 hover:text-gray-700';
        companyForm.classList.remove('hidden'); candidateForm.classList.add('hidden');
    });
    
    // Submit Candidato
    document.getElementById('pubCandidateForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return alert('Debes iniciar sesión para publicar');
        
        const msg = document.getElementById('pubMsg');
        msg.textContent = '⏳ Preparando perfil...'; msg.className = 'mt-4 text-center text-sm font-bold text-blue-600 block';
        
        try {
            // ✅ FIX CRÍTICO: Garantizar que la fila en 'profiles' existe antes de insertar en 'candidates'
            const { error: profileError } = await sb.from('profiles').upsert({
                id: session.user.id,
                location: document.getElementById('pubLocation').value
            }, { onConflict: 'id' });
            
            if (profileError) throw profileError;

            // Ahora sí, upsert en candidates es seguro
            const { error } = await sb.from('candidates').upsert({
                profile_id: session.user.id,
                desired_position: document.getElementById('pubPosition').value,
                category: document.getElementById('pubCategory').value,
                location: document.getElementById('pubLocation').value,
                experience: document.getElementById('pubExperience').value,
                salary_expected: document.getElementById('pubSalary').value,
                is_active: true
            }, { onConflict: 'profile_id' });
            
            if (error) throw error;
            msg.textContent = '✅ Perfil actualizado. Las empresas te encontrarán.'; 
            msg.className = 'mt-4 text-center text-sm font-bold text-green-600 block';
            setTimeout(closePublishModal, 2000);
        } catch (err) { 
            msg.textContent = '❌ ' + err.message; 
            msg.className = 'mt-4 text-center text-sm font-bold text-red-600 block'; 
        }
    });
    
    // Submit Empresa
    document.getElementById('pubCompanyForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return alert('Debes iniciar sesión para publicar');
        
        const msg = document.getElementById('pubMsg');
        msg.textContent = '⏳ Preparando perfil de empresa...'; 
        msg.className = 'mt-4 text-center text-sm font-bold text-blue-600 block';
        
        try {
            // ✅ FIX CRÍTICO: Garantizar que la fila en 'profiles' existe antes de insertar en 'companies'
            const { error: profileError } = await sb.from('profiles').upsert({
                id: session.user.id
            }, { onConflict: 'id' });
            
            if (profileError) throw profileError;

            const { data: company, error: compCheckError } = await sb
                .from('companies')
                .select('profile_id')
                .eq('profile_id', session.user.id)
                .maybeSingle();
            
            if (compCheckError) throw compCheckError;
            
            if (!company) {
                const { error: createCompError } = await sb
                    .from('companies')
                    .insert({ 
                        profile_id: session.user.id,
                        industry: 'General',
                        is_verified: false 
                    });
                if (createCompError) throw createCompError;
            }
            
            msg.textContent = '⏳ Publicando vacante...';
            const { error: jobError } = await sb.from('jobs').insert({
                title: document.getElementById('jobTitle').value,
                category: document.getElementById('jobCategory').value,
                location: document.getElementById('jobLocation').value,
                salary: document.getElementById('jobSalary').value,
                description: document.getElementById('jobDesc').value,
                company_name: session.user.user_metadata?.full_name || 'Empresa',
                company_id: session.user.id,
                is_active: true
            });
            
            if (jobError) throw jobError;
            
            msg.textContent = '✅ Vacante publicada exitosamente.'; 
            msg.className = 'mt-4 text-center text-sm font-bold text-green-600 block';
            setTimeout(() => { closePublishModal(); loadJobs(); }, 2000);
            
        } catch (err) { 
            msg.textContent = '❌ ' + err.message; 
            msg.className = 'mt-4 text-center text-sm font-bold text-red-600 block'; 
        }
    });
}

function openPublishModal() { 
    document.getElementById('publishModal')?.classList.remove('hidden'); 
}
function closePublishModal() { 
    document.getElementById('publishModal')?.classList.add('hidden'); 
    document.getElementById('pubMsg')?.classList.add('hidden'); 
}

// ⚙️ MODAL CONFIGURACIÓN
function setupSettingsModal() {
    // El toggle de modo oscuro ya está vinculado en setupThemeToggle
}

function openSettingsModal() { 
    document.getElementById('settingsModal')?.classList.remove('hidden'); 
}
function closeSettingsModal() { 
    document.getElementById('settingsModal')?.classList.add('hidden'); 
}

// 🌍 EXPOSICIÓN GLOBAL PARA HTML ONCLICK
window.openJobDetail = openJobDetail;
window.closeJobModal = closeJobModal;
window.openPublishModal = openPublishModal;
window.closePublishModal = closePublishModal;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.selectAutocomplete = selectAutocomplete;