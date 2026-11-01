import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base: the site works from any sub-folder (e.g. https://user.github.io/repo/).
export default defineConfig({ base: './', plugins: [react()] })
