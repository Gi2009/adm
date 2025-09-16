import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ExperienceCard from "./ExperienceCard";
import ExperienceDetails from "./ExperienceDetails";
import { Loader2 } from "lucide-react";

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
  data_experiencia?: string; 
}

const ExperienceList = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experiencias_dis' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar experiências:', error);
        return;
      }

      setExperiences((data as unknown as Experience[]) || []);
    } catch (error) {
      console.error('Erro ao buscar experiências:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando experiências...</span>
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma experiência cadastrada ainda.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiences.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            onClick={() => handleCardClick(experience)}
          />
        ))}
      </div>

      <ExperienceDetails
        experience={selectedExperience}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  );
};

export default ExperienceList;