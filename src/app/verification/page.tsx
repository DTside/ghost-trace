'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sidebar } from '@/components/layout/Sidebar';
import { Check, ChevronRight, Upload, Camera, Shield, AlertCircle, Loader2, ArrowLeft, Home, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

export default function VerificationPage() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pendingLevel, setPendingLevel] = useState(0);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Данные формы
  const [formData, setFormData] = useState({ fullName: '', dob: '', country: '', docType: 'passport', docNumber: '', address: '' });
  const [files, setFiles] = useState<{ front: File | null, back: File | null, selfie: File | null, utility: File | null }>({ 
    front: null, back: null, selfie: null, utility: null 
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    // 1. Проверяем текущий уровень профиля
    const { data: profile } = await supabase.from('profiles').select('verification_level').eq('id', TEST_USER_ID).single();
    if (profile) setCurrentLevel(profile.verification_level);

    // 2. Проверяем, висит ли заявка на проверке
    const { data: verification } = await supabase.from('verifications').select('level, status').eq('user_id', TEST_USER_ID).eq('status', 'pending').single();
    if (verification) setPendingLevel(verification.level);
  };

  const uploadFile = async (file: File, path: string) => {
    const { error } = await supabase.storage.from('kyc').upload(path, file);
    if(error) throw error;
    return supabase.storage.from('kyc').getPublicUrl(path).data.publicUrl;
  };

  // ЕДИНАЯ ФУНКЦИЯ ОТПРАВКИ (С UPSERT)
  const submit = async (level: number) => {
    setLoading(true);
    try {
        const ts = Date.now();
        
        // Базовый объект обновлений
        const updates: any = {
            user_id: TEST_USER_ID,
            level,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        if(level === 2) {
            // --- УРОВЕНЬ 2 (ПАСПОРТ) ---
            if(files.front) updates.front_image = await uploadFile(files.front, `${TEST_USER_ID}/L2_F_${ts}`);
            if(files.back) updates.back_image = await uploadFile(files.back, `${TEST_USER_ID}/L2_B_${ts}`);
            if(files.selfie) updates.selfie_image = await uploadFile(files.selfie, `${TEST_USER_ID}/L2_S_${ts}`);
            
            // Заполняем обязательные поля реальными данными
            updates.full_name = formData.fullName;
            updates.dob = formData.dob; // <--- Здесь дата берется из инпута
            updates.country = formData.country;
            updates.doc_type = formData.docType;
            updates.doc_number = formData.docNumber;
        } else {
            // --- УРОВЕНЬ 3 (АДРЕС) ---
            if(files.utility) updates.front_image = await uploadFile(files.utility, `${TEST_USER_ID}/L3_U_${ts}`);
            
            updates.country = formData.address; 
            updates.full_name = 'Address Check'; 
            
            // ВАЖНО: Заполняем обязательные поля заглушками, чтобы база не ругалась
            updates.dob = new Date().toISOString(); // <--- ФИКС: Отправляем текущую дату как заглушку
            updates.doc_type = 'utility_bill';      // <--- ФИКС: Тип документа
            updates.doc_number = 'N/A';             // <--- ФИКС: Номер документа
        }

        // UPSERT
        const { error } = await supabase.from('verifications').upsert(updates, { onConflict: 'user_id' });
        if(error) throw error;

        await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', TEST_USER_ID);
        setPendingLevel(level);
        toast.success(`Документы уровня ${level} отправлены!`);
    } catch(e: any) { 
        console.error(e);
        toast.error(e.message); 
    } finally { 
        setLoading(false); 
    }
  };

  const isLevel3Flow = currentLevel === 2;

  return (
    <div className="flex h-screen w-screen bg-[#0d1117] text-white font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto custom-scrollbar relative p-8">
            
            {/* Кнопка закрыть */}
            <Link href="/profile" className="absolute top-6 right-6 p-2 bg-[#1c2028] hover:bg-[#2a323d] rounded-full text-gray-400 hover:text-white transition-colors z-50">
                <X size={24}/>
            </Link>
            
            {pendingLevel > 0 ? (
                // ЭКРАН ОЖИДАНИЯ
                <div className="max-w-md mx-auto mt-20 p-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 text-center">
                    <Loader2 className="animate-spin text-yellow-500 mx-auto mb-4" size={48}/>
                    <h2 className="text-2xl font-black mb-2">На проверке (Уровень {pendingLevel})</h2>
                    <p className="text-gray-400 mb-6">{pendingLevel===3 ? 'Проверка адреса занимает до 3 дней.' : 'Обычно занимает до 24 часов.'}</p>
                    <Link href="/profile" className="bg-[#2a323d] px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#343a46] transition-colors">Вернуться в профиль</Link>
                </div>
            ) : currentLevel === 3 ? (
                // ЭКРАН ПОЛНОГО УСПЕХА
                <div className="max-w-md mx-auto mt-20 p-8 rounded-2xl border border-green-500/20 bg-green-500/5 text-center">
                    <Shield className="text-green-500 mx-auto mb-4" size={48}/>
                    <h2 className="text-2xl font-black mb-2">Верифицирован</h2>
                    <p className="text-gray-400 mb-6">Ваш аккаунт имеет максимальный уровень. Все лимиты сняты.</p>
                    <Link href="/profile" className="bg-[#2a323d] px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#343a46] transition-colors">В кабинет</Link>
                </div>
            ) : (
                // ФОРМЫ
                <div className="max-w-2xl w-full mx-auto mt-10">
                    <h1 className="text-3xl font-black mb-2">Верификация {isLevel3Flow ? '(Уровень 3: Адрес)' : '(Уровень 2: Личность)'}</h1>
                    <p className="text-gray-400 mb-8">{isLevel3Flow ? 'Для вывода средств подтвердите адрес проживания.' : 'Подтвердите личность для начала торговли и пополнения.'}</p>
                    
                    {!isLevel3Flow && (
                        <div className="flex items-center gap-4 mb-8">
                            <StepBadge num={1} active={step>=1} label="Данные"/><div className={`h-1 flex-1 rounded ${step>=2?'bg-blue-600':'bg-[#2a323d]'}`}/><StepBadge num={2} active={step>=2} label="Фото"/><div className={`h-1 flex-1 rounded ${step>=3?'bg-blue-600':'bg-[#2a323d]'}`}/><StepBadge num={3} active={step>=3} label="Селфи"/>
                        </div>
                    )}

                    <div className="bg-[#1c2028] border border-[#2a2e39] rounded-2xl p-8 shadow-2xl">
                        {/* ФОРМА УРОВНЯ 2 */}
                        {!isLevel3Flow && step===1 && (
                            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4">
                                <Input label="ФИО (как в документе)" val={formData.fullName} set={(v:string)=>setFormData({...formData, fullName:v})}/>
                                <div className="grid grid-cols-2 gap-4"><Input label="Дата рождения" type="date" val={formData.dob} set={(v:string)=>setFormData({...formData, dob:v})}/><Input label="Страна выдачи" val={formData.country} set={(v:string)=>setFormData({...formData, country:v})}/></div>
                                <Input label="Номер документа" val={formData.docNumber} set={(v:string)=>setFormData({...formData, docNumber:v})}/>
                                <button onClick={()=>setStep(2)} className="mt-4 bg-blue-600 h-12 rounded-xl font-bold uppercase hover:bg-blue-500 transition-colors">Продолжить</button>
                            </div>
                        )}
                        {!isLevel3Flow && step===2 && (
                            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
                                <UploadZone label="Лицевая сторона" file={files.front} set={(f:File)=>setFiles({...files, front:f})}/><UploadZone label="Обратная сторона" file={files.back} set={(f:File)=>setFiles({...files, back:f})}/>
                                <div className="flex gap-3"><button onClick={()=>setStep(1)} className="flex-1 bg-[#2a323d] rounded-xl text-gray-400 hover:text-white">Назад</button><button onClick={()=>setStep(3)} className="flex-[2] bg-blue-600 rounded-xl font-bold hover:bg-blue-500">Далее</button></div>
                            </div>
                        )}
                        {!isLevel3Flow && step===3 && (
                            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
                                <UploadZone label="Селфи с документом" file={files.selfie} set={(f:File)=>setFiles({...files, selfie:f})}/>
                                <div className="flex gap-3"><button onClick={()=>setStep(2)} className="flex-1 bg-[#2a323d] rounded-xl text-gray-400 hover:text-white">Назад</button><button onClick={()=>submit(2)} disabled={loading} className="flex-[2] bg-green-600 rounded-xl font-bold hover:bg-green-500 flex justify-center items-center">{loading?<Loader2 className="animate-spin"/>:'Отправить'}</button></div>
                            </div>
                        )}

                        {/* ФОРМА УРОВНЯ 3 */}
                        {isLevel3Flow && (
                            <div className="flex flex-col gap-6 animate-in fade-in">
                                <Input label="Адрес проживания" val={formData.address} set={(v:string)=>setFormData({...formData, address:v})}/>
                                <UploadZone label="Квитанция ЖКХ / Выписка банка" file={files.utility} set={(f:File)=>setFiles({...files, utility:f})}/>
                                <button onClick={()=>submit(3)} disabled={loading} className="mt-4 w-full bg-green-600 h-12 rounded-xl font-bold uppercase hover:bg-green-500 flex justify-center items-center">{loading?<Loader2 className="animate-spin"/>:'Отправить на проверку'}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

// UI Components
const Input = ({label, val, set, type="text"}:any) => (<div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">{label}</label><input type={type} value={val} onChange={e=>set(e.target.value)} className="w-full bg-[#12161c] border border-[#2a323d] rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold transition-colors"/></div>);
const UploadZone = ({label, file, set}:any) => (<div className="relative group"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">{label}</label><input type="file" onChange={e=>e.target.files && set(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/><div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors ${file?'border-green-500/50 bg-green-500/5':'border-[#2a323d] hover:border-blue-500 bg-[#161b22]'}`}>{file?<div className="text-green-500 font-bold flex gap-2 items-center"><Check size={16}/> {file.name}</div>:<div className="text-gray-500 flex flex-col items-center"><Upload className="mb-2"/><span className="text-xs font-bold">Загрузить фото</span></div>}</div></div>);
const StepBadge = ({num, active, label}:any) => (<div className="flex flex-col items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${active?'bg-blue-600':'bg-[#2a323d] text-gray-500'}`}>{num}</div><span className={`text-[10px] uppercase font-bold ${active?'text-white':'text-gray-600'}`}>{label}</span></div>);