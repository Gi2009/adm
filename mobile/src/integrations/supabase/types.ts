export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
        candidatos_aprovados: {
        Row: {
          candidato_id: number
          created_at: string
          email: string
          expires_at: string
          id: string
          nome: string | null
          token: string
          usado: boolean
        }
        Insert: {
          candidato_id: number
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          nome?: string | null
          token: string
          usado?: boolean
        }
        Update: {
          candidato_id?: number
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          nome?: string | null
          token?: string
          usado?: boolean
        }
        Relationships: []
      }
      candidatos_oferec: {
        Row: {
          associacao: string | null
          comunidade: string | null
          cont_asso: string | null
          created_at: string
          email: string | null
          endereco: string | null
          exp_prevista: string | null
          id: number
          idade: string | null
          municipio: string | null
          nome: string | null
          telefone: string | null
          url_foto_documento: string | null
          url_comprovante_endereco: string | null
        }
        Insert: {
          associacao?: string | null
          comunidade?: string | null
          cont_asso?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          exp_prevista?: string | null
          id?: number
          idade?: string | null
          municipio?: string | null
          nome?: string | null
          telefone?: string | null
          url_foto_documento?: string | null
          url_comprovante_endereco?: string | null
        }
        Update: {
          associacao?: string | null
          comunidade?: string | null
          cont_asso?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          exp_prevista?: string | null
          id?: number
          idade?: string | null
          municipio?: string | null
          nome?: string | null
          telefone?: string | null
          url_foto_documento?: string | null
          url_comprovante_endereco?: string | null
        }
        Relationships: []
      }
      experiencias_dis: {
        Row: {
          created_at: string
          datas_disponiveis: string[] | null
          descricao: string | null
          duracao: string | null
          id: number
          id_dono: string | null
          img: string | null
          incluso: string | null
          local: string
          preco: number | null
          quantas_p: number | null
          tipo: number | null
          titulo: string | null
        }
        Insert: {
          created_at?: string
          datas_disponiveis?: string[] | null
          descricao?: string | null
          duracao?: string | null
          id?: number
          id_dono?: string | null
          img?: string | null
          incluso?: string | null
          local?: string
          preco?: number | null
          quantas_p?: number | null
          tipo?: number | null
          titulo?: string | null
        }
        Update: {
          created_at?: string
          datas_disponiveis?: string[] | null
          descricao?: string | null
          duracao?: string | null
          id?: number
          id_dono?: string | null
          img?: string | null
          incluso?: string | null
          local?: string
          preco?: number | null
          quantas_p?: number | null
          tipo?: number | null
          titulo?: string | null
        }
        Relationships: []
      }
      experiencias_analise: {
        Row: {
          created_at: string
          datas_disponiveis: string[] | null
          descricao: string | null
          duracao: string | null
          id: number
          id_dono: string | null
          img: string | null
          incluso: string | null
          local: string
          preco: number | null
          quantas_p: number | null
          tipo: number | null
          titulo: string | null
        }
        Insert: {
          created_at?: string
          datas_disponiveis?: string[] | null
          descricao?: string | null
          duracao?: string | null
          id?: number
          id_dono?: string | null
          img?: string | null
          incluso?: string | null
          local?: string
          preco?: number | null
          quantas_p?: number | null
          tipo?: number | null
          titulo?: string | null
        }
        Update: {
          created_at?: string
          datas_disponiveis?: string[] | null
          descricao?: string | null
          duracao?: string | null
          id?: number
          id_dono?: string | null
          img?: string | null
          incluso?: string | null
          local?: string
          preco?: number | null
          quantas_p?: number | null
          tipo?: number | null
          titulo?: string | null
        }
        Relationships: []
      }
      compras_experiencias: {
        Row: {
          id: number
          user_id: string
          experiencia_id: number
          data_compra: string
          status: string
          valor: number
          detalhes_pagamento: Json | null
          created_at: string
          quantidade_ingressos: number
          data_experiencia: string | null
        }
        Insert: {
          id?: number
          user_id: string
          experiencia_id: number
          data_compra?: string
          status?: string
          valor: number
          detalhes_pagamento?: Json | null
          created_at?: string
          quantidade_ingressos: number
          data_experiencia?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          experiencia_id?: number
          data_compra?: string
          status?: string
          valor?: number
          detalhes_pagamento?: Json | null
          created_at?: string
          quantidade_ingressos?: number
          data_experiencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compras_experiencias_experiencia_id_fkey"
            columns: ["experiencia_id"]
            referencedRelation: "experiencias_dis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_experiencias_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      favoritos: {
        Row: {
          created_at: string
          experiencia_id: number
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experiencia_id: number
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experiencia_id?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_experiencia_id_fkey"
            columns: ["experiencia_id"]
            isOneToOne: false
            referencedRelation: "experiencias_dis"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          associação: string | null
          cpf: string
          created_at: string
          id: string
          local: string | null
          nome: string
          telefone: string
          type: string
          updated_at: string
          user_id: string
          foto_usu: string
          email: string
        }
        Insert: {
          email: string
          associação?: string | null
          cpf: string
          created_at?: string
          id?: string
          local?: string | null
          nome: string
          telefone: string
          type: string
          updated_at?: string
          user_id: string
          foto_usu?: string
        }
        Update: {
          email: string
          associação?: string | null
          cpf?: string
          created_at?: string
          id?: string
          local?: string | null
          nome?: string
          telefone?: string
          type?: string
          updated_at?: string
          user_id?: string
          foto_usu?: string
        }
        Relationships: []
      }
      dados_bancarios: {
        Row: {
          user_id: string
          email_paypal: string | null
          nome_titular: string | null
          cpf_titular: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          user_id: string
          email_paypal?: string | null
          nome_titular?: string | null
          cpf_titular?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          email_paypal?: string | null
          nome_titular?: string | null
          cpf_titular?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const