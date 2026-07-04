import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/CueTimer/' : '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      base: '/CueTimer/',
      manifest: {
        name: 'Cue Timer',
        short_name: 'CueTimer',
        description: 'Film and stage cue timer',
        theme_color: '#0b0d0a',
        background_color: '#0b0d0a',
        display: 'standalone',
        scope: '/CueTimer/',
        start_url: '/CueTimer/',
        icons: [
          { src: 'icons/192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
}));
