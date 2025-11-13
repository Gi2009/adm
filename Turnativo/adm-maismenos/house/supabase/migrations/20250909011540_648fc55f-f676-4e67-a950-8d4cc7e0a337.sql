-- Criar tabela para controlar candidatos aprovados
CREATE TABLE public.candidatos_aprovados (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidato_id bigint NOT NULL,
  email text NOT NULL,
  nome text,
  token text NOT NULL UNIQUE,
  usado boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days')
);

-- Habilitar RLS
ALTER TABLE public.candidatos_aprovados ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção por usuários tipo 3 (administradores)
CREATE POLICY "Administradores podem inserir tokens de aprovação"
ON public.candidatos_aprovados
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.type = '3'
  )
);

-- Política para permitir leitura por token válido (para registro)
CREATE POLICY "Permitir leitura por token válido"
ON public.candidatos_aprovados
FOR SELECT
USING (true);

-- Política para atualizar token como usado
CREATE POLICY "Permitir atualização do status do token"
ON public.candidatos_aprovados
FOR UPDATE
USING (true);