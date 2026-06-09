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

let currentFilter = { keyword: '', position: '', category: '', location: '' };
let debounceTimer;
let unreadCount = 0;

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
    
    const editForm = document.getElementById('editProfileForm');
    if (editForm) editForm.addEventListener('submit', handleEditProfileSubmit);

    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            await Notification.requestPermission();
        }
        setupRealtimeNotifications(session.user.user_metadata?.full_name || session.user.email);
    }
});

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
        const headerUserName = document.getElementById('headerUserName');
        if (headerUserName) headerUserName.textContent = name;
        const mobileUserName = document.getElementById('mobileUserName');
        if (mobileUserName) mobileUserName.textContent = name;
        const badge = document.getElementById('userBadge');
        if (badge) badge.textContent = name;
    }
}

function setupHamburger() {
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    btn?.addEventListener('click', () => menu?.classList.toggle('open'));
    document.getElementById('logoutBtn')?.addEventListener('click', async () => { await sb.auth.signOut(); window.location.reload(); });
    document.getElementById('mobileLogoutBtn')?.addEventListener('click', async () => { await sb.auth.signOut(); window.location.reload(); });
}

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
            autocompleteList.innerHTML = matches.map(m => `<div class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm dark:text-white" onclick="selectAutocomplete('${m}')">${m}</div>`).join('');
            autocompleteList.classList.remove('hidden');
        }, 200);
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#searchKeyword') && !e.target.closest('#autocompleteList')) autocompleteList?.classList.add('hidden');
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
        searchData.positions[category].forEach(p => { positionSelect.innerHTML += `<option value="${p}">${p}</option>`; });
    }
}

function debounceSearch() { clearTimeout(debounceTimer); debounceTimer = setTimeout(loadJobs, 400); }

