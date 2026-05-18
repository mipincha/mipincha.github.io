/**
 * Sandbox para Mini-Apps - Aislamiento seguro
 * Ubicación: src/core/sandbox.js
 */

export function createSandbox(miniAppManifest, context) {
  const { permissions = [], entry } = miniAppManifest;

  // Contexto seguro limitado por permisos
  const safeContext = {
    db: permissions.includes('db:read') || permissions.includes('db:write') ? {
      read: (collection, query) => {
        if (!permissions.includes('db:read')) {
          throw new Error('Permiso denegado: db:read');
        }
        return context.db?.read(collection, query);
      },
      write: (collection, data) => {
        if (!permissions.includes('db:write')) {
          throw new Error('Permiso denegado: db:write');
        }
        // Frontend NO escribe directo, solo via queue
        return context.db?.write(collection, data);
      }
    } : undefined,

    ui: permissions.includes('ui:render') ? {
      render: (html, target) => context.ui?.render(html, target),
      notify: (message, type = 'info') => context.ui?.notify(message, type),
      showModal: (content) => context.ui?.showModal(content)
    } : undefined,

    queue: permissions.includes('queue:write') ? {
      enqueue: (job) => context.queue?.enqueue(job)
    } : undefined,

    config: { ...context.config }, // Solo lectura
    utils: { ...context.utils }
  };

  // Función de ejecución aislada
  return function run(data = {}) {
    'use strict';
    
    try {
      // Crear función con contexto limitado
      const module = { exports: {} };
      
      const sandboxedFn = new Function('context', 'data', `
        const { db, ui, queue, config, utils } = context;
        
        // Código del mini-app
        ${entry}
        
        return module.exports;
      `);

      return sandboxedFn(safeContext, data);
    } catch (error) {
      console.error(`[Sandbox] Error en mini-app:`, error);
      context.ui?.notify('Error cargando módulo', 'error');
      return null;
    }
  };
}

export function validatePermissions(requested, granted) {
  return requested.every(perm => granted.includes(perm));
}

export default createSandbox;