import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ExperienceList from "@/components/experiences/ExperienceList";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-teal-100 pb-20">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-ocean-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-ocean-800">Kanoa</h1>
          <Button variant="outline" onClick={signOut} className="border-ocean-300 text-ocean-700 hover:bg-ocean-50">
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-ocean-900 mb-4">
            Bem-vindo, {user?.user_metadata?.nome || user?.email}!
          </h2>
          <p className="text-xl text-ocean-700 max-w-2xl mx-auto">
            Descubra experiências únicas conectando-se com a natureza e os povos tradicionais do Brasil
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-ocean-800 mb-6">Experiências Disponíveis</h3>
          <ExperienceList />
        </div>
      </main>
    </div>
  );
};

export default Index;
