/**
 * Mini-App: Autenticación
 * Ubicación: mini-apps/auth/index.js
 */

export async function init(context) {
  const { queue, ui } = context;

  // Botones de login/register
  const loginButtons = document.querySelectorAll('[data-action="login"]');
  const registerButtons = document.querySelectorAll('[data-action="register"]');

  loginButtons.forEach(btn => {
    btn.addEventListener('click', () => showLoginModal());
  });

  registerButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const role = e.target.dataset.role || 'candidate';
      showRegisterModal(role);
    });
  });

  function showLoginModal() {
    const modal = createLoginModal();
    ui?.showModal(modal);
  }

  function showRegisterModal(role = 'candidate') {
    const modal = createRegisterModal(role);
    ui?.showModal(modal);
  }

  function createLoginModal() {
    return `
      <div class="auth-modal">
        <h2>Iniciar Sesión</h2>
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" name="email" required />
          </div>
          <div class="form-group">
            <label for="login-password">Contraseña</label>
            <input type="password" id="login-password" name="password" required />
          </div>
          <button type="submit" class="btn btn--naranja btn--full">Entrar</button>
          <p class="auth-switch">
            ¿No tienes cuenta? <a href="#" data-action="show-register">Crear cuenta</a>
          </p>
        </form>
      </div>
    `;
  }

  function createRegisterModal(role = 'candidate') {
    return `
      <div class="auth-modal">
        <h2>Crear Cuenta - ${role === 'candidate' ? 'Candidato' : 'Empresa'}</h2>
        <form id="register-form" class="auth-form">
          <input type="hidden" name="role" value="${role}" />
          
          <div class="form-group">
            <label for="reg-name">${role === 'candidate' ? 'Nombre completo' : 'Nombre de la empresa'}</label>
            <input type="text" id="reg-name" name="name" required />
          </div>
          
          <div class="form-group">
            <label for="reg-email">Email</label>
            <input type="email" id="reg-email" name="email" required />
          </div>
          
          <div class="form-group">
            <label for="reg-password">Contraseña</label>
            <input type="password" id="reg-password" name="password" required minlength="8" />
          </div>
          
          <div class="form-group">
            <label for="reg-phone">Teléfono (WhatsApp)</label>
            <input type="tel" id="reg-phone" name="phone" placeholder="+53 51283542" />
          </div>

          <button type="submit" class="btn btn--naranja btn--full">
            Crear cuenta gratis
          </button>
          
          <p class="auth-switch">
            ¿Ya tienes cuenta? <a href="#" data-action="show-login">Iniciar sesión</a>
          </p>
        </form>
      </div>
    `;
  }

  // Delegación de eventos para formularios dinámicos
  document.addEventListener('submit', async (e) => {
    if (e.target.id === 'login-form') {
      e.preventDefault();
      await handleLogin(new FormData(e.target));
    }
    
    if (e.target.id === 'register-form') {
      e.preventDefault();
      await handleRegister(new FormData(e.target));
    }
  });

  async function handleLogin(formData) {
    const data = Object.fromEntries(formData);
    
    // Registrar intento de login
    queue?.enqueue({
      type: 'login_attempt',
      payload: { email: data.email }
    });

    // Simular login (en producción: llamar a API)
    ui?.notify('Iniciando sesión...', 'info');
    
    setTimeout(() => {
      ui?.notify('¡Bienvenido!', 'success');
      // window.location.href = '/dashboard';
    }, 1000);
  }

  async function handleRegister(formData) {
    const data = Object.fromEntries(formData);
    
    // Validar
    if (data.password.length < 8) {
      ui?.notify('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    // Registrar en queue (sin exponer contraseña)
    queue?.enqueue({
      type: 'register_request',
      payload: {
        role: data.role,
        email: data.email,
        name: data.name,
        phone: data.phone
      }
    });

    ui?.notify('Creando cuenta...', 'info');
    
    setTimeout(() => {
      ui?.notify('¡Cuenta creada con éxito!', 'success');
      // window.location.href = '/onboarding';
    }, 1500);
  }

  console.log('[Auth] Mini-app initialized');
}

export default { init };