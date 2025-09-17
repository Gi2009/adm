import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface WelcomeProps {
  onContinue: () => void;
}

// Componente do Ícone de Canoa - Vista de Cima e Mais Fina
function CanoeIcon() {
  const [rotated, setRotated] = useState(false);

  return (
    <div
      onClick={() => setRotated(!rotated)}
      title="Remando com estilo!"
      className={`w-24 h-24 bg-gradient-to-br from-blue-500 to-green-400 rounded-full flex items-center justify-center shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),_0_4px_6px_-2px_rgba(0,0,0,0.05)] relative cursor-pointer
        animate-pulse-subtle
        ${rotated ? "rotate-12" : "rotate-0"}
        transition-transform duration-500
      `}
      style={{
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDuration: "3s",
      }}
    >
      <svg
        className="w-20 h-20 text-white"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Corpo principal da canoa (vista de cima) */}
        <path
          d="M4 10C4 6 8 4 12 4C16 4 20 6 20 10C20 14 16 16 12 16C8 16 4 14 4 10Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Divisórias internas */}
        <line x1="7" y1="5.5" x2="7" y2="14.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="12" y1="4" x2="12" y2="16" stroke="currentColor" strokeWidth="0.8" />
        <line x1="17" y1="5.5" x2="17" y2="14.5" stroke="currentColor" strokeWidth="0.8" />
        
        {/* Remos (vista de cima) */}
        <g className={rotated ? "opacity-100" : "opacity-70"} stroke="currentColor" strokeWidth="1">
          <line x1="5" y1="8" x2="2" y2="6" />
          <line x1="5" y1="12" x2="2" y2="14" />
          <line x1="19" y1="8" x2="22" y2="6" />
          <line x1="19" y1="12" x2="22" y2="14" />
        </g>
        
        {/* Detalhes de água */}
        <g className="opacity-60" stroke="currentColor" strokeWidth="0.6">
          <path d="M3 7C3.5 7.5 4.5 7.2 5 7" />
          <path d="M3 13C3.5 12.5 4.5 12.8 5 13" />
          <path d="M21 7C20.5 7.5 19.5 7.2 19 7" />
          <path d="M21 13C20.5 12.5 19.5 12.8 19 13" />
        </g>
      </svg>
    </div>
  );
}

const Welcome = ({ onContinue }: WelcomeProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-100 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-emerald-200 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-teal-200 rounded-full blur-2xl opacity-40"></div>
        
        {/* Padrão de ondas sutis */}
        <div className="absolute bottom-0 w-full opacity-10">
          <svg width="100%" height="80" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      <div className="relative text-center space-y-8 max-w-2xl z-10">
              {/* Logo/Ícone */}
              <img 
        src="/kanoa_com.png" 
        alt="Logo" 
        /*className="w-8 h-8 object-contain rounded-full" */
      />

        {/* Título */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 tracking-tight">Bem-vindo</h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-lg mx-auto leading-relaxed">
            Conecte-se com a natureza e as tradições ancestrais das comunidades caiçaras
          </p>
        </div>

        {/* Botão */}
        <div className="pt-8">
          <Button
            onClick={onContinue}
            size="lg"
            className="px-12 py-6 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Iniciar Jornada
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;