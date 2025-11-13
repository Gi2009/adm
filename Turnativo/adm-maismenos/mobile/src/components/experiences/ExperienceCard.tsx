import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

interface ExperienceCardProps {
  experience: {
    id: number;
    titulo: string;
    img: string;
    local: string;
    preco: number;
  };
  onClick: () => void;
}

const ExperienceCard = ({ experience, onClick }: ExperienceCardProps) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite(experience.id)) {
      removeFromFavorites(experience.id);
    } else {
      addToFavorites(experience.id);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={experience.img} 
          alt={experience.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white"
          onClick={handleFavoriteClick}
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite(experience.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-foreground">{experience.titulo}</h3>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground text-sm">{experience.local}</p>
          <p className="font-bold text-primary">R$ {experience.preco?.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExperienceCard;