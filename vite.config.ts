import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "https://github.com/FaceLe-ss/Pathfinder_webapp", // <--- имя репозитория
  plugins: [react()],
});
