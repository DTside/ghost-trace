'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReg = (e: any) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push('/trade'), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6 text-white font-sans relative">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase"><ArrowLeft size={18}/> На главную</Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="w-12 h-12 border border-blue-500/30 bg-blue-500/10 rounded-xl flex items-center justify-center font-black text-2xl text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] mx-auto mb-4">G</div>
            <h1 className="text-2xl font-black">Создать аккаунт</h1>
            <p className="text-gray-500">Присоединяйтесь к Ghost Trace</p>
        </div>
        <form onSubmit={handleReg} className="bg-[#161b22] border border-[#2a2e39] rounded-2xl p-8 space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                <input type="email" required className="w-full bg-[#0d1117] border border-[#2a2e39] rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold" placeholder="name@example.com"/>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Пароль</label>
                <input type="password" required className="w-full bg-[#0d1117] border border-[#2a2e39] rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold" placeholder="••••••••"/>
            </div>
            <button disabled={loading} className="w-full bg-green-600 hover:bg-green-500 h-12 rounded-xl font-bold uppercase transition-colors flex items-center justify-center">
                {loading ? <Loader2 className="animate-spin"/> : 'Зарегистрироваться'}
            </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">Есть аккаунт? <Link href="/login" className="text-blue-500 font-bold hover:underline">Войти</Link></p>
      </div>
    </div>
  );
}