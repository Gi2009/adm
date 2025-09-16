-- Create storage bucket for experience images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('experiencias_img', 'experiencias_img', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for experience images
CREATE POLICY "Anyone can view experience images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'experiencias_img');

CREATE POLICY "Authenticated users can upload experience images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'experiencias_img' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own experience images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'experiencias_img' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own experience images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'experiencias_img' AND auth.role() = 'authenticated');