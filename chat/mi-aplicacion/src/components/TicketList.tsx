'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Ticket {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export default function TicketList({ onSelect }: { onSelect: (ticket: Ticket) => void }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setTickets(data);
      setLoading(false);
    }

    fetchTickets();

    // Realtime subscription para novos tickets do usuário
    const subscription = supabase
      .channel('public:tickets')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tickets' },
        payload => {
          setTickets(prev => [payload.new as Ticket, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) return <p>Carregando tickets...</p>;
  if (tickets.length === 0) return <p>Nenhum ticket encontrado.</p>;

  return (
    <ul className="space-y-2">
      {tickets.map(ticket => (
        <li
          key={ticket.id}
          className="p-3 border rounded cursor-pointer hover:bg-gray-100"
          onClick={() => onSelect(ticket)}
        >
          <div className="flex justify-between">
            <strong>{ticket.title}</strong>
            <span className="text-sm text-gray-500">{ticket.status}</span>
          </div>
          <small className="text-gray-400">{new Date(ticket.created_at).toLocaleString()}</small>
        </li>
      ))}
    </ul>
  );
}