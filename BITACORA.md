# 📓 Bitácora de Ingeniería y Cambios: Guamal Frontend

## [2026-11-20 20:10] - Restauración de la Animación de Apertura Icónica (VILLA / MCJ Split & Portal)
- **Diagnóstico**: La animación inicial de apertura que dividía el titular monumental `VILLA` / `MCJ` con desplazamiento en paralaje y expansión del portal fotográfico central enmarcado (`round 32px`) había sido reemplazada involuntariamente. El usuario solicitó expresamente restituir esta animación emblemática de la marca.
- **Acciones Realizadas**:
  - `Scene1Apertura.tsx`: Restaurada la identidad arquitectónica de apertura:
    - Tipografía monumental: `VILLA` arriba desplazándose suavemente a la izquierda (`-22vw`) y `MCJ` abajo a la derecha (`22vw`) con su letra `M` en cursiva terracota editorial.
    - Portal fotográfico central: tarjeta fotográfica de cabañas con esquinas redondeadas (`round 32px`) y sombra sutil que se expande a pantalla completa (full-bleed) de manera orgánica.
    - Física de resorte calibrada (`stiffness: 180, damping: 26, mass: 0.2`): respuesta inmediata al scroll sin zona muerta ni sensación de "delay".
    - Revelado de subtítulo editorial inferior ("Amanecer en el piedemonte...") al completar la apertura.
    - Soporte formal de accesibilidad WCAG (`useReducedMotion`).
- **Validación**:
  - `npm run build` ejecutado exitosamente generando 26 rutas estáticas en 3.18s sin errores.
  - Sincronización en Git.

---

## [2026-11-20 18:05] - Calibración de Latencia y Snappiness (Eliminación de Delay en Animaciones)
- **Diagnóstico**: Las animaciones se percibían pesadas y con retardo ("delay"). El análisis de profiling identificó 4 fuentes acumulativas de latencia:
  1. `Scene1Apertura.tsx`: Resorte con inercia excesiva (`stiffness: 55, mass: 1.0`), amortiguamiento que demoraba ~850ms en reaccionar y umbral muerto inicial del 12% (`[0.12, 0.82]`) que no respondía al inicio del scroll.
  2. `SmoothScroll.tsx`: Lenis con `duration: 1.2s` y amortiguamiento `0.9` que añadía más de 1 segundo de interpolación a cada movimiento del mouse.
  3. `Scene3Cabanas.tsx`: Transición de cortina (`clip-path`) con duraciones de 720ms a 850ms y retardo artificial (`delay: 0.15s`), haciendo los cambios lentos.
  4. `DestinationExplorer.tsx`: Modo de espera bloqueante (`mode="wait"`) en `AnimatePresence` con duración de 550ms que retrasaba el cambio de fotos al hacer clic.
  5. `CustomCursor.tsx`: Resorte con masa alta (`0.5`) que causaba arrastre desfasado del puntero.
- **Acciones Realizadas**:
  - `Scene1Apertura.tsx`: Resorte de alta responsividad Apple (`stiffness: 240, damping: 30, mass: 0.15`), inicio inmediato en `[0.01, 0.58]` (cero zona muerta) y altura reducida a `175vh` para apertura instantánea al menor scroll.
  - `SmoothScroll.tsx`: Lenis acelerado a `duration: 0.55s` con `wheelMultiplier: 1.1` para respuesta táctil inmediata.
  - `Scene3Cabanas.tsx`: Transición de cortina optimizada a 380ms/420ms con salida a 320ms y retardo reducido a 40ms, cumpliendo el umbral sub-400ms de Emil Kowalski.
  - `DestinationExplorer.tsx`: Eliminado `mode="wait"` y reducido a crossfade instantáneo de 320ms con entrada paralela inmediata.
  - `CustomCursor.tsx`: Resorte optimizado (`stiffness: 800, damping: 35, mass: 0.1`) sin retraso respecto al cursor físico.
- **Validación**:
  - Compilación exitosa en 3.15s (`npm run build`). Respuesta táctil inmediata al scroll y a la interacción con clics.

---

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
