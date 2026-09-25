import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5178,
    strictPort: true,
    // Windows file-change events are sometimes missed, which leaves the dev
    // page showing old code. Polling is slightly heavier but always notices.
    watch: { usePolling: true, interval: 300 },
  },
});
