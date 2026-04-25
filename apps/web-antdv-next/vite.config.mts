import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api/v1': {
            changeOrigin: true,
            // 直接转发 /api/v1 到后端，不需要 rewrite
            target: 'http://localhost:8080',
            ws: true,
          },
        },
      },
    },
  };
});
