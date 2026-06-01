# 🐜 Mi Pincha - Agencia de Empleos Digital
> Plataforma web gratuita para conectar talento y empresas en Cuba. Registro dual, matches inteligentes por ubicación/categoría, subida de CVs/logos y dashboard en tiempo real.

🔗 **Demo en vivo:** https://mipincha.github.io  
🏗️ **Arquitectura:** Frontend Estático + Supabase (PostgreSQL/Auth/Storage)  
📜 **Licencia:** MIT (100% Open Source & Freeware)

---

## 🏗️ Arquitectura Técnica
Alineada con la **Arquitectura 2: Freemium en la Nube** del informe *"Pilas Tecnológicas Gratuitas para Aplicaciones Web en Cuba"*:
- **Frontend:** HTML5 + Vanilla JS + Tailwind CSS (CDN). Cero compilación, bundle < 150KB.
- **Backend:** Supabase (PostgreSQL serverless). Auth, Storage, Realtime y RLS nativo.
- **Hosting:** GitHub Pages (CDN global Fastly). HTTPS automático, despliegue continuo.
- **Seguridad:** Row-Level Security (RLS) estricto. Aislamiento total de datos por usuario.

## 🚀 Despliegue en 3 Pasos
1. **Clona o sube** este repositorio a `tu-usuario/mipincha.github.io`
2. **Configura Supabase:**
   - Desactiva `Confirm email` en `Auth → Providers → Email`
   - Ejecuta los scripts SQL de `db-setup/` (tablas, políticas RLS, trigger de match)
   - Reemplaza `SUPABASE_URL` y `SUPABASE_KEY` en `js/app.js` y `dashboard.html`
3. **Activa GitHub Pages:** `Settings → Pages → Source: Deploy from a branch → main → / (root)`

## 📦 Funcionalidades Clave
✅ Registro dual sin fricción (Candidato/Empresa)  
✅ Buscador con autocompletado local (<8KB, sin peticiones extra)  
✅ Sistema de Match Inteligente (Score ≥75 pts por ubicación + categoría/puesto)  
✅ Dashboard diferenciado con métricas en tiempo real  
✅ Subida de CVs (privados) y Logos (públicos) vía Supabase Storage  
✅ SEO optimizado con Schema.org `JobPosting` dinámico

## 📊 KPIs Medibles
| Métrica | Meta | Cómo medir |
|---------|------|------------|
| Time to Interactive (3G/4G) | < 1.5s | Lighthouse Chrome DevTools |
| Tasa de Match relevante | > 15% | `(Notificaciones ≥75 pts) / Vacantes publicadas` |
| Uptime & Latencia | 99.9% / <120ms | GitHub Pages Status + Supabase Logs |
| Costo operativo mensual | $0 USD | Planes gratuitos de GitHub + Supabase |

## 💪 1 Fortaleza Circunstancial
**Arquitectura Freemium sin fricción:** Supabase gestiona Auth, DB y Storage en un solo punto, eliminando la necesidad de servidores intermedios o licencias. Esto permite lanzar en horas, escalar progresivamente y migrar a infraestructura autohospedada (Appwrite/PocketBase) cuando el tráfico lo requiera, tal como recomienda el documento de referencia.

## ⚠️ 1 Debilidad Circunstancial
**Dependencia de conectividad internacional:** CDN y APIs responden desde nodos globales. En cortes prolongados de internet en Cuba, la carga inicial puede fallar.  
**Mitigación:** Cacheo explícito de assets críticos, búsqueda local fallback, y plan de migración a Docker + PocketBase si la soberanía de red se vuelve crítica.

## 🇨🇺 Optimización para Contexto Cubano
- Carga diferida por tabs (reduce consumo de datos móviles)
- Filtros hardcodeados en HTML (funcionan sin JS en carga inicial)
- RLS nativo evita consultas innecesarias y protege datos sensibles
- Zero-paid dependencies: sin licencias, sin geo-bloqueos, sin tarjetas de crédito

## 📜 Licencia
MIT License. Uso libre, modificación permitida, redistribución permitida. Los datos almacenados pertenecen 100% a los usuarios y al administrador del proyecto.