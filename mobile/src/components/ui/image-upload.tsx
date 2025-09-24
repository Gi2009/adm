import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export const ImageUpload = ({ value, onChange, onRemove }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho do arquivo (máximo 30MB)
    if (file.size > 30 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 30MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('experiencias_img')
        .upload(fileName, file);

      if (error) throw error;

      // Obter URL pública
      const { data: publicData } = supabase.storage
        .from('experiencias_img')
        .getPublicUrl(data.path);

      onChange(publicData.publicUrl);
      
      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
   
      
      {value ? (
        <div className="relative">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onRemove}
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div 
          className="aspect-video bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={triggerFileInput}
        >
          <Upload className="mb-2 text-muted-foreground" size={32} />
          <p className="text-sm text-muted-foreground text-center">
            Clique para selecionar uma imagem
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Máximo 30MB - JPG, PNG, WEBP
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
      
      {!value && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={triggerFileInput}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="mr-2" size={16} />
          {uploading ? 'Enviando...' : 'Selecionar Imagem'}
        </Button>
      )}
    </div>
  );
};