// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'lucide-react',
        'framer-motion',
        '@nanostores/react',
        'nanostores'
      ]
    },
    ssr: {
      noExternal: ['lucide-react', 'framer-motion', '@nanostores/react']
    }
  }
});