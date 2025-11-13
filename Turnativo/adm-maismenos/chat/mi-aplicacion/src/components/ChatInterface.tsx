'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface TicketResponse {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  created_at: string;
}

interface Props {
  ticketId: string;
}

export default function ChatInterface({ ticketId }: Props) {
  const [messages, setMessages] = useState<TicketResponse[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (!error && data) setMessages(data);
      setLoading(false);
    }

    fetchMessages();

    // Realtime subscription para respostas do ticket
    const subscription = supabase
      .channel(`ticket_responses:${ticketId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_responses', filter: `ticket_id=eq.${ticketId}` },
        payload => {
          setMessages(prev => [...prev, payload.new as TicketResponse]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await supabase.from('ticket_responses').insert([{ ticket_id: ticketId, message: newMessage }]);
    setNewMessage('');
  }

  if (loading) return <p>Carregando mensagens...</p>;

  return (
    <div className="flex flex-col h-full border rounded p-4">
      <div className="flex-grow overflow-y-auto mb-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className="p-2 border rounded bg-gray-100">
            <p>{msg.message}</p>
            <small className="text-gray-400">{new Date(msg.created_at).toLocaleString()}</small>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-grow border p-2 rounded"
          placeholder="Digite sua mensagem"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">
          Enviar
        </button>
      </form>
    </div>
  );
}