async function loadJobs() {
    const grid = document.getElementById('jobsGrid');
    grid.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pincha-orange"></div></div>';
    currentFilter.keyword = document.getElementById('searchKeyword')?.value || '';
    currentFilter.position = document.getElementById('searchPosition')?.value || '';
    currentFilter.category = document.getElementById('searchCategory')?.value || '';
    currentFilter.location = document.getElementById('searchLocation')?.value || '';

    try {
        let jobsQuery = sb.from('jobs').select('*').eq('is_active', true).gt('expires_at', new Date().toISOString());
        if (currentFilter.keyword) jobsQuery = jobsQuery.or(`title.ilike.%${currentFilter.keyword}%,description.ilike.%${currentFilter.keyword}%,company_name.ilike.%${currentFilter.keyword}%`);
        if (currentFilter.position) jobsQuery = jobsQuery.ilike('title', `%${currentFilter.position}%`);
        if (currentFilter.category) jobsQuery = jobsQuery.ilike('category', `%${currentFilter.category}%`);
        if (currentFilter.location) jobsQuery = jobsQuery.ilike('location', `%${currentFilter.location}%`);
        const { data: jobs, error: jobsError } = await jobsQuery.order('created_at', { ascending: false });
        if (jobsError) throw jobsError;

        let candQuery = sb.from('candidates').select('profile_id, desired_position, category, preferred_locations, experience, experience_level, salary_expected, contact_info, age, avatar_url, doc_url, doc_name, is_paused, hide_phone, created_at, profiles(full_name)').eq('is_active', true).eq('is_paused', false);
        if (currentFilter.keyword) candQuery = candQuery.or(`desired_position.ilike.%${currentFilter.keyword}%,experience.ilike.%${currentFilter.keyword}%`);
        if (currentFilter.position) candQuery = candQuery.ilike('desired_position', `%${currentFilter.position}%`);
        if (currentFilter.category) candQuery = candQuery.ilike('category', `%${currentFilter.category}%`);
        const { data: candidates, error: candError } = await candQuery.order('created_at', { ascending: false });
        if (candError) throw candError;

        const allPosts = [
            ...(jobs || []).map(j => ({ ...j, type: 'job' })),
            ...(candidates || []).map(c => ({ ...c, type: 'candidate' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (!allPosts.length) { 
            grid.innerHTML = `<div class="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                <div class="text-4xl mb-3">🔍</div>
                <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">Aún no hay matches perfectos</h3>
                <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Estamos buscando activamente. Intenta ampliar tus municipios preferidos o ajusta tus filtros de búsqueda para ver más oportunidades.</p>
            </div>`; 
            return; 
        }

        grid.innerHTML = allPosts.map(post => {
            if (post.type === 'job') {
                const isVerified = post.logo_url && post.contact_info && post.contact_info.length >= 8;
                const avatarSrc = post.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.company_name || 'Empresa')}&background=1E3A5F&color=fff&size=128`;
                return `
                <div class="bg-white dark:bg-gray-800 border-l-4 border-pincha-blue dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all duration-200 group relative">
                    <button onclick="reportContent('job', '${post.id}')" class="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition" title="Reportar contenido">🚩</button>
                    <div class="flex items-start gap-3 mb-3">
                        <img src="${avatarSrc}" alt="Logo" loading="lazy" class="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <h4 class="text-lg font-bold text-pincha-blue dark:text-white group-hover:text-pincha-orange transition truncate">${post.title}</h4>
                                ${isVerified ? '<span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">✅ Verificado</span>' : ''}
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-300 truncate">${post.company_name}</p>
                        </div>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">${post.category} • ${post.location || 'La Habana'}</p>
                    ${post.contact_info ? `<p class="text-xs text-pincha-orange font-medium mb-2">📞 Contacto: ${post.contact_info}</p>` : ''}
                    <div class="flex justify-between items-center mt-3 pt-3 border-t dark:border-gray-700">
                        <span class="font-bold text-gray-700 dark:text-gray-300">${post.salary || 'A convenir'}</span>
                        <button class="text-sm font-bold text-pincha-orange hover:underline" onclick="openJobDetail('${post.id}')">Ver detalles →</button>
                    </div>
                </div>`;
            } else {
                const candidateName = post.profiles?.full_name || 'Candidato';
                const locations = Array.isArray(post.preferred_locations) ? post.preferred_locations.join(', ') : (post.location || 'La Habana');
                const ageText = post.age ? `${post.age} años • ` : '';
                const isVerified = post.avatar_url && post.doc_url;
                const avatarSrc = post.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=FF6B35&color=fff&size=128`;
                const contactInfo = post.contact_info || '';
                const cleanContact = contactInfo.replace(/\D/g, '');
                const isPhone = cleanContact.length >= 8;
                const waLink = isPhone ? `https://wa.me/${cleanContact.startsWith('53') ? cleanContact : '53' + cleanContact}?text=Hola,%20vi%20tu%20perfil%20en%20Mi%20Pincha.` : '#';
                const onClickAttr = isPhone ? `window.open('${waLink}', '_blank')` : `alert('Contacto:\\n${contactInfo.replace(/'/g, "\\'")}')`;
                const showContact = !post.hide_phone && contactInfo;

                return `
                <div class="bg-white dark:bg-gray-800 border-l-4 border-green-500 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all duration-200 relative">
                    <button onclick="reportContent('candidate', '${post.profile_id}')" class="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition" title="Reportar contenido">🚩</button>
                    <div class="flex items-start gap-3 mb-3">
                        <img src="${avatarSrc}" alt="Foto" loading="lazy" class="w-12 h-12 rounded-full object-cover border-2 border-pincha-orange flex-shrink-0">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <h4 class="text-lg font-bold text-gray-800 dark:text-white truncate">${post.desired_position || 'Profesional'}</h4>
                                ${isVerified ? '<span class="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">✅ Verificado</span>' : ''}
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-300 truncate">${candidateName}</p>
                        </div>
                        <span class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">${new Date(post.created_at).toLocaleDateString('es-CU')}</span>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">${post.category} • 📍 ${ageText}${locations}</p>
                    ${post.experience ? `<p class="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 italic">"${post.experience}"</p>` : ''}
                    ${post.doc_url ? `
                        <a href="${post.doc_url}" target="_blank" class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            <span class="text-xl">📎</span>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">${post.doc_name || 'Documento de referencia'}</p>
                                <p class="text-[10px] text-gray-500">Clic para ver o descargar</p>
                            </div>
                        </a>
                    ` : ''}
                    <div class="flex justify-between items-center mt-2 pt-3 border-t dark:border-gray-700">
                        <span class="font-bold text-gray-700 dark:text-gray-300">${post.salary_expected || 'Salario a convenir'}</span>
                        ${showContact ? `<button class="text-sm font-bold text-green-600 hover:underline" onclick="${onClickAttr}">Postular por WhatsApp →</button>` : '<span class="text-xs text-gray-400">Contacto oculto</span>'}
                    </div>
                </div>`;
            }
        }).join('');
    } catch (err) { 
        console.error("Error cargando jobs:", err);
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">⚠️ Error de conexión.</div>'; 
    }
}

function setupModal() {
    document.getElementById('jobModal')?.addEventListener('click', (e) => { if (e.target.id === 'jobModal') closeJobModal(); });
}
function closeJobModal() { document.getElementById('jobModal')?.classList.add('hidden'); }

async function postularPorWhatsapp(jobId, jobTitle, contactInfo) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { window.location.href = 'login.html'; return; }
    try {
        const { data: candidate } = await sb.from('candidates').select('gender').eq('profile_id', session.user.id).maybeSingle();
        let generoTexto = "interesado/a";
        if (candidate?.gender === 'masculino') generoTexto = "interesado";
        else if (candidate?.gender === 'femenino') generoTexto = "interesada";

        const candidateName = session.user.user_metadata?.full_name || "Candidato";
        const cleanPhone = contactInfo ? contactInfo.replace(/\D/g, '') : '';
        const finalPhone = cleanPhone.startsWith('53') ? cleanPhone : '53' + cleanPhone;

        if (!cleanPhone || cleanPhone.length < 8) {
            alert("⚠️ Esta publicación no tiene un número de WhatsApp válido para contactar.");
            return;
        }

        try {
            await sb.from('profiles').upsert({ id: session.user.id }, { onConflict: 'id' });
            const { data: candCheck } = await sb.from('candidates').select('profile_id').eq('profile_id', session.user.id).maybeSingle();
            if (!candCheck) await sb.from('candidates').insert({ profile_id: session.user.id, is_active: true });
            await sb.from('applications').insert({ job_id: jobId, candidate_id: session.user.id });
        } catch (dbErr) { console.warn("No se pudo guardar la postulación en BD:", dbErr); }

        const message = `Hola, mi nombre es ${candidateName}, estoy ${generoTexto} en la vacante de "${jobTitle}" publicada en Mi Pincha. Me gustaría obtener más información.`;
        window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
    } catch (err) {
        console.error("Error en postulación:", err);
        alert("Error al procesar la postulación: " + err.message);
    }
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
            applyBtn.disabled = true; applyBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            applyBtn.textContent = 'Postularme por WhatsApp';
            applyBtn.disabled = false; applyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            applyBtn.onclick = async () => {
                applyBtn.textContent = 'Abriendo WhatsApp...';
                applyBtn.disabled = true;
                await postularPorWhatsapp(job.id, job.title, job.contact_info);
                setTimeout(() => { applyBtn.textContent = '✅ Mensaje preparado'; }, 1000);
            };
        }
    } catch (e) { document.getElementById('modalTitle').textContent = 'Error'; document.getElementById('modalDesc').textContent = e.message; }
}

