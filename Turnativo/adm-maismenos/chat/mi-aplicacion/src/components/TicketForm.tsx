'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface TicketFormProps {
  onCreated: () => void;
}

export default function TicketForm({ onCreated }: TicketFormProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Por favor, digite um título para o ticket');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from('tickets')
        .insert([{ 
          title: title.trim(),
          created_at: new Date().toISOString()
        }]);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setTitle('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex gap-2 items-start">
      <div className="flex-grow">
        <input
          type="text"
          placeholder="Título do ticket"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={loading}
          maxLength={100}
        />
        {error && (
          <p className="text-red-600 text-sm mt-1">{error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
      >
        {loading ? 'Criando...' : 'Criar'}
      </button>
    </form>
  );
}