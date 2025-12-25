'use client';
import { useState } from 'react';
import { X, Copy, Check, ArrowRight, Loader2, DollarSign } from 'lucide-react'; // QrCode больше не нужен, у нас картинки
import { useTradeStore } from '@/store/useTradeStore';
import { toast } from 'sonner';

// НАСТРОЙКИ КОШЕЛЬКОВ И QR-КОДОВ
const MY_WALLETS = [
  { 
    id: 'usdt_trc20', 
    name: 'Tether USDT', 
    network: 'TRC-20', 
    icon: '₮', 
    address: 'TB17R9ECKuVTbxrVmJ3iBiptSKPgfxARQC',
    qrImage: '/qr/usdt_trc20.jpg' // <--- Путь к картинке в папке public/qr
  },
  { 
    id: 'btc', 
    name: 'Bitcoin', 
    network: 'BTC', 
    icon: '₿', 
    address: 'bc1q6c2ycr64nnfn6a0yxn9vn455e80sa0huulvcem',
    qrImage: '/qr/btc.jpg' 
  },
  { 
    id: 'eth', 
    name: 'Ethereum', 
    network: 'ERC-20', 
    icon: 'Ξ', 
    address: '0x198794f9343Fda57Ed9e80Eb0f61b1369f68F5B7',
    qrImage: '/qr/eth.jpg' 
  },
  { 
    id: 'ltc', 
    name: 'Litecoin', 
    network: 'LTC', 
    icon: 'Ł', 
    address: 'ltc1qayt2uw32yhmvjrctztqu4gg7ukjqdr6u0w8p3f',
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
    toast.success('Адрес скопирован!');
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) < 10) {
        toast.error('Минимальная сумма пополнения $100');
        return;
    }
    setIsSubmitting(true);
    
    // Отправляем заявку
    await createDeposit({
        userId: TEST_USER_ID,
        network: `${selectedCrypto.name} (${selectedCrypto.network})`,
        amount: Number(amount),
        walletTo: selectedCrypto.address
    });

    setIsSubmitting(false);
    onClose();
    setStep(1);
    setAmount('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e232d] w-[500px] rounded-2xl border border-[#2a323d] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="h-16 border-b border-[#2a323d] flex items-center justify-between px-6 bg-[#1c2028]">
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">
             {step === 1 ? 'Выберите метод' : 'Пополнение счета'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            
            {/* ШАГ 1: ВЫБОР КРИПТЫ */}
            {step === 1 && (
                <div className="grid grid-cols-1 gap-3">
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

            {/* ШАГ 2: ПЕРЕВОД И ВВОД СУММЫ */}
            {step === 2 && selectedCrypto && (
                <div className="flex flex-col gap-6">
                    <div className="text-center">
                        <span className="text-xs text-gray-400 uppercase font-bold mb-2 block">Отправьте средства на адрес:</span>
                        <div className="bg-[#12161c] p-4 rounded-xl border border-[#2a323d] flex items-center justify-between gap-3 group">
                            <span className="text-xs font-mono text-gray-300 break-all text-left">{selectedCrypto.address}</span>
                            <button onClick={() => handleCopy(selectedCrypto.address)} className="p-2 bg-[#262b34] rounded hover:bg-blue-600 transition-colors text-gray-400 hover:text-white shrink-0">
                                <Copy size={16}/>
                            </button>
                        </div>
                    </div>

                    {/* QR CODE БЛОК */}
                    <div className="flex justify-center">
                        <div className="bg-white p-2 rounded-xl">
                             {/* Показываем картинку QR кода */}
                             <img 
                                src={selectedCrypto.qrImage} 
                                alt={`${selectedCrypto.name} QR Code`}
                                className="w-32 h-32 object-contain"
                                onError={(e) => {
                                    // Если картинка не найдена, скрываем её (или можно показать заглушку)
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                             />
                        </div>
                    </div>
                    
                    <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                        <p className="text-[11px] text-yellow-500 text-center leading-relaxed">
                            ⚠️ Отправляйте только <b>{selectedCrypto.name} ({selectedCrypto.network})</b>.<br/>
                            После отправки укажите точную сумму ниже.
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Я отправил сумму ($):</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Например: 100"
                                className="w-full bg-[#12161c] border border-[#2a323d] rounded-xl py-3 pl-10 pr-4 text-white font-bold focus:border-blue-500 focus:outline-none transition-colors"
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
                            className="flex-[2] py-3 rounded-xl font-bold text-xs uppercase bg-green-600 text-white hover:bg-green-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
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