function setupPublishModal() {
    const pubCandidate = document.getElementById('pubCandidate');
    const pubCompany = document.getElementById('pubCompany');
    const candidateForm = document.getElementById('pubCandidateForm');
    const companyForm = document.getElementById('pubCompanyForm');
    
    pubCandidate?.addEventListener('click', () => {
        pubCandidate.className = 'pub-tab active flex-1 py-2 rounded-md font-bold text-sm bg-white text-pincha-orange shadow-sm dark:bg-gray-600 dark:text-white';
        pubCompany.className = 'pub-tab inactive flex-1 py-2 rounded-md font-bold text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400';
        candidateForm.classList.remove('hidden'); companyForm.classList.add('hidden');
    });
    pubCompany?.addEventListener('click', () => {
        pubCompany.className = 'pub-tab active flex-1 py-2 rounded-md font-bold text-sm bg-white text-pincha-orange shadow-sm dark:bg-gray-600 dark:text-white';
        pubCandidate.className = 'pub-tab inactive flex-1 py-2 rounded-md font-bold text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400';
        companyForm.classList.remove('hidden'); candidateForm.classList.add('hidden');
    });
    
    document.getElementById('pubCandidateForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return alert('Debes iniciar sesión');
        const msg = document.getElementById('pubMsg');
        msg.textContent = '⏳ Preparando perfil...'; msg.className = 'mt-4 text-center text-sm font-bold text-blue-600 block';
        try {
            const locationsArray = document.getElementById('pubLocation').value.split(',').map(s => s.trim());
            await sb.from('profiles').upsert({ id: session.user.id, location: document.getElementById('pubLocation').value }, { onConflict: 'id' });
            const { error } = await sb.from('candidates').upsert({
                profile_id: session.user.id, desired_position: document.getElementById('pubPosition').value,
                category: document.getElementById('pubCategory').value, preferred_locations: locationsArray,
                contact_info: document.getElementById('pubContact').value, experience: document.getElementById('pubExperience').value,
                experience_level: document.getElementById('pubExperienceLevel').value, salary_expected: document.getElementById('pubSalary').value, is_active: true
            }, { onConflict: 'profile_id' });
            if (error) throw error;
            msg.textContent = '✅ Perfil actualizado. Las empresas te encontrarán.'; msg.className = 'mt-4 text-center text-sm font-bold text-green-600 block';
            setTimeout(closePublishModal, 2000);
        } catch (err) { msg.textContent = '❌ ' + err.message; msg.className = 'mt-4 text-center text-sm font-bold text-red-600 block'; }
    });
    
    document.getElementById('pubCompanyForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return alert('Debes iniciar sesión');
        const msg = document.getElementById('pubMsg');
        msg.textContent = '⏳ Preparando perfil de empresa...'; msg.className = 'mt-4 text-center text-sm font-bold text-blue-600 block';
        try {
            await sb.from('profiles').upsert({ id: session.user.id }, { onConflict: 'id' });
            const { data: company } = await sb.from('companies').select('profile_id').eq('profile_id', session.user.id).maybeSingle();
            if (!company) await sb.from('companies').insert({ profile_id: session.user.id, industry: 'General', is_active: true, is_verified: false });
            
            msg.textContent = '⏳ Publicando vacante...';
            const { error: jobError } = await sb.from('jobs').insert({
                title: document.getElementById('jobTitle').value, category: document.getElementById('jobCategory').value,
                location: document.getElementById('jobLocation').value, salary: document.getElementById('jobSalary').value,
                description: document.getElementById('jobDesc').value, contact_info: document.getElementById('jobContact').value,
                preferred_gender: document.getElementById('jobGender').value, required_experience: document.getElementById('jobExperience').value,
                preferred_age_min: document.getElementById('jobAgeMin').value ? parseInt(document.getElementById('jobAgeMin').value) : null,
                preferred_age_max: document.getElementById('jobAgeMax').value ? parseInt(document.getElementById('jobAgeMax').value) : null,
                company_name: session.user.user_metadata?.full_name || 'Empresa', company_id: session.user.id, is_active: true
            });
            if (jobError) throw jobError;
            msg.textContent = '✅ Vacante publicada.'; msg.className = 'mt-4 text-center text-sm font-bold text-green-600 block';
            setTimeout(() => { closePublishModal(); loadJobs(); }, 2000);
        } catch (err) { msg.textContent = '❌ ' + err.message; msg.className = 'mt-4 text-center text-sm font-bold text-red-600 block'; }
    });
}

