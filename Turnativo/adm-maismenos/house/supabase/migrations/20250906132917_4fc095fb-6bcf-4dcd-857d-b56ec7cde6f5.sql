-- Create RLS policy to allow type 3 users to insert experiences during approval process
CREATE POLICY "Usuários tipo 3 podem inserir experiências para aprovação" 
ON experiencias_dis 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.type = '3'
  )
);