import { useState, useEffect, useCallback } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ExperienceCard from "@/components/experiences/ExperienceCard";
import ExperienceDetails from "@/components/experiences/ExperienceDetails";

   export interface Experience {
     id: number;
     titulo: string;
     img: string;
     local: string;
     preco: number;
     descricao: string;
     incluso: string;
     duração: string;
     quantas_p: number;
     data_experiencia?: string; // optional
     id_dono: string;
     tipo: number;
     created_at: string;
   }


   interface RawExperience {
  id: number;
  titulo: string;
  img: string;
  local: string;
  preco: number;
  descricao: string;
  incluso: string;
  duração: string;
  quantas_p: number;
  data_experiencia: string; // aqui é obrigatório, pois existe no banco
  id_dono: string;
  tipo: number;
  created_at: string;
}

const Search = () => {
  const { user, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredExperiences([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(() => {
      filterExperiences();
      setSearchLoading(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, experiences]);

  const fetchExperiences = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('experiencias_dis')
        .select('*')
        .order('created_at', { ascending: false });


      if (error) throw error;
      
      // Map the data to ensure it matches the Experience interface
      const formattedData: Experience[] = (data || []).map(item => ({
        id: item.id || 0,
        titulo: item.titulo || '',
        img: item.img || '',
        local: item.local || '',
        preco: item.preco || 0,
        descricao: item.descricao || '',
        incluso: item.incluso || '',
        duração: item.duração || '',
        quantas_p: item.quantas_p || 0,
      /*  ...(item.data_experiencia ? { data_experiencia: item.data_experiencia } : {}),*/
        id_dono: item.id_dono || '',
        tipo: item.tipo || 0,
        created_at: item.created_at || ''
      }));
      
      setExperiences(formattedData);
    } catch (error) {
      console.error('Erro ao buscar experiências:', error);
      setError('Falha ao carregar experiências. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filterExperiences = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredExperiences([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = experiences.filter(experience => {
      return (
        experience.titulo?.toLowerCase().includes(searchLower) ||
        experience.local?.toLowerCase().includes(searchLower) ||
        experience.descricao?.toLowerCase().includes(searchLower) ||
        experience.preco?.toString().includes(searchTerm)
      );
    });

    setFilteredExperiences(filtered);
  }, [searchTerm, experiences]);

  const handleCardClick = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-teal-100 pb-20">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-ocean-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-ocean-800">Pesquisar</h1>
          <div className="flex items-center gap-4">

            <Button variant="outline" onClick={signOut} className="border-ocean-300 text-emerald-700 hover:bg-emerald-50">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative mb-8">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Buscar experiências por nome, local, descrição ou preço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin" size={20} />
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
              <Button variant="ghost" onClick={fetchExperiences} className="ml-4 text-red-700 hover:bg-red-100">
                Tentar novamente
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center text-muted-foreground flex flex-col items-center">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Carregando experiências...</p>
            </div>
          )}

          {!loading && searchTerm && filteredExperiences.length > 0 && (
            <div>
              <p className="text-center text-muted-foreground mb-6">
                {filteredExperiences.length} experiência(s) encontrada(s) para: "{searchTerm}"
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {filteredExperiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    onClick={() => handleCardClick(experience)}
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && searchTerm && !searchLoading && filteredExperiences.length === 0 && (
            <div className="text-center text-muted-foreground">
              <SearchIcon size={64} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma experiência encontrada para: "{searchTerm}"</p>
              <p className="text-sm mt-2">Tente buscar por nome, local, descrição ou preço.</p>
            </div>
          )}

          {!loading && !searchTerm && (
            <div className="text-center text-muted-foreground">
              <SearchIcon size={64} className="mx-auto mb-4 opacity-50" />
              <p>Digite algo para começar a pesquisar experiências.</p>
              <p className="text-sm mt-2">Você pode buscar por nome, local, descrição ou preço.</p>
            </div>
          )}
        </div>
      </main>

      {selectedExperience && (
        <ExperienceDetails
          experience={selectedExperience}
          open={isDetailsOpen}
          onOpenChange={(open) => setIsDetailsOpen(open)}
        />
      )}
    </div>
  );
};

export default Search;