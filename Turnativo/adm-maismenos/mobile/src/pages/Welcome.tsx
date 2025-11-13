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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-100 flex flex-col items-center pt-12 p-4">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden">
        {/* ... seus elementos decorativos ... */}
      </div>

      <div className="relative text-center space-y-8 max-w-2xl z-10">
        {/* Logo/Ícone */}
        <div className="flex justify-center">
          <img 
            src="/kanoa_logo.png" 
            alt="Logo" 
            className="w-90 h-100 object-contain rounded-full"
          />
        </div>

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