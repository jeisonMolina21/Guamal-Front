# 📓 Bitácora de Ingeniería y Cambios: Guamal Frontend

## [2026-11-20 06:35] - Optimización Integral, Buenas Prácticas y Documentación de Calidad
- **Diagnóstico**: Finalización del rediseño editorial del frontend de Villa MCJ. Se requería auditar la performance de las animaciones, añadir soporte WCAG de movimiento reducido (`prefers-reduced-motion`), garantizar accesibilidad del login, estructurar metadatos SEO y unificar la documentación técnica.
- **Acciones Realizadas**:
  1. `Scene1Apertura.tsx`: Integrada física suave de resorte (`stiffness: 55, damping: 22, mass: 1.0`), soporte formal de `useReducedMotion`, eliminación de transiciones abruptas y ajuste de cabeceras TSDoc.
  2. `Scene3Cabanas.tsx`: Calibrado temporizador de auto-avance a 5.0s, añadidas variantes de `clip-path` wipe con respeto a accesibilidad reducida, limpiado de código huérfano.
  3. `DestinationExplorer.tsx`: Consolidación en pantalla única (`100vh`) sin scrollbars internas; corrección de fotografía de río cristalino y conmutador integrado con la galería viva.
  4. `ExperienceSection.astro`: Eliminación de cajas envolventes redundantes; fondo full-bleed de piscina y grilla 2x4 en cristal translúcido glassmorphic.
  5. `Navbar.tsx`: Integración directa del botón de Login/Ingresar en el encabezado principal accesible para desktop y móvil.
  6. `ConciergeWidget.tsx`: Ocultación en Hero inicial (`scrollY < 380px`) y acabado translúcido glassmorphic.
  7. `BaseLayout.astro`: Incorporación de metadatos OpenGraph, Twitter Cards y Schema.org estructurado (`LodgingBusiness`).
  8. `Gallery.css`: Archivo huérfano eliminado.
  9. `astro.config.mjs`: Configurado `site: 'https://villamcj.com'` generando automáticamente `sitemap-index.xml` y sitemaps estáticos en el build sin advertencias.
  10. Creación de `DOCUMENTATION.md` exhaustivo con arquitectura de escenas y guía de mantenimiento.
- **Validación**:
  - `npm run build` ejecutado exitosamente generando 26 rutas estáticas en 3.2s sin errores ni warnings.

---

## [2026-11-19 20:13] - Rediseño de Destinos en Pantalla Única con Imágenes Grandes
- **Diagnóstico**: La sección de Destinos presentaba un visor con tarjeta pequeña, barra de scroll nativa vertical tosca y galería apilada abajo que obligaba a scrollear 1200px.
- **Acciones Realizadas**:
  - `DestinationExplorer.tsx`: Rediseñado a Single-Screen (`100vh`) con imagen hero del 60% de ancho, cuadrícula de 4 tarjetas panorámicas y reemplazo de foto errónea de Bali por río tropical llanero.
  - `index.astro`: Eliminación de la sección duplicada de galería; integración limpia en el componente principal.
- **Validación**: Build estático 26 rutas en 3.1s.

---

## [2026-11-19 18:58] - Experiencia en Pantalla Única con Fondo Full-Bleed y Grilla Glassmorphic
- **Diagnóstico**: La sección de Experiencia estaba dividida verticalmente con tarjetas blancas flotantes que obligaban al usuario a scrollear.
- **Acciones Realizadas**:
  - `ExperienceSection.astro`: Fotografía de piscina a sangre completa (`100vh`), titular superpuesto a la izquierda y 8 especificaciones en cuadrícula translúcida ahumada a la derecha.
  - `Scene3Cabanas.tsx`: Ajustado temporizador de cabañas a 5 segundos exactos.
- **Validación**: Build estático 26 rutas en 3.2s.

---

## [2026-11-19 18:38] - Ocultación de Concierge en Hero y Acabado Translúcido
- **Diagnóstico**: El botón flotante de concierge distraía en la primera pantalla del manifiesto y tenía un estilo oscuro sólido pesado.
- **Acciones Realizadas**:
  - `ConciergeWidget.tsx`: Condicionado a aparecer únicamente tras `scrollY > 380px`, con estilo de cristal ahumado fino (`bg-[#12201C]/55 backdrop-blur-2xl border-white/20`).
- **Validación**: Build estático 26 rutas en 3.3s.

---

## [2026-11-19 18:34] - Apertura Cinemática con Frase 02 e Iris Reveal
- **Diagnóstico**: La animación inicial anterior con el texto dividido `VILLA` / `MCJ` y la foto rectangular no convencía.
- **Acciones Realizadas**:
  - `Scene1Apertura.tsx`: Inicio con la frase poética de la Escena 02 y apertura del portal de imagen desde el centro hacia los bordes mediante `clip-path: circle(...)` con inercia de resorte Apple.
- **Validación**: Build estático 26 rutas en 3.2s.
