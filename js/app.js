// 🔑 CONFIGURACIÓN SUPABASE
const SUPABASE_URL = 'https://yznkrbhfsrcoskyoyfxs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bmtyYmhmc3Jjb3NreW95ZnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjczNzQsImV4cCI6MjA5NTI0MzM3NH0.TF_iauRfdaICpT7KipXwrphQYyGu4X4v2_FzQOIl1qw';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const searchData = {
    categories: ["Tecnología e Informática", "Salud y Medicina", "Educación y Formación", "Administración y Oficina", "Finanzas y Contabilidad", "Legal y Jurídico", "Ingeniería y Arquitectura", "Construcción y Oficios", "Transporte y Logística", "Ventas y Comercial", "Marketing y Publicidad", "Arte, Cultura y Entretenimiento", "Hostelería y Turismo", "Limpieza y Mantenimiento", "Manufactura y Producción", "Agricultura, Ganadería y Pesca", "Seguridad y Defensa", "Recursos Humanos", "Ciencia e Investigación", "Medios y Comunicación", "Deportes y Fitness", "Servicios Domésticos", "Freelance y Economía Digital", "Energía y Medio Ambiente", "Blockchain, Cripto y Web3", "Inteligencia Artificial y Automatización"],
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

const municipalities = ["Playa", "Plaza de la Revolución", "Centro Habana", "Habana Vieja", "Regla", "Habana del Este", "Guanabacoa", "San Miguel del Padrón", "10 de Octubre", "Cerro", "Marianao", "La Lisa", "Arroyo Naranjo", "Boyeros", "Cotorro"];

let userType = null, userId = null, userMeta = null, unreadCount = 0;

document.addEventListener('DOMContentLoaded', async () => {
    await initDashboard();
});

async function initDashboard() {
    const { data: { session } } = await sb.auth.getSession();
    if(!session) { window.location.href = 'login.html'; return; }
    
    userType = session.user.user_metadata?.user_type || 'candidate';
    userId = session.user.id;
    userMeta = session.user.user_metadata;
    
    const userName = userMeta?.full_name || session.user.email;
    document.getElementById('headerUserName').textContent = userName;
    document.getElementById('mobileUserName').textContent = userName;
    
    // Ajustes de marca según el rol
    document.getElementById('headerBrand').textContent = userType === 'company' ? 'Panel de Empresa' : 'Mi Pincha';
    
    document.getElementById('authGuard').classList.add('hidden'); 
    document.getElementById('dashboardContainer').classList.remove('hidden');
    
    setupHamburger();
    setupThemeToggle();
    setupRoleSpecificUI();
    
    await loadStats(); 
    checkUnreadNotifications();
    
    // Cargar la primera pestaña por defecto según el rol
    const defaultTab = userType === 'company' ? 'tab-resumen' : 'tab-home';
    switchTab(defaultTab);
    
    // Notificaciones en tiempo real
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        await Notification.requestPermission();
    }
    setupRealtimeNotifications(userName);
}

