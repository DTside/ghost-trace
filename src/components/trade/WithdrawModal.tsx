'use client';
import { useState, useEffect } from 'react';
import { X, ArrowRight, Wallet, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { useTradeStore } from '@/store/useTradeStore';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js'; // Добавил импорт

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export const WithdrawModal = ({ isOpen, onClose }: any) => {
  const { balanceReal, requestWithdrawal } = useTradeStore() as any;
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('USDT TRC-20');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  
  const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

  useEffect(() => {
    if(isOpen) {
        supabase.from('profiles').select('verification_level').eq('id', TEST_USER_ID).single()
          .then(({ data }) => setUserLevel(data?.verification_level || 1));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // БЛОКИРОВКА ЕСЛИ УРОВЕНЬ < 3
  if (userLevel < 3) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1e232d] w-[400px] rounded-2xl border border-red-500/20 p-8 text-center shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <Lock size={32}/>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Вывод недоступен</h2>
                <p className="text-gray-400 text-sm mb-6">
                    Для вывода средств необходим <strong>3-й уровень верификации</strong> (Подтверждение адреса).
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 bg-[#2a323d] py-3 rounded-xl text-gray-400 hover:text-white font-bold text-sm">Закрыть</button>
                    <a href="/verification" className="flex-1 bg-blue-600 py-3 rounded-xl text-white font-bold text-sm hover:bg-blue-500 flex items-center justify-center">Пройти</a>
                </div>
            </div>
        </div>
      );
  }

  const handleWithdraw = async () => {
    if (!amount || Number(amount) < 10) return toast.error('Минимум $10');
    if (!address) return toast.error('Укажите адрес кошелька');
    if (Number(amount) > balanceReal) return toast.error('Недостаточно средств');

    setIsSubmitting(true);
    const success = await requestWithdrawal({ userId: TEST_USER_ID, amount: Number(amount), network, address });
    setIsSubmitting(false);
    
    if (success) { onClose(); setAmount(''); setAddress(''); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e232d] w-[450px] rounded-2xl border border-[#2a323d] shadow-2xl overflow-hidden flex flex-col">
        <div className="h-14 border-b border-[#2a323d] flex items-center justify-between px-6 bg-[#1c2028]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Wallet size={16} className="text-orange-500"/> Вывод средств</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 flex flex-col gap-5">
            <div className="bg-[#262b34] p-4 rounded-xl border border-[#333a47] flex justify-between items-center">
                <span className="text-xs text-gray-400">Доступно:</span>
                <span className="text-lg font-black text-green-400">${balanceReal.toLocaleString()}</span>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Сумма ($)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Min: 10.00" className="w-full bg-[#12161c] border border-[#2a323d] rounded-lg py-3 px-4 text-white font-bold focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Сеть</label>
                    <select value={network} onChange={(e) => setNetwork(e.target.value)} className="w-full bg-[#12161c] border border-[#2a323d] rounded-lg py-3 px-4 text-white font-bold focus:border-orange-500 focus:outline-none appearance-none">
                        <option>USDT TRC-20</option><option>USDT ERC-20</option><option>Bitcoin (BTC)</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Адрес кошелька</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="T..." className="w-full bg-[#12161c] border border-[#2a323d] rounded-lg py-3 px-4 text-white font-mono text-xs focus:border-orange-500 focus:outline-none" />
                </div>
            </div>
            <button onClick={handleWithdraw} disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-black text-xs uppercase bg-orange-600 text-white hover:bg-orange-500 transition-colors shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2">
                {isSubmitting ? 'Обработка...' : 'Подтвердить вывод'} <ArrowRight size={16}/>
            </button>
        </div>
      </div>
    </div>
  );
};