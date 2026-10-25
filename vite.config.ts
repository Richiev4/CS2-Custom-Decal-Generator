import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig, Plugin} from 'vite';

function htmlSectionsPlugin(): Plugin {
  return {
    name: 'html-sections-plugin',
    transformIndexHtml(html: string) {
      function expandIncludes(content: string, depth = 0): string {
        if (depth > 10) return content;
        const includeRegex = /<include\s+src=["']([^"']+)["']\s*(?:\/>|><\/include>)/g;
        if (!includeRegex.test(content)) return content;

        return content.replace(includeRegex, (_match, src) => {
          const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
          const filePath = path.resolve(__dirname, cleanSrc);
          if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            return expandIncludes(fileContent, depth + 1);
          }
          console.warn(`[html-sections-plugin] Could not resolve include: ${filePath}`);
          return `<!-- Missing include: ${src} -->`;
        });
      }

      return expandIncludes(html);
    },
    handleHotUpdate({file, server}) {
      if (file.endsWith('.html')) {
        server.ws.send({type: 'full-reload'});
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [htmlSectionsPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
