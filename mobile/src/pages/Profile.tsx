import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { User, Mail, Calendar, Edit, Plus, Heart, LogOut, Edit3, ShoppingBag, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userType, setUserType] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('type, foto_usu')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }
      
      setUserType(data?.type || null);
      setAvatarUrl(data?.foto_usu || null);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const handleAvatarUpload = async (file: File) => {
  if (!user) return;
  
  setIsUploading(true);
  try {
    // Upload da imagem para o Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      throw uploadError;
    }

    // Obter a URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Atualizar o perfil do usuário com a nova URL do avatar
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        foto_usu: publicUrl,
        email: user.email
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError);
      throw updateError;
    }

    setAvatarUrl(publicUrl);
    
    toast({
      title: "Sucesso",
      description: "Foto de perfil atualizada com sucesso!",
    });
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    toast({
      title: "Erro",
      description: "Não foi possível fazer upload da imagem. Tente novamente.",
      variant: "destructive",
    });
  } finally {
    setIsUploading(false);
  }
};

  const handleOfferExperience = () => {
    if (userType === '2') {
      navigate('/manage-experiences');
    } else {
      navigate('/provider-application');
    }
  };

  const getUserInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const profileOptions = [
    {
      icon: <Edit3 className="w-5 h-5" />,
      title: "Editar Perfil",
      subtitle: "Altere suas informações pessoais",
      action: () => navigate("/editprofile")
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Favoritos",
      subtitle: "Experiências que você salvou",
      action: () => navigate("/favorites")
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: "Experiências Compradas",
      subtitle: "Suas reservas e histórico",
      action: () => navigate("/purchases")
    },
    {
      icon: <Plus className="w-5 h-5" />,
      title: "Oferecer Experiências",
      subtitle: "Compartilhe sua cultura",
      action:  handleOfferExperience
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-teal-100 pb-20">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-ocean-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-ocean-800">Perfil</h1>
          <Button variant="outline" onClick={signOut} className="border-ocean-300 text-ocean-700 hover:bg-emerald-50">
            Sair
          </Button>
        </div>
      </header>

      {/* Profile Header */}
      <div className="p-6">
        <Card className="card-experience p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Avatar" />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user?.email ? getUserInitials(user.email) : <User size={32} />}
                </AvatarFallback>
              </Avatar>
              
              <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 p-2 bg-primary rounded-full text-white shadow-lg cursor-pointer hover:bg-primary/90">
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAvatarUpload(e.target.files[0]);
                    }
                  }}
                  disabled={isUploading}
                />
              </label>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{user?.user_metadata?.nome || "Usuário"}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="text-emerald-600" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">Membro desde</p>
                  <p className="font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Conta verificada</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Profile Options */}
      <div className="px-6 space-y-3">
        {profileOptions.map((option, index) => (
          <Card 
            key={index}
            className="card-experience cursor-pointer hover:scale-[1.02] transition-all"
            onClick={option.action}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                </div>
                <div className="text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Profile;