function setupRoleSpecificUI() {
    const mobileNav = document.getElementById('mobileNavLinks');
    const tabsContainer = document.getElementById('tabsContainer');
    const settingsTitle = document.getElementById('settingsTitle');
    const profileSectionTitle = document.getElementById('profileSectionTitle');
    const editProfileBtnText = document.getElementById('editProfileBtnText');

    if (userType === 'company') {
        settingsTitle.textContent = '⚙️ Configuración de la Empresa';
        profileSectionTitle.textContent = 'Datos de la Empresa';
        editProfileBtnText.textContent = '🏢 Editar datos de la empresa';
        
        mobileNav.innerHTML = `
            <button onclick="switchTab('tab-resumen')" class="block py-2 text-gray-700 dark:text-gray-200 font-medium">📊 Resumen</button>
            <button onclick="switchTab('tab-vacantes')" class="block py-2 text-gray-700 dark:text-gray-200 font-medium">📋 Mis Vacantes</button>
            <button onclick="switchTab('tab-talento')" class="block py-2 text-gray-700 dark:text-gray-200 font-medium">👥 Banco de Talento</button>
        `;
        tabsContainer.innerHTML = `
            <button data-tab="tab-resumen" class="tab-active px-4 py-2 text-sm whitespace-nowrap">Resumen</button>
            <button data-tab="tab-vacantes" class="tab-inactive px-4 py-2 text-sm whitespace-nowrap">Mis Vacantes</button>
            <button data-tab="tab-talento" class="tab-inactive px-4 py-2 text-sm whitespace-nowrap">Banco de Talento</button>
            <button data-tab="tab-archivos" class="tab-inactive px-4 py-2 text-sm whitespace-nowrap">Archivos</button>
        `;
    } else {
        settingsTitle.textContent = '⚙️ Ajustes de mi cuenta';
        profileSectionTitle.textContent = 'Mi Perfil Profesional';
        editProfileBtnText.textContent = '✏️ Editar mi perfil';
        
        mobileNav.innerHTML = `
            <button onclick="switchTab('tab-home')" class="block py-2 text-gray-700 dark:text-gray-200 font-medium">🏠 Inicio</button>
            <button onclick="switchTab('tab-postulaciones')" class="block py-2 text-gray-700 dark:text-gray-200 font-medium">📩 Mis Postulaciones</button>
            <button onclick="switchTab('tab-matches')" class="block py-2 text-gray-700 dark:text-gray-200 font-medium">🔥 Matches</button>
        `;
        tabsContainer.innerHTML = `
            <button data-tab="tab-home" class="tab-active px-4 py-2 text-sm whitespace-nowrap">Inicio</button>
            <button data-tab="tab-postulaciones" class="tab-inactive px-4 py-2 text-sm whitespace-nowrap">Mis Postulaciones</button>
            <button data-tab="tab-matches" class="tab-inactive px-4 py-2 text-sm whitespace-nowrap flex items-center gap-1">Matches <span id="tabMatchBadge" class="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full hidden">0</span></button>
            <button data-tab="tab-archivos" class="tab-inactive px-4 py-2 text-sm whitespace-nowrap">Archivos</button>
        `;
    }

    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', e => switchTab(e.currentTarget.dataset.tab));
    });
}

function setupThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const isDark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    const setTheme = (dark) => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    };
    toggle?.addEventListener('click', () => setTheme(!document.documentElement.classList.contains('dark')));
}

function setupHamburger() {
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    btn?.addEventListener('click', () => menu?.classList.toggle('open'));
    document.getElementById('logoutBtn').onclick = document.getElementById('mobileLogoutBtn').onclick = async () => { await sb.auth.signOut(); window.location.href = 'index.html'; };
}

async function loadStats() {
    const container = document.getElementById('statsContainer');
    container.innerHTML = '<div class="col-span-full skeleton h-20 rounded-xl"></div>'.repeat(4);
    try {
        let stats = [];
        if(userType === 'company') {
            const { count: jobs } = await sb.from('jobs').select('*', { count: 'exact', head: true }).eq('company_id', userId).eq('is_active', true);
            const { count: apps } = await sb.from('applications').select('*', { count: 'exact', head: true }).eq('job_id', 'in', `(select id from jobs where company_id='${userId}')`);
            const { count: pending } = await sb.from('applications').select('*', { count: 'exact', head: true }).eq('job_id', 'in', `(select id from jobs where company_id='${userId}')`).eq('status', 'Nuevo');
            stats = [
                {l:'Vacantes activas', v:jobs||0, i:'📋'},
                {l:'Total de postulantes', v:apps||0, i:'👥'},
                {l:'Candidatos por revisar', v:pending||0, i:'⏳'},
                {l:'Archivos', v:0, i:'📁'}
            ];
        } else {
            const { count: apps } = await sb.from('applications').select('*', { count: 'exact', head: true }).eq('candidate_id', userId);
            const { count: notifs } = await sb.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId);
            stats = [
                {l:'Postulaciones enviadas', v:apps||0, i:'📩'},
                {l:'Matches nuevos', v:notifs||0, i:'🔥'},
                {l:'Archivos', v:0, i:'📁'},
                {l:'Entrevistas', v:0, i:'📅'}
            ];
        }
        container.innerHTML = stats.map(s => `<div class="bg-white dark:bg-dark-card p-4 rounded-xl border dark:border-gray-700 shadow-sm flex items-center gap-3"><div class="text-2xl">${s.i}</div><div><p class="text-2xl font-bold text-pincha-blue dark:text-white">${s.v}</p><p class="text-xs text-gray-500 dark:text-gray-400">${s.l}</p></div></div>`).join('');
    } catch(e) { container.innerHTML = '<div class="col-span-full text-center text-red-500 py-4">Error KPIs</div>'; }
}

