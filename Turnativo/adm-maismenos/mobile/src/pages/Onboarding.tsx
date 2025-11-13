import { Button } from "@/components/ui/button";
import comunidadeCaicara from "@/assets/comunidade-caicara.jpg";

interface OnboardingProps {
  onContinue: () => void;
}

const Onboarding = ({ onContinue }: OnboardingProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 relative overflow-hidden">
      {/* Imagem de fundo */}
      <div className="absolute inset-0">
        <img 
          src={comunidadeCaicara} 
          alt="Comunidade Caiçara tradicional" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent"></div>
      </div>

      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Título principal */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-tight">
              Descubra, Respeite<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                e Pertença
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Viaje com propósito pelas comunidades caiçaras.<br />
              <span className="text-foreground font-medium">
                Fortaleça a cultura, preserve o território, viva o que é verdadeiro.
              </span>
            </p>
          </div>

          {/* Imagem em destaque */}
          <div className="relative max-w-2xl mx-auto my-12">
            <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-ocean)] border border-border/50">
              <img 
                src={comunidadeCaicara} 
                alt="Comunidade Caiçara tradicional" 
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          </div>

          {/* Call to action */}
          <div className="space-y-6">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Experiências autênticas
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                Turismo responsável
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                Preservação cultural
              </span>
            </div>

            <Button 
              onClick={onContinue}
              size="lg"
              className="px-16 py-6 text-lg font-semibold rounded-full shadow-[var(--shadow-ocean)] hover:shadow-[var(--shadow-wave)] transition-all duration-300"
            >
              Começar Jornada
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;