'use client';
import { useState } from 'react';
import { X, Copy, Check, ArrowRight, Loader2, DollarSign, AlertTriangle, ChevronLeft } from 'lucide-react';
import { useTradeStore } from '@/store/useTradeStore';
import { toast } from 'sonner';

// ПОЛНЫЙ СПИСОК КОШЕЛЬКОВ
const MY_WALLETS = [
  { 
    id: 'usdt_trc20', 
    name: 'Tether USDT', 
    network: 'TRC-20', 
    icon: '₮', 
    address: 'TB17R9ECKuVTbxrVmJ3iBiplSKPgfxARQC', // Твой адрес
    qrImage: '/qr/usdt_trc20.jpg'
  },
  { 
    id: 'btc', 
    name: 'Bitcoin', 
    network: 'BTC', 
    icon: '₿', 
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Пример (замени на свой)
    qrImage: '/qr/btc.jpg' 
  },
  { 
    id: 'eth', 
    name: 'Ethereum', 
    network: 'ERC-20', 
    icon: 'Ξ', 
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', // Пример (замени на свой)
    qrImage: '/qr/eth.jpg' 
  },
  { 
    id: 'ltc', 
    name: 'Litecoin', 
    network: 'LTC', 
    icon: 'Ł', 
    address: 'ltc1qrg3937929007425832729904257829283742', // Пример (замени на свой)
    qrImage: '/qr/ltc.jpg' 
  },
];

export const DepositModal = ({ isOpen, onClose }: any) => {
  const [step, setStep] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createDeposit } = useTradeStore() as any;
  const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Адрес скопирован');
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) < 10) {
        toast.error('Минимум $10');
        return;
    }

    setIsSubmitting(true);
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        await createDeposit({
            userId: TEST_USER_ID,
            network: `${selectedCrypto.name} (${selectedCrypto.network})`,
            amount: Number(amount),
            walletTo: selectedCrypto.address
        });

        toast.success("Заявка создана! Ожидайте подтверждения сети.");
        onClose();
        setStep(1);
        setAmount('');
    } catch (e) {
        toast.error("Ошибка");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-[#1e232d] w-full max-w-md rounded-2xl border border-[#2a323d] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="h-14 border-b border-[#2a323d] flex items-center justify-between px-4 bg-[#1c2028] shrink-0">
          <div className="flex items-center gap-2">
              {step === 2 && (
                  <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white mr-1">
                      <ChevronLeft size={20}/>
                  </button>
              )}
              <h2 className="text-sm font-black text-white uppercase tracking-wide">
                 {step === 1 ? 'Выберите метод' : `Пополнение ${selectedCrypto?.network}`}
              </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 bg-[#2a323d] rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            
            {/* ШАГ 1: СПИСОК МОНЕТ */}
            {step === 1 && (
                <div className="flex flex-col gap-3">
                    {MY_WALLETS.map((wallet) => (
                        <button 
                            key={wallet.id}
                            onClick={() => { setSelectedCrypto(wallet); setStep(2); }}
                            className="flex items-center gap-4 bg-[#262b34] p-4 rounded-xl border border-[#333a47] hover:border-blue-500 hover:bg-[#2d333f] transition-all group text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-xl font-bold text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                {wallet.icon}
                            </div>
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-white">{wallet.name}</span>
                                <span className="text-xs text-gray-500">{wallet.network}</span>
                            </div>
                            <div className="text-gray-600 group-hover:text-blue-500"><ArrowRight size={20}/></div>
                        </button>
                    ))}
                </div>
            )}

            {/* ШАГ 2: ОПЛАТА */}
            {step === 2 && selectedCrypto && (
                <div className="flex flex-col gap-6">
                    {/* QR Code */}
                    <div className="flex flex-col items-center">
                        <div className="bg-white p-3 rounded-xl mb-4 shadow-lg">
                             <img 
                                src={selectedCrypto.qrImage} 
                                alt={selectedCrypto.name} 
                                className="w-40 h-40 object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                             />
                        </div>
                        
                        <div className="w-full bg-[#12161c] p-3 rounded-xl border border-[#2a323d] flex items-center justify-between gap-3 relative group">
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Адрес кошелька</span>
                                <span className="text-xs font-mono text-white truncate">{selectedCrypto.address}</span>
                            </div>
                            <button onClick={() => handleCopy(selectedCrypto.address)} className="p-2 bg-[#262b34] rounded hover:bg-blue-600 transition-colors text-gray-400 hover:text-white shrink-0">
                                <Copy size={16}/>
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 flex gap-3 items-start">
                        <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16}/>
                        <p className="text-[11px] text-yellow-500 leading-relaxed">
                            Отправляйте только <b>{selectedCrypto.name} ({selectedCrypto.network})</b>. Минимальная сумма $100  .
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Сумма пополнения ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="100"
                                className="w-full bg-[#12161c] border border-[#2a323d] rounded-xl py-3 pl-9 pr-4 text-white font-bold focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase bg-[#262b34] text-gray-400 hover:bg-[#343a46] transition-colors">
                            Назад
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                            className="flex-[2] py-3 rounded-xl font-bold text-xs uppercase bg-green-600 text-white hover:bg-green-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Check size={16}/>}
                            Я оплатил
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};