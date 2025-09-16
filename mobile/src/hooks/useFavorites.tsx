import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Favorite {
  id: string;
  experiencia_id: number;
  created_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (experienciaId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favoritos')
        .insert({
          user_id: user.id,
          experiencia_id: experienciaId
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Experiência adicionada aos favoritos!",
      });

      fetchFavorites();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar aos favoritos",
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = async (experienciaId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', user.id)
        .eq('experiencia_id', experienciaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Experiência removida dos favoritos!",
      });

      fetchFavorites();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover dos favoritos",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (experienciaId: number) => {
    return favorites.some(fav => fav.experiencia_id === experienciaId);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    fetchFavorites
  };
};