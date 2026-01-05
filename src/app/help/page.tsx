'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sidebar } from '@/components/layout/Sidebar';
import { HelpCircle, MessageCircle, Send, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

export default function HelpPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTicket = async () => {
    if(!subject || !message) return toast.error('Заполните все поля');
    setLoading(true);
    const { error } = await supabase.from('support_tickets').insert({
        user_id: TEST_USER_ID, subject, message, status: 'open'
    });
    setLoading(false);
    if(error) toast.error('Ошибка отправки');
    else { toast.success('Тикет создан! Мы ответим вам на почту.'); setSubject(''); setMessage(''); }
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-white font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* FAQ SECTION */}
            <div>
                <h1 className="text-3xl font-black mb-6 flex items-center gap-3"><HelpCircle className="text-green-500"/> Помощь</h1>
                <div className="space-y-3">
                    <FaqItem q="Как пополнить счет?" a="Нажмите кнопку 'Пополнить' в верхнем меню, выберите криптовалюту и переведите средства на указанный адрес."/>
                    <FaqItem q="Как пройти верификацию?" a="Перейдите в раздел 'Профиль', нажмите на статус верификации и следуйте инструкциям на экране."/>
                    <FaqItem q="Сколько времени занимает вывод?" a="Обработка заявок занимает от 15 минут до 24 часов в зависимости от загруженности сети."/>
                    <FaqItem q="Минимальная сумма сделки?" a="Минимальная сумма сделки составляет $10."/>
                </div>
            </div>

            {/* CONTACT FORM */}
            <div className="bg-[#1c2028] rounded-2xl border border-[#2a2e39] p-6 h-fit">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><MessageCircle size={20} className="text-blue-500"/> Написать в поддержку</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Тема обращения</label>
                        <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full bg-[#12161c] border border-[#2a323d] rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold" placeholder="Например: Проблема с выводом"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Сообщение</label>
                        <textarea value={message} onChange={e=>setMessage(e.target.value)} className="w-full bg-[#12161c] border border-[#2a323d] rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold min-h-[150px]" placeholder="Опишите вашу проблему подробно..."/>
                    </div>
                    <button onClick={sendTicket} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 h-12 rounded-xl font-bold uppercase flex items-center justify-center gap-2 transition-colors">
                        {loading ? 'Отправка...' : <>Отправить <Send size={16}/></>}
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

const FaqItem = ({ q, a }: any) => (
    <div className="bg-[#1c2028] border border-[#2a2e39] rounded-xl p-4 cursor-pointer hover:border-gray-500 transition-colors group">
        <div className="font-bold text-sm flex justify-between items-center text-white mb-2">
            {q} <ChevronDown size={16} className="text-gray-500 group-hover:text-white"/>
        </div>
        <div className="text-xs text-gray-400 leading-relaxed">{a}</div>
    </div>
);