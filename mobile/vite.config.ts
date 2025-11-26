import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
//import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,

    allowedHosts: [
      'chubler-jonathan-unserenely.ngrok-free.dev',
      '.ngrok-free.dev' // Permite todos os subdomínios ngrok
    ]
  },
  plugins: [
    react(),
  
    
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 🔽 ADICIONE ESTAS CONFIGURAÇÕES PARA O CAPACITOR 🔽
  build: {
    outDir: 'dist', // Diretório de build do Vite
    emptyOutDir: true, // Limpa o diretório antes de construir
  },
  // Configuração base importante para o Capacitor
  base: './',
}));
