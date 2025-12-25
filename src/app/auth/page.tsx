'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Проверь почту для подтверждения!');
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = '/'; // Идем на график после входа
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#131722] text-white">
      <div className="bg-[#1c2028] p-8 rounded-xl border border-[#2a2e39] w-80 shadow-2xl">
        <h1 className="text-2xl font-black italic mb-6 text-center text-blue-500">POCKET LOGIN</h1>
        <input 
          type="email" placeholder="Email" 
          className="w-full bg-[#262b34] p-3 rounded mb-3 border border-[#333a47]"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Пароль" 
          className="w-full bg-[#262b34] p-3 rounded mb-6 border border-[#333a47]"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSignIn} className="w-full bg-blue-600 py-3 rounded font-bold mb-3">ВОЙТИ</button>
        <button onClick={handleSignUp} className="w-full border border-gray-600 py-3 rounded font-bold text-sm opacity-70">РЕГИСТРАЦИЯ</button>
      </div>
    </div>
  );
}