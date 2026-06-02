// 🔑 CONFIGURACIÓN SUPABASE
const SUPABASE_URL = 'https://yznkrbhfsrcoskyoyfxs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bmtyYmhmc3Jjb3NreW95ZnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjczNzQsImV4cCI6MjA5NTI0MzM3NH0.TF_iauRfdaICpT7KipXwrphQYyGu4X4v2_FzQOIl1qw';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentFilter = { keyword: '', position: '', category: '', location: '' };

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthState();
    setupHamburger();
    setupSearch();
    loadJobs();
    setupModal();
});

// 🔍 ESTADO DE AUTENTICACIÓN
async function checkAuthState() {
    const { data: { session } } = await sb.auth.getSession();
    const isAuth = !!session;
    document.getElementById('navGuest').classList.toggle('hidden', isAuth);
    document.getElementById('navUser').classList.toggle('hidden', !isAuth);
    document.getElementById('navUser').classList.toggle('flex', isAuth);
    document.getElementById('menuGuest').classList.toggle('hidden', isAuth);
    document.getElementById('menuUser').classList.toggle('hidden', !isAuth);
    if(isAuth) {
        const name = session.user.user_metadata?.full_name || session.user.email;
        const badge = document.getElementById('userBadge');
        if(badge) badge.textContent = `${name} (${session.user.user_metadata?.user_type === 'company' ? 'Empresa' : 'Candidato'})`;
    }
}

// 🍔 MENÚ HAMBURGUESA
function setupHamburger() {
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    btn.addEventListener('click', () => menu.classList.toggle('open'));
    document.getElementById('logoutBtn')?.addEventListener('click', async () => { await sb.auth.signOut(); window.location.reload(); });
    document.getElementById('mobileLogoutBtn')?.addEventListener('click', async () => { await sb.auth.signOut(); window.location.reload(); });
}

// 🔍 BUSCADOR AMPLIADO (4 CAMPOS)
function setupSearch() {
    const inputs = ['searchKeyword', 'searchPosition', 'searchCategory', 'searchLocation'];
    inputs.forEach(id => document.getElementById(id)?.addEventListener('input', debounceSearch));
    document.getElementById('searchBtn').addEventListener('click', loadJobs);
    document.getElementById('searchBtn').addEventListener('keydown', (e) => { if(e.key === 'Enter') loadJobs(); });
}

let debounceTimer;
function debounceSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadJobs, 400);
}

async function loadJobs() {
    const grid = document.getElementById('jobsGrid');
    grid.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pincha-orange"></div></div>';
    
    currentFilter.keyword = document.getElementById('searchKeyword')?.value || '';
    currentFilter.position = document.getElementById('searchPosition')?.value || '';
    currentFilter.category = document.getElementById('searchCategory')?.value || '';
    currentFilter.location = document.getElementById('searchLocation')?.value || '';

    try {
        let query = sb.from('jobs').select('*').eq('is_active', true);
        
        // Búsqueda global en título, descripción, categoría y ubicación
        const filters = [];
        if(currentFilter.keyword) filters.push(`title.ilike.%${currentFilter.keyword}%`, `description.ilike.%${currentFilter.keyword}%`, `company_name.ilike.%${currentFilter.keyword}%`);
        if(currentFilter.position) filters.push(`title.ilike.%${currentFilter.position}%`);
        if(currentFilter.category) filters.push(`category.ilike.%${currentFilter.category}%`);
        if(currentFilter.location) filters.push(`location.ilike.%${currentFilter.location}%`);

        if(filters.length) query = query.or(filters.join(','));
        
        const { data, error } = await query.order('created_at', { ascending: false }).limit(24);
        if (error) throw error;

        if (!data?.length) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border">📭 No se encontraron vacantes con estos filtros.</div>';
            return;
        }

        grid.innerHTML = data.map(job => `
            <div class="bg-white border border-gray-200 rounded-xl p-5 hover:border-pincha-orange hover:shadow-lg transition-all duration-200 group cursor-pointer" onclick="openJobDetail('${job.id}')">
                <h4 class="text-lg font-bold text-pincha-blue group-hover:text-pincha-orange transition mb-1">${job.title}</h4>
                <p class="text-sm text-gray-500 mb-3">${job.category} • ${job.location || 'La Habana'}</p>
                <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <span class="font-bold text-gray-700">${job.salary || 'A convenir'}</span>
                    <span class="text-xs text-gray-400">${new Date(job.created_at).toLocaleDateString('es-CU')}</span>
                </div>
                <button class="w-full mt-3 py-2 text-sm font-bold text-pincha-orange border border-pincha-orange rounded-lg hover:bg-pincha-orange hover:text-white btn-tactile">Ver detalles →</button>
            </div>
        `).join('');
    } catch (err) {
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">⚠️ Error de conexión.</div>';
    }
}

// 📖 MODAL DETALLES
function setupModal() {
    document.getElementById('jobModal').addEventListener('click', (e) => { if(e.target.id === 'jobModal') e.target.classList.add('hidden'); });
}

async function openJobDetail(jobId) {
    const modal = document.getElementById('jobModal');
    modal.classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Cargando...';
    
    try {
        const { data: job } = await sb.from('jobs').select('*').eq('id', jobId).single();
        if(!job) throw new Error('Vacante no encontrada');

        document.getElementById('modalTitle').textContent = job.title;
        document.getElementById('modalCompany').textContent = `🏢 ${job.company_name || 'Empresa'}`;
        document.getElementById('modalLocation').textContent = job.location || 'No especificada';
        document.getElementById('modalCategory').textContent = job.category || 'General';
        document.getElementById('modalSalary').textContent = job.salary || 'A convenir';
        document.getElementById('modalDate').textContent = new Date(job.created_at).toLocaleDateString('es-CU');
        document.getElementById('modalDesc').textContent = job.description || 'Sin descripción disponible.';
        
        const applyBtn = document.getElementById('modalApplyBtn');
        const { data: { session } } = await sb.auth.getSession();
        if(!session) {
            applyBtn.textContent = 'Inicia sesión para postular';
            applyBtn.onclick = () => window.location.href = 'login.html';
        } else if(session.user.user_metadata?.user_type === 'company') {
            applyBtn.textContent = 'Solo candidatos pueden postularse';
            applyBtn.disabled = true; applyBtn.classList.add('opacity-50');
        } else {
            applyBtn.textContent = 'Postularme a esta vacante';
            applyBtn.disabled = false; applyBtn.classList.remove('opacity-50');
            applyBtn.onclick = async () => {
                applyBtn.textContent = 'Enviando...';
                const { error } = await sb.from('applications').insert({ job_id: job.id, candidate_id: session.user.id });
                if(error && error.code === '23505') alert('Ya te postulaste a esta vacante.');
                else if(error) alert('Error: ' + error.message);
                else { alert('✅ ¡Postulación enviada con éxito!'); applyBtn.textContent = '✅ Postulado'; applyBtn.disabled = true; }
            };
        }
    } catch(e) {
        document.getElementById('modalTitle').textContent = 'Error al cargar';
        document.getElementById('modalDesc').textContent = e.message;
    }
}
window.openJobDetail = openJobDetail; // Exponer al HTML