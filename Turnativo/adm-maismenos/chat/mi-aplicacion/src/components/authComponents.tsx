'use client'
import React, { useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthComponent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function signIn() {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    router.push('/');
  }

  async function signUp() {
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) return alert(error.message);
    // Create profile row server-side via RPC or API (example below: call an API)
    await fetch('/api/create-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: data.user?.id, email })
    });
    router.push('/');
  }

  async function signOut() {
    await supabaseClient.auth.signOut();
    router.push('/auth');
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Entrar / Registrar</h2>
      <input className="w-full mb-2 p-2 border rounded" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input className="w-full mb-4 p-2 border rounded" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="senha" />
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={signIn}>Entrar</button>
        <button className="px-4 py-2 border rounded" onClick={signUp}>Registrar</button>
        <button className="px-4 py-2 text-sm" onClick={signOut}>Sair</button>
      </div>
    </div>
  );
}
