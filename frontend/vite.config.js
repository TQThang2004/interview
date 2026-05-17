import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,       // Cố định port, tránh nhảy sang 5174 gây lỗi CORS & Google OAuth
    strictPort: true, // Báo lỗi ngay nếu 5173 bị chiếm (thay vì nhảy port)
  },
})
