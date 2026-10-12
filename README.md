# 🏡 Guamal (Villa MCJ) - Frontend Web

[![Astro](https://img.shields.io/badge/Astro-7.3-BC52EE?logo=astro)](https://astro.build/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Portal web de residentes y administración para la comunidad y condominio **Villa MCJ / Guamal**. Desarrollado con **Astro 7**, componentes interactivos en **React 19** e islas de cliente optimizadas para carga ultrarrápida y SEO.

---

## 🚀 Características Principales

* **Portal de Residentes:** Consulta de estado de cuenta, histórico de pagos y solicitud de reservas.
* **Control de Accesos & Visitas:** Pre-registro de invitados con código de ingreso rápido para portería.
* **Seguimiento de Paquetería:** Visualización en tiempo real de correspondencia y paquetes recibidos.
* **Buzón PQRS:** Envío y seguimiento de peticiones, quejas y reclamos con la administración.
* **Reserva de Zonas Comunes:** Calendario interactivo para kiosco, piscina, salón social y BBQ.
* **Diseño Ultra Rápido (Islands Architecture):** Máximo rendimiento impulsado por la arquitectura de islas de Astro y micro-interacciones de **Framer Motion**.

---

## 🛠️ Stack Tecnológico

* **Framework Base:** [Astro 7](https://astro.build/)
* **Integración UI:** [React 19](https://react.dev/) (`@astrojs/react`)
* **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/) (`@tailwindcss/vite`)
* **Gestión de Estado:** [Nanostores](https://github.com/nanostores/nanostores) con persistencia local
* **Animaciones:** [Framer Motion](https://www.framer.com/motion/)
* **Iconografía:** `lucide-astro` y `lucide-react`
* **Servidor Web Producción:** Nginx en contenedor Docker

---

## 📂 Estructura del Proyecto

```
Front/
├── public/                 # Recursos públicos, favicons e imágenes
├── src/
│   ├── components/         # Componentes Astro y componentes interactivos React
│   ├── layouts/            # Plantillas maestras de diseño
│   ├── pages/              # Enrutador basado en archivos de Astro (.astro)
│   ├── stores/             # Almacenes de estado reactivos (Nanostores)
│   ├── styles/             # Estilos globales de Tailwind
│   └── types/              # Definiciones TypeScript de datos
├── .env.example            # Plantilla de variables de entorno
├── Dockerfile              # Empaquetado en contenedor Docker con Nginx
├── nginx.conf              # Configuración de proxy y servidor Nginx
├── astro.config.mjs        # Configuración de plugins y adaptadores Astro
└── package.json            # Dependencias y scripts
```

---

## ⚙️ Configuración e Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/jeisonMolina21/Guamal-Front.git
cd Guamal-Front
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de entorno
Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

Configura la URL de tu backend:
```env
PUBLIC_API_URL=http://localhost:3000
```

---

## ▶️ Scripts de Ejecución

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo local en `http://localhost:4321`. |
| `npm run build` | Compila el sitio estático optimizado en la carpeta `dist/`. |
| `npm run preview` | Previsualiza localmente el sitio compilado antes del despliegue. |

---

## 🔗 Repositorio Backend Relacionado
Este portal consume los servicios de la API:  
👉 [Guamal-Back](https://github.com/jeisonMolina21/Guamal-Back)

---

## 📄 Licencia
Este proyecto es privado e institucional.