async function checkUnreadNotifications() {
    const { count } = await sb.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false);
    unreadCount = count || 0;
    document.getElementById('notifDot').classList.toggle('hidden', unreadCount === 0);
    const badge = document.getElementById('tabMatchBadge');
    if(badge) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.toggle('hidden', unreadCount === 0);
    }
}

function switchTab(tabId) { 
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.replace('tab-active','tab-inactive')); 
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.replace('tab-inactive','tab-active'); 
    loadTabContent(tabId); 
}

async function loadTabContent(tab) {
    const c = document.getElementById('tabContent'); 
    c.innerHTML = '<div class="text-center py-8"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pincha-orange"></div></div>';
    
    if (userType === 'company') {
        if(tab === 'tab-resumen') {
            c.innerHTML = `<div class="text-center py-8"><h3 class="text-xl font-bold dark:text-white">Bienvenido al Panel de Empresa</h3><p class="text-gray-500 dark:text-gray-400 mb-6">Gestiona tus vacantes y encuentra el mejor talento en La Habana.</p><button onclick="window.location.href='index.html'" class="bg-pincha-orange text-white font-bold px-6 py-3 rounded-lg hover:bg-orange-600 btn-tactile shadow-md">➕ Publicar nueva vacante</button></div>`;
        } else if(tab === 'tab-vacantes') {
            const { data: jobs } = await sb.from('jobs').select('*').eq('company_id', userId).order('created_at',{ascending:false});
            c.innerHTML = `<div class="space-y-2">${jobs?.length ? jobs.map(j => `<div class="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center"><div><h4 class="font-bold dark:text-white">${j.title}</h4><p class="text-xs text-gray-500 dark:text-gray-400">${j.location} • ${j.salary||'A convenir'}</p></div><span class="text-xs ${j.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} px-2 py-1 rounded">${j.is_active ? 'Activa' : 'Pausada'}</span></div>`).join('') : '<p class="text-center text-gray-500 dark:text-gray-400">Sin vacantes publicadas.</p>'}</div>`;
        } else if(tab === 'tab-talento') {
            const { data: candidates } = await sb.from('candidates').select('profile_id, desired_position, category, experience_level, skills, avatar_url, doc_url, doc_name, profiles(full_name)').eq('is_active', true).eq('is_paused', false).limit(20);
            c.innerHTML = `<h3 class="text-lg font-bold dark:text-white mb-4">Banco de Talento</h3><div class="space-y-3">${candidates?.length ? candidates.map(cand => {
                const avatarSrc = cand.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.profiles?.full_name || 'Candidato')}&background=FF6B35&color=fff&size=128`;
                const skills = cand.skills ? cand.skills.slice(0, 3).map(s => `<span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">${s}</span>`).join('') : '';
                return `
                <div class="bg-white dark:bg-dark-card p-4 rounded-lg border dark:border-gray-700 flex items-start gap-3">
                    <img src="${avatarSrc}" class="w-12 h-12 rounded-full object-cover border-2 border-pincha-orange flex-shrink-0">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold dark:text-white truncate">${cand.desired_position || 'Profesional'}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300 truncate">${cand.profiles?.full_name || 'Candidato'}</p>
                        <div class="flex gap-1 mt-1 flex-wrap">${skills}</div>
                    </div>
                    <div class="flex flex-col gap-2 flex-shrink-0">
                        ${cand.doc_url ? `<a href="${cand.doc_url}" target="_blank" class="text-xs bg-pincha-blue text-white px-3 py-1.5 rounded hover:bg-blue-800 transition text-center">📄 Ver CV</a>` : ''}
                        <button onclick="alert('Funcionalidad de contacto directo en desarrollo')" class="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition text-center">💬 Contactar</button>
                    </div>
                </div>`;
            }).join('') : '<p class="text-center text-gray-500 dark:text-gray-400">No hay candidatos disponibles en este momento.</p>'}</div>`;
        } else if(tab === 'tab-archivos') {
            renderArchivosTab(c);
        }
    } else {
        // VISTA DEL CANDIDATO
        if(tab === 'tab-home') {
            c.innerHTML = `<div class="text-center py-8"><h3 class="text-xl font-bold dark:text-white">Encuentra tu próxima oportunidad</h3><p class="text-gray-500 dark:text-gray-400 mb-6">Completa tu perfil para mejorar tus coincidencias.</p><button onclick="window.location.href='index.html'" class="bg-pincha-orange text-white font-bold px-6 py-3 rounded-lg hover:bg-orange-600 btn-tactile shadow-md">🔍 Explorar vacantes que coinciden conmigo</button></div>`;
        } else if(tab === 'tab-postulaciones') {
            const { data: apps } = await sb.from('applications').select('*, jobs(title, location, company_name)').eq('candidate_id', userId).order('created_at',{ascending:false});
            const statusColors = { 'Nuevo': 'bg-blue-100 text-blue-700', 'Revisando CV': 'bg-yellow-100 text-yellow-700', 'Contactado': 'bg-orange-100 text-orange-700', 'Entrevista': 'bg-purple-100 text-purple-700', 'Descartado': 'bg-gray-100 text-gray-700' };
            c.innerHTML = `<div class="space-y-2">${apps?.length ? apps.map(a => `<div class="p-4 border dark:border-gray-700 rounded-lg"><div class="flex justify-between items-start"><h4 class="font-bold dark:text-white">${a.jobs?.title||'Vacante'}</h4><span class="text-xs px-2 py-1 rounded ${statusColors[a.status] || 'bg-gray-100 text-gray-700'}">${a.status || 'Nuevo'}</span></div><p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${a.jobs?.location||''} • ${a.jobs?.company_name||''}</p></div>`).join('') : '<p class="text-center text-gray-500 dark:text-gray-400">Aún no te has postulado. ¡Explora vacantes!</p>'}</div>`;
        } else if(tab === 'tab-matches') {
            await loadMatchesTab(c);
            return;
        } else if(tab === 'tab-archivos') {
            renderArchivosTab(c);
        }
    }
}

function renderArchivosTab(c) {
    const table = userType === 'candidate' ? 'candidates' : 'companies';
    const isCand = userType === 'candidate';
    sb.from(table).select('avatar_url, logo_url, doc_url, doc_name').eq('profile_id', userId).single().then(({ data: prof, error }) => {
        if (error) console.error("Error al cargar perfil:", error);
        const avatarUrl = prof?.[isCand ? 'avatar_url' : 'logo_url'];
        const docUrl = prof?.doc_url;
        const docName = prof?.doc_name;
        const userName = userMeta?.full_name || 'Usuario';

        let html = `<div class="max-w-2xl mx-auto space-y-6">
            <div class="bg-white dark:bg-dark-card p-6 rounded-xl border dark:border-gray-700 text-center">
                <h3 class="text-lg font-bold dark:text-white mb-4">${isCand ? 'Mi Perfil Profesional' : 'Datos de mi Empresa'}</h3>
                ${!avatarUrl && isCand ? '<p class="text-xs text-pincha-orange mb-2 font-medium">💡 Agregar una foto aumenta tus posibilidades de match en un 40%</p>' : ''}
                <img src="${avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=FF6B35&color=fff&size=128`}" 
                     alt="Avatar" class="w-24 h-24 rounded-full object-cover border-4 border-pincha-orange mx-auto mb-4">
                <input type="file" id="avatarInput" class="hidden" accept="image/*" onchange="handleFileUpload(this, 'avatar')">
                <button onclick="document.getElementById('avatarInput').click()" class="bg-gray-200 dark:bg-gray-700 dark:text-white px-6 py-2 rounded-lg font-bold btn-tactile hover:bg-gray-300 dark:hover:bg-gray-600">📷 Cambiar ${isCand ? 'Foto' : 'Logo'}</button>
            </div>`;
            
        if (isCand) {
            html += `<div class="bg-white dark:bg-dark-card p-6 rounded-xl border dark:border-gray-700 text-center">
                <h3 class="text-lg font-bold dark:text-white mb-4">Currículum y Documentos</h3>
                ${docUrl ? `
                    <div class="bg-green-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 mb-4 flex items-center gap-3 justify-center">
                        <span class="text-3xl">📄</span>
                        <div class="text-left flex-1 min-w-0">
                            <p class="font-bold dark:text-white truncate">${docName || 'Documento'}</p>
                            <a href="${docUrl}" target="_blank" class="text-sm text-pincha-blue hover:underline">Ver o descargar →</a>
                        </div>
                    </div>
                ` : '<p class="text-gray-500 dark:text-gray-400 mb-4">Aún no has subido ningún documento.</p>'}
                <input type="file" id="docInput" class="hidden" accept=".pdf,.doc,.docx,.jpg,.png" onchange="handleFileUpload(this, 'doc')">
                <button onclick="document.getElementById('docInput').click()" class="bg-pincha-blue dark:bg-pincha-orange text-white px-6 py-2 rounded-lg font-bold btn-tactile hover:opacity-90">📤 Subir CV o Certificado</button>
            </div>`;
        } else {
            html += `<div class="bg-white dark:bg-dark-card p-6 rounded-xl border dark:border-gray-700 text-center">
                <h3 class="text-lg font-bold dark:text-white mb-4">Documentos de la Empresa</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">Sube políticas internas o documentos legales (opcional).</p>
                <input type="file" id="docInput" class="hidden" accept=".pdf,.doc,.docx" onchange="handleFileUpload(this, 'doc')">
                <button onclick="document.getElementById('docInput').click()" class="bg-pincha-blue dark:bg-pincha-orange text-white px-6 py-2 rounded-lg font-bold btn-tactile hover:opacity-90">📤 Subir Documento</button>
            </div>`;
        }
        html += `<div id="uploadMsg" class="text-center text-sm font-bold"></div></div>`;
        c.innerHTML = html;
    });
}

async function loadMatchesTab(c) {
    try {
        const { data: notifs, error } = await sb.from('notifications').select('*, jobs(title, location, salary, category, is_active, company_name, contact_info)').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        await sb.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
        checkUnreadNotifications();
        
        let html = '<h3 class="text-lg font-bold text-pincha-blue dark:text-white mb-4">Tus Oportunidades</h3>';
        if (!notifs?.length) { 
            html += '<div class="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg rounded-lg border"><p class="font-bold text-xl mb-2">🔍 Buscando coincidencias...</p><p>Añade más municipios a tu perfil para recibir más alertas.</p></div>'; 
        } else {
            html += '<div class="space-y-4">';
            notifs.forEach(n => { 
                const scoreClass = n.score >= 90 ? 'match-high' : 'match-med'; 
                html += `<div class="bg-white dark:bg-dark-card p-5 rounded-xl border dark:border-gray-700 shadow-sm ${scoreClass} hover:shadow-md transition relative overflow-hidden">
                    <div class="absolute top-0 right-0 bg-pincha-orange text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Match ${n.score}%</div>
                    <div class="flex items-start gap-3">
                        <div class="text-3xl">🔥</div>
                        <div class="flex-1">
                            <p class="text-gray-800 dark:text-gray-200 font-medium leading-snug mb-2">${n.message}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">🏢 ${n.jobs?.company_name || 'Empresa'} • 💰 ${n.jobs?.salary || 'A convenir'}</p>
                            ${n.jobs?.contact_info ? `<p class="text-xs text-pincha-orange dark:text-pincha-orange font-medium mb-3 bg-orange-50 dark:bg-gray-800 p-2 rounded">📞 Contacto directo: ${n.jobs.contact_info}</p>` : ''}
                            <div class="flex gap-2">
                                <a href="index.html" class="flex-1 text-center bg-pincha-blue dark:bg-pincha-orange text-white text-sm font-bold py-2 rounded-lg hover:opacity-90 transition">Ver Vacante</a>
                                <button onclick="applyFromMatch('${n.job_id}')" class="flex-1 text-center border-2 border-pincha-orange text-pincha-orange dark:text-white dark:border-white text-sm font-bold py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 transition">Postularme Ahora</button>
                            </div>
                        </div>
                    </div>
                </div>`; 
            });
            html += '</div>';
        }
        c.innerHTML = html;
    } catch (err) { c.innerHTML = `<div class="text-center py-8 text-red-500">Error: ${err.message}</div>`; }
}

async function applyFromMatch(jobId) {
    try { 
        const { error } = await sb.from('applications').insert({ job_id: jobId, candidate_id: userId }); 
        if (error?.code === '23505') { alert('✅ Ya te postulaste.'); return; } 
        if (error) throw error; 
        alert('✅ ¡Postulación enviada!'); 
        loadMatchesTab(document.getElementById('tabContent')); 
    } catch (err) { alert('❌ ' + err.message); }
}

// ✅ EDICIÓN DE PERFIL DINÁMICA POR ROL
async function openEditProfileModal() {
    closeSettingsModal();
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    const msg = document.getElementById('editProfileMsg');
    if (msg) msg.classList.add('hidden');

    const fieldsContainer = document.getElementById('editProfileFields');
    const title = document.getElementById('editProfileTitle');

    try {
        const { data: profile } = await sb.from('profiles').select('full_name').eq('id', userId).single();
        const table = userType === 'candidate' ? 'candidates' : 'companies';
        const { data: userData } = await sb.from(table).select('*').eq('profile_id', userId).single();

        if (userType === 'candidate') {
            title.textContent = '✏️ Editar mi perfil';
            fieldsContainer.innerHTML = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Titular Profesional</label>
                    <input type="text" id="editTitle" value="${userData?.professional_title || ''}" placeholder="Ej: Desarrollador Frontend con 2 años de exp." class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Edad</label>
                        <input type="number" id="editAge" value="${userData?.age || ''}" min="16" max="99" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Género</label>
                        <select id="editGender" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">
                            <option value="masculino" ${userData?.gender === 'masculino' ? 'selected' : ''}>Masculino</option>
                            <option value="femenino" ${userData?.gender === 'femenino' ? 'selected' : ''}>Femenino</option>
                            <option value="otro" ${userData?.gender === 'otro' ? 'selected' : ''}>Otro</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Categoría Profesional</label>
                    <select id="editCategory" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">
                        ${searchData.categories.map(c => `<option value="${c}" ${userData?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Puesto Deseado</label>
                    <select id="editPosition" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">
                        <option value="">Seleccionar puesto</option>
                        ${(searchData.positions[userData?.category] || []).map(p => `<option value="${p}" ${userData?.desired_position === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nivel de Experiencia</label>
                    <select id="editExperienceLevel" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">
                        <option value="Sin experiencia" ${userData?.experience_level === 'Sin experiencia' ? 'selected' : ''}>Sin experiencia</option>
                        <option value="1-2 años" ${userData?.experience_level === '1-2 años' ? 'selected' : ''}>1-2 años</option>
                        <option value="3-5 años" ${userData?.experience_level === '3-5 años' ? 'selected' : ''}>3-5 años</option>
                        <option value="Más de 5 años" ${userData?.experience_level === 'Más de 5 años' ? 'selected' : ''}>Más de 5 años</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Municipios de Interés (Mantén Ctrl/Cmd para varios)</label>
                    <select id="editLocations" multiple class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg h-32 focus:ring-2 focus:ring-pincha-orange outline-none">
                        ${municipalities.map(m => `<option value="${m}" ${userData?.preferred_locations?.includes(m) ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Extracto Profesional</label>
                    <textarea id="editAbout" rows="3" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">${userData?.about_me || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Contacto (WhatsApp/Telegram)</label>
                    <input type="text" id="editContact" value="${userData?.contact_info || ''}" required placeholder="Ej: +53 5xxx xxxx o @usuario" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">
                </div>
            `;
        } else {
            title.textContent = '🏢 Editar datos de la empresa';
            fieldsContainer.innerHTML = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nombre Legal de la Empresa</label>
                    <input type="text" id="editLegalName" value="${userData?.legal_name || ''}" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Industria / Sector</label>
                    <select id="editIndustry" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">
                        <option value="Tecnología y Desarrollo de Software" ${userData?.industry === 'Tecnología y Desarrollo de Software' ? 'selected' : ''}>Tecnología y Desarrollo de Software</option>
                        <option value="Gastronomía y Alimentación" ${userData?.industry === 'Gastronomía y Alimentación' ? 'selected' : ''}>Gastronomía y Alimentación</option>
                        <option value="Turismo y Hotelería" ${userData?.industry === 'Turismo y Hotelería' ? 'selected' : ''}>Turismo y Hotelería</option>
                        <option value="Comercio Minorista (MIPYME)" ${userData?.industry === 'Comercio Minorista (MIPYME)' ? 'selected' : ''}>Comercio Minorista (MIPYME)</option>
                        <option value="Servicios Profesionales y Consultoría" ${userData?.industry === 'Servicios Profesionales y Consultoría' ? 'selected' : ''}>Servicios Profesionales y Consultoría</option>
                        <option value="Construcción y Mantenimiento" ${userData?.industry === 'Construcción y Mantenimiento' ? 'selected' : ''}>Construcción y Mantenimiento</option>
                        <option value="Otro" ${userData?.industry === 'Otro' ? 'selected' : ''}>Otro</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tamaño de la Empresa</label>
                    <select id="editSize" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">
                        <option value="1-10" ${userData?.company_size === '1-10' ? 'selected' : ''}>1-10 empleados</option>
                        <option value="11-50" ${userData?.company_size === '11-50' ? 'selected' : ''}>11-50 empleados</option>
                        <option value="50+" ${userData?.company_size === '50+' ? 'selected' : ''}>Más de 50 empleados</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Sobre Nosotros</label>
                    <textarea id="editAboutUs" rows="3" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">${userData?.about_us || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Número de WhatsApp o correo para recibir postulaciones</label>
                    <input type="text" id="editContact" value="${userData?.contact_info || ''}" required placeholder="Ej: +53 5xxx xxxx" class="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-dark-bg dark:text-white rounded-lg focus:ring-2 focus:ring-pincha-orange outline-none">
                </div>
            `;
        }
    } catch (err) { console.error("Error cargando perfil:", err); }
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal')?.classList.add('hidden');
}

document.addEventListener('submit', async function(e) {
    if (e.target.id === 'editProfileForm') {
        e.preventDefault();
        const msg = document.getElementById('editProfileMsg');
        if (msg) { msg.textContent = '⏳ Guardando cambios...'; msg.className = 'text-center text-sm font-bold text-blue-600 block'; }
        
        try {
            const table = userType === 'candidate' ? 'candidates' : 'companies';
            const updateData = { contact_info: document.getElementById('editContact').value };
            
            if (userType === 'candidate') {
                updateData.professional_title = document.getElementById('editTitle').value;
                updateData.age = parseInt(document.getElementById('editAge').value) || null;
                updateData.gender = document.getElementById('editGender').value;
                updateData.category = document.getElementById('editCategory').value;
                updateData.desired_position = document.getElementById('editPosition').value;
                updateData.experience_level = document.getElementById('editExperienceLevel').value;
                updateData.preferred_locations = Array.from(document.getElementById('editLocations').selectedOptions).map(opt => opt.value);
                updateData.about_me = document.getElementById('editAbout').value;
            } else {
                updateData.legal_name = document.getElementById('editLegalName').value;
                updateData.industry = document.getElementById('editIndustry').value;
                updateData.company_size = document.getElementById('editSize').value;
                updateData.about_us = document.getElementById('editAboutUs').value;
            }

            const { error } = await sb.from(table).update(updateData).eq('profile_id', userId);
            if (error) throw error;

            if (msg) { msg.textContent = '✅ Perfil actualizado correctamente.'; msg.className = 'text-center text-sm font-bold text-green-600 block'; }
            setTimeout(closeEditProfileModal, 1500);
        } catch (err) {
            console.error("Error guardando perfil:", err);
            const msg = document.getElementById('editProfileMsg');
            if (msg) { msg.textContent = '❌ Error: ' + err.message; msg.className = 'text-center text-sm font-bold text-red-600 block'; }
        }
    }
});

async function handleFileUpload(input, fileType) {
    const file = input.files[0];
    if (!file) return;
    const msg = document.getElementById('uploadMsg');
    if (msg) { msg.textContent = '⏳ Comprimiendo y subiendo...'; msg.className = 'mt-3 text-sm font-bold text-blue-600'; }

    try {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) throw new Error("Debes iniciar sesión");
        const userId = session.user.id;
        const userType = session.user.user_metadata?.user_type;

        let fileToUpload = file;
        if (fileType === 'avatar' && file.type.startsWith('image/')) {
            fileToUpload = await compressImage(file);
        }

        const cleanName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");
        let bucket, table, colUrl, colName;
        
        if (fileType === 'avatar') {
            bucket = 'avatars';
            table = userType === 'candidate' ? 'candidates' : 'companies';
            colUrl = userType === 'candidate' ? 'avatar_url' : 'logo_url';
        } else {
            bucket = 'candidate-docs';
            table = 'candidates';
            colUrl = 'doc_url';
            colName = 'doc_name';
        }

        const filePath = `${userId}/${Date.now()}_${cleanName}`;
        const { error: uploadError } = await sb.storage.from(bucket).upload(filePath, fileToUpload);
        if (uploadError) throw uploadError;

        const { data: urlData } = sb.storage.from(bucket).getPublicUrl(filePath);
        const updatePayload = { [colUrl]: urlData.publicUrl };
        if (colName) updatePayload[colName] = file.name;

        await sb.from(table).update(updatePayload).eq('profile_id', userId);

        if (msg) { msg.textContent = '✅ Guardado y optimizado.'; msg.className = 'mt-3 text-sm font-bold text-green-600'; }
        setTimeout(() => loadTabContent('tab-archivos'), 1000);
    } catch (error) {
        console.error("Error al subir archivo:", error);
        const msg = document.getElementById('uploadMsg');
        if (msg) { msg.textContent = '❌ Error: ' + error.message; msg.className = 'mt-3 text-sm font-bold text-red-600'; }
    }
}

async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
            };
        };
    });
}

async function deactivateAccount() {
    if (!confirm('¿Estás seguro? Esto ocultará tu perfil y tus datos. Tus datos se preservarán.')) return;
    try {
        const table = userType === 'company' ? 'companies' : 'candidates';
        await sb.from(table).update({ is_active: false }).eq('profile_id', userId);
        if (userType === 'company') await sb.from('jobs').update({ is_active: false }).eq('company_id', userId);
        await sb.auth.signOut();
        alert('✅ Cuenta desactivada correctamente.');
        window.location.href = 'index.html';
    } catch (err) { alert('❌ Error: ' + err.message); }
}

async function exportMyData() {
    try {
        const { data: profile } = await sb.from('profiles').select('*').eq('id', userId).single();
        const table = userType === 'candidate' ? 'candidates' : 'companies';
        const { data: userData } = await sb.from(table).select('*').eq('profile_id', userId).single();
        const exportData = { profile, [userType]: userData, exported_at: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `mi_pincha_datos_${userType}_${Date.now()}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (err) { alert("❌ Error al exportar: " + err.message); }
}

async function toggleSetting(column, value) {
    try {
        const table = userType === 'candidate' ? 'candidates' : 'companies';
        await sb.from(table).update({ [column]: value }).eq('profile_id', userId);
    } catch (err) { console.error("Error actualizando configuración:", err); }
}

function setupRealtimeNotifications(userName) {
    sb.channel(`public:notifications:user_id=eq.${userId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
            if (Notification.permission === "granted") {
                new Notification("🔥 ¡Nuevo Match en Mi Pincha!", {
                    body: payload.new.message, icon: "/images/logo.png", badge: "/images/favicon.png", tag: "mipincha-match", requireInteraction: true
                });
            }
            unreadCount++;
            document.getElementById('notifDot')?.classList.remove('hidden');
        }).subscribe();
}

function openSettingsModal() { document.getElementById('settingsModal')?.classList.remove('hidden'); }
function closeSettingsModal() { document.getElementById('settingsModal')?.classList.add('hidden'); }

// 🌍 EXPOSICIÓN GLOBAL
window.switchTab = switchTab; window.handleFileUpload = handleFileUpload;
window.deactivateAccount = deactivateAccount; window.openEditProfileModal = openEditProfileModal; window.closeEditProfileModal = closeEditProfileModal;
window.toggleSetting = toggleSetting; window.exportMyData = exportMyData; window.openSettingsModal = openSettingsModal; window.closeSettingsModal = closeSettingsModal;