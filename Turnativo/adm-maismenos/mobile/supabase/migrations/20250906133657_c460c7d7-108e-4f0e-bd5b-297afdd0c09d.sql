-- Adicionar campo data_experiencia nas tabelas de experiências
ALTER TABLE public.experiencias_analise 
ADD COLUMN data_experiencia DATE;

ALTER TABLE public.experiencias_dis 
ADD COLUMN data_experiencia DATE;