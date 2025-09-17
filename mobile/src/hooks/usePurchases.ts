// hooks/usePurchases.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Purchase {
  id: number;
  user_id: string;
  experiencia_id: number;
  data_compra: string;
  status: string;
  valor: number;
  experiencias_dis: {
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
  };
}

export const usePurchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPurchases();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('compras_experiencias')
        .select(`
          *,
          experiencias_dis (*)
        `)
        .eq('user_id', user?.id)
        .order('data_compra', { ascending: false });

      if (error) {
        console.error('Erro ao buscar compras:', error);
        return;
      }

      setPurchases(data as unknown as Purchase[] || []);
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
    } finally {
      setLoading(false);
    }
  };

  return { purchases, loading, refetch: fetchPurchases };
};