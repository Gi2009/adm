'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TicketForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.from('tickets').insert([{ title }]);
    if (error) setError(error.message);
    else {
      setTitle('');
      onCreated();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
      <input
        type="text"
        placeholder="Título do ticket"
        className="flex-grow border p-2 rounded"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
      >
        {loading ? 'Criando...' : 'Criar'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}