async function openEditProfileModal() {
    closeSettingsModal();
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    const msg = document.getElementById('editProfileMsg');
    if (msg) msg.classList.add('hidden');
    try {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return;
        const userId = session.user.id;
        const userType = session.user.user_metadata?.user_type;
        const { data: profile } = await sb.from('profiles').select('full_name').eq('id', userId).single();
        const editName = document.getElementById('editName');
        if (editName) editName.value = profile?.full_name || '';
        const table = userType === 'candidate' ? 'candidates' : 'companies';
        const { data: userData } = await sb.from(table).select('*').eq('profile_id', userId).single();
        const editContact = document.getElementById('editContact');
        if (editContact) editContact.value = userData?.contact_info || '';
        if (userType === 'candidate') {
            const editCandidateFields = document.getElementById('editCandidateFields');
            if (editCandidateFields) editCandidateFields.classList.remove('hidden');
            const editCompanyFields = document.getElementById('editCompanyFields');
            if (editCompanyFields) editCompanyFields.classList.add('hidden');
            const editPosition = document.getElementById('editPosition');
            if (editPosition) editPosition.value = userData?.desired_position || '';
        } else {
            const editCompanyFields = document.getElementById('editCompanyFields');
            if (editCompanyFields) editCompanyFields.classList.remove('hidden');
            const editCandidateFields = document.getElementById('editCandidateFields');
            if (editCandidateFields) editCandidateFields.classList.add('hidden');
            const editIndustry = document.getElementById('editIndustry');
            if (editIndustry) editIndustry.value = userData?.industry || '';
        }
    } catch (err) { console.error("Error cargando perfil:", err); }
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) modal.classList.add('hidden');
}

async function handleEditProfileSubmit(e) {
    e.preventDefault();
    const msg = document.getElementById('editProfileMsg');
    if (msg) { msg.textContent = '⏳ Guardando cambios...'; msg.className = 'text-center text-sm font-bold text-blue-600 block'; }
    try {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) throw new Error("No hay sesión activa");
        const userId = session.user.id;
        const userType = session.user.user_metadata?.user_type;
        const newName = document.getElementById('editName').value;
        const newContact = document.getElementById('editContact').value;
        const table = userType === 'candidate' ? 'candidates' : 'companies';
        await sb.from('profiles').update({ full_name: newName }).eq('id', userId);
        const updateData = { contact_info: newContact };
        if (userType === 'candidate') updateData.desired_position = document.getElementById('editPosition')?.value || '';
        else updateData.industry = document.getElementById('editIndustry')?.value || '';
        const { error } = await sb.from(table).update(updateData).eq('profile_id', userId);
        if (error) throw error;
        const headerUserName = document.getElementById('headerUserName');
        if (headerUserName) headerUserName.textContent = newName;
        const mobileUserName = document.getElementById('mobileUserName');
        if (mobileUserName) mobileUserName.textContent = newName;
        const userBadge = document.getElementById('userBadge');
        if (userBadge) userBadge.textContent = newName;
        if (msg) { msg.textContent = '✅ Perfil actualizado correctamente.'; msg.className = 'text-center text-sm font-bold text-green-600 block'; }
        setTimeout(closeEditProfileModal, 1500);
    } catch (err) {
        console.error("Error guardando perfil:", err);
        const msg = document.getElementById('editProfileMsg');
        if (msg) { msg.textContent = '❌ Error: ' + err.message; msg.className = 'text-center text-sm font-bold text-red-600 block'; }
    }
}

async function reportContent(targetType, targetId) {
    const reason = prompt("¿Por qué deseas reportar este contenido? (Ej: Estafa, contenido inapropiado, spam)");
    if (!reason) return;
    try {
        const { data: { session } } = await sb.auth.getSession();
        await sb.from('reports').insert({ reporter_id: session.user.id, target_type: targetType, target_id: targetId, reason: reason });
        alert("✅ Gracias por tu reporte. Nuestro equipo lo revisará.");
    } catch (err) { alert("❌ Error al enviar el reporte."); }
}

async function exportMyData() {
    try {
        const { data: { session } } = await sb.auth.getSession();
        const userId = session.user.id;
        const userType = session.user.user_metadata?.user_type;
        const { data: profile } = await sb.from('profiles').select('*').eq('id', userId).single();
        const table = userType === 'candidate' ? 'candidates' : 'companies';
        const { data: userData } = await sb.from(table).select('*').eq('profile_id', userId).single();
        const exportData = { profile, [userType]: userData, exported_at: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `mi_pincha_datos_${userType}_${Date.now()}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (err) { alert("❌ Error al exportar datos: " + err.message); }
}

async function toggleSetting(column, value) {
    try {
        const { data: { session } } = await sb.auth.getSession();
        const userType = session.user.user_metadata?.user_type;
        const table = userType === 'candidate' ? 'candidates' : 'companies';
        await sb.from(table).update({ [column]: value }).eq('profile_id', session.user.id);
    } catch (err) { console.error("Error actualizando configuración:", err); }
}

function setupRealtimeNotifications(userName) {
    sb.channel(`public:notifications:user_id=eq.${sb.auth.getSession().then(s => s.data.session?.user.id)}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
            if (Notification.permission === "granted") {
                new Notification("🔥 ¡Nuevo Match en Mi Pincha!", {
                    body: payload.new.message, icon: "/images/logo.png", badge: "/images/favicon.png", tag: "mipincha-match", requireInteraction: true
                });
            }
            unreadCount++;
            const notifDot = document.getElementById('notifDot');
            if (notifDot) notifDot.classList.remove('hidden');
        }).subscribe((status) => { if (status === 'SUBSCRIBED') console.log("✅ Escuchando matches en tiempo real..."); });
}

function openPublishModal() { document.getElementById('publishModal')?.classList.remove('hidden'); }
function closePublishModal() { document.getElementById('publishModal')?.classList.add('hidden'); document.getElementById('pubMsg')?.classList.add('hidden'); }
function openSettingsModal() { document.getElementById('settingsModal')?.classList.remove('hidden'); }
function closeSettingsModal() { document.getElementById('settingsModal')?.classList.add('hidden'); }
function setupSettingsModal() {}

window.openJobDetail = openJobDetail; window.closeJobModal = closeJobModal;
window.openPublishModal = openPublishModal; window.closePublishModal = closePublishModal;
window.openSettingsModal = openSettingsModal; window.closeSettingsModal = closeSettingsModal;
window.openEditProfileModal = openEditProfileModal; window.closeEditProfileModal = closeEditProfileModal;
window.selectAutocomplete = selectAutocomplete; window.postularPorWhatsapp = postularPorWhatsapp;
window.reportContent = reportContent; window.exportMyData = exportMyData; window.toggleSetting = toggleSetting;