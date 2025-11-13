-- Create RLS policy to allow type 3 users to read candidates data
CREATE POLICY "Usuários tipo 3 podem ver candidatos" 
ON candidatos_oferec 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.type = '3'
  )
);