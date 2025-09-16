import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import ExperienceCard from "@/components/experiences/ExperienceCard";
import ExperienceDetails from "@/components/experiences/ExperienceDetails";
import { Loader2, Heart } from "lucide-react";

interface Experience {
  id: number;
  titulo: string;
  img: string;
  local: string;
  preco: number;
  descricao: string;
  incluso: string;
  quantas_p: number;
  duração: string;
  tipo: number;
  data_experiencia: string;
}

const Favorites = () => {
  const { signOut } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [favoriteExperiences, setFavoriteExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteExperiences();
  }, [favorites]);

  const fetchFavoriteExperiences = async () => {
    if (favorites.length === 0) {
      setFavoriteExperiences([]);
      setLoading(false);
      return;
    }

    try {
      const favoriteIds = favorites.map(fav => fav.experiencia_id);
      const { data, error } = await supabase
        .from('experiencias_dis')
        .select('*')
        .in('id', favoriteIds);

      if (error) {
        console.error('Erro ao buscar experiências favoritas:', error);
        return;
      }

      setFavoriteExperiences((data as unknown as Experience[]) || []);
    } catch (error) {
      console.error('Erro ao buscar experiências favoritas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsDetailsOpen(true);
  };

  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-teal-100 pb-20">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-ocean-200">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-ocean-800">Favoritos</h1>
            <Button variant="outline" onClick={signOut} className="border-ocean-300 text-ocean-700 hover:bg-ocean-50">
              Sair
            </Button>
          </div>
        </header>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando favoritos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-teal-100 pb-20">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-ocean-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-ocean-800">Favoritos</h1>
          <Button variant="outline" onClick={signOut} className="border-ocean-300 text-ocean-700 hover:bg-emerald-50">
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-pink-500 mr-2" />
            <h2 className="text-3xl font-bold text-ocean-900">Suas Experiências Favoritas</h2>
          </div>
          <p className="text-ocean-700">
            Aqui estão todas as experiências que você marcou como favoritas
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {favoriteExperiences.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum favorito ainda</h3>
              <p className="text-gray-500">Explore as experiências e marque suas favoritas!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteExperiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  onClick={() => handleCardClick(experience)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ExperienceDetails
        experience={selectedExperience}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default Favorites;