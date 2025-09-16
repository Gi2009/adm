-- Enable RLS on experiencias_dis table
ALTER TABLE public.experiencias_dis ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read experiences (public data)
CREATE POLICY "Permitir leitura de experiências para todos" 
ON public.experiencias_dis 
FOR SELECT 
USING (true);

-- Create policy to allow authenticated users to insert their own experiences
CREATE POLICY "Usuários autenticados podem inserir experiências" 
ON public.experiencias_dis 
FOR INSERT 
WITH CHECK (auth.uid() = id_dono);

-- Create policy to allow users to update their own experiences
CREATE POLICY "Usuários podem atualizar suas próprias experiências" 
ON public.experiencias_dis 
FOR UPDATE 
USING (auth.uid() = id_dono);

-- Create policy to allow users to delete their own experiences
CREATE POLICY "Usuários podem deletar suas próprias experiências" 
ON public.experiencias_dis 
FOR DELETE 
USING (auth.uid() = id_dono);