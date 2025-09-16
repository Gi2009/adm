import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  type: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  sender_profile?: Profile;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  profile?: Profile;
  last_message?: string;
}

const Chat = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser && currentUserProfile) {
      loadConversations();
      loadAvailableUsers();
    }
  }, [currentUser, currentUserProfile]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      
      // Subscribe to real-time messages
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${currentUser.id}`
          },
          (payload) => {
            if (payload.new.sender_id === getOtherUserId() || 
                payload.new.recipient_id === getOtherUserId()) {
              loadMessages();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation, currentUser]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para acessar o chat.",
          variant: "destructive",
        });
        return;
      }

      setCurrentUser(user);

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.type !== '3') {
        toast({
          title: "Acesso Negado",
          description: "Apenas administradores podem acessar o chat.",
          variant: "destructive",
        });
        return;
      }

      setCurrentUserProfile(profile);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar autenticação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const { data: convos } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (
            content,
            created_at
          )
        `)
        .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
        .order('last_message_at', { ascending: false });

      if (convos) {
        const conversationsWithProfiles = await Promise.all(
          convos.map(async (conv) => {
            const otherUserId = conv.user1_id === currentUser.id ? conv.user2_id : conv.user1_id;
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', otherUserId)
              .single();

            return {
              ...conv,
              profile,
              last_message: conv.messages?.[0]?.content || 'Sem mensagens'
            };
          })
        );

        setConversations(conversationsWithProfiles);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('type', ['1', '2'])
        .neq('user_id', currentUser.id);

      if (profiles) {
        // Filter out users who already have conversations
        const existingUserIds = conversations.map(conv => 
          conv.user1_id === currentUser.id ? conv.user2_id : conv.user1_id
        );
        
        const availableProfiles = profiles.filter(profile => 
          !existingUserIds.includes(profile.user_id)
        );

        setAvailableUsers(availableProfiles);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários disponíveis:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;

    const otherUserId = getOtherUserId();

    try {
      const { data: msgs } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!sender_id (*)
        `)
        .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (msgs) {
        setMessages(msgs);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const getOtherUserId = () => {
    if (!selectedConversation) return '';
    return selectedConversation.user1_id === currentUser.id 
      ? selectedConversation.user2_id 
      : selectedConversation.user1_id;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const otherUserId = getOtherUserId();

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: otherUserId,
          content: newMessage.trim()
        });

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      setNewMessage("");
      loadMessages();
      loadConversations();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem.",
        variant: "destructive",
      });
    }
  };

  const startNewConversation = async (profile: Profile) => {
    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${profile.user_id}),and(user1_id.eq.${profile.user_id},user2_id.eq.${currentUser.id})`)
        .single();

      if (existingConv) {
        setSelectedConversation({ ...existingConv, profile });
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: currentUser.id,
          user2_id: profile.user_id
        })
        .select()
        .single();

      if (error) throw error;

      const conversationWithProfile = { ...newConv, profile };
      setSelectedConversation(conversationWithProfile);
      setConversations(prev => [conversationWithProfile, ...prev]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao iniciar conversa.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!currentUserProfile || currentUserProfile.type !== '3') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-lg mb-4">Acesso negado. Apenas administradores podem acessar o chat.</div>
        <Button asChild>
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 h-screen flex flex-col">
        <div className="mb-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/candidates-dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Chat - Administrador</h1>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Conversations List */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="p-4 space-y-2">
                  {conversations.map((conv) => (
                    <Button
                      key={conv.id}
                      variant={selectedConversation?.id === conv.id ? "secondary" : "ghost"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {conv.profile?.nome.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">
                            {conv.profile?.nome}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {conv.last_message}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}

                  {availableUsers.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Iniciar nova conversa:
                      </div>
                      {availableUsers.map((user) => (
                        <Button
                          key={user.id}
                          variant="outline"
                          className="w-full justify-start h-auto p-3"
                          onClick={() => startNewConversation(user)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.nome.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">{user.nome}</div>
                              <div className="text-xs text-muted-foreground">
                                Tipo {user.type === '1' ? 'Candidato' : 'Provedor'}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="col-span-1 md:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedConversation.profile?.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{selectedConversation.profile?.nome}</div>
                      <div className="text-sm font-normal text-muted-foreground">
                        {selectedConversation.profile?.telefone}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-[calc(100vh-280px)]">
                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-4 p-2">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender_id === currentUser.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;