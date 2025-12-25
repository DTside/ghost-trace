'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, BarChart2, Shield, Zap, X, FileText, Lock, Globe, CreditCard, Send } from 'lucide-react';

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Контент для модальных окон
  const MODAL_CONTENT: any = {
    terms: {
      title: "Условия пользования",
      icon: <FileText className="text-blue-500" size={24}/>,
      text: (
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>Добро пожаловать на платформу <strong>Ghost Trace</strong>. Используя наш сервис, вы соглашаетесь со следующими условиями:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Регистрация:</strong> Вы подтверждаете, что вам исполнилось 18 лет и вы имеете право на совершение финансовых операций.</li>
            <li><strong>Риски:</strong> Торговля финансовыми активами сопряжена с высоким уровнем риска. Ghost Trace не несет ответственности за ваши торговые убытки.</li>
            <li><strong>Аккаунт:</strong> Пользователь обязан обеспечить безопасность своих учетных данных. Передача доступа третьим лицам запрещена.</li>
            <li><strong>Запрещенные действия:</strong> Использование ботов, автоматизированных скриптов (кроме одобренных API) и попытки взлома платформы приведут к блокировке аккаунта без возврата средств.</li>
          </ul>
          <p>Ghost Trace оставляет за собой право изменять данные условия в любое время.</p>
        </div>
      )
    },
    privacy: {
      title: "Политика конфиденциальности",
      icon: <Lock className="text-green-500" size={24}/>,
      text: (
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>Ваша приватность — приоритет <strong>Ghost Trace</strong>. Мы собираем и храним данные в соответствии с международными стандартами GDPR.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Сбор данных:</strong> Мы собираем только те данные, которые необходимы для верификации (KYC) и обеспечения безопасности транзакций.</li>
            <li><strong>Хранение:</strong> Все личные данные хранятся в зашифрованном виде на защищенных серверах.</li>
            <li><strong>Передача данных:</strong> Мы никогда не передаем ваши данные третьим лицам, за исключением случаев, предусмотренных законом.</li>
            <li><strong>Cookies:</strong> Платформа использует файлы cookie для улучшения производительности и анализа трафика.</li>
          </ul>
        </div>
      )
    },
    about: {
      title: "О компании Ghost Trace",
      icon: <Globe className="text-purple-500" size={24}/>,
      text: (
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
          <p><strong>Ghost Trace</strong> — это инновационная торговая платформа нового поколения, основанная в 2024 году.</p>
          <p>Наша миссия — предоставить трейдерам по всему миру доступ к финансовым рынкам с максимальной скоростью, анонимностью и безопасностью.</p>
          <div className="bg-[#161b22] p-4 rounded-xl border border-[#2a2e39]">
            <h4 className="font-bold text-white mb-2">Наши преимущества:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Собственный движок исполнения сделок "Ghost Engine" (0.1ms).</li>
              <li>Хранение 98% средств на холодных кошельках.</li>
              <li>Круглосуточная поддержка 24/7.</li>
            </ul>
          </div>
          <p>Ghost Trace International Ltd. зарегистрирована по адресу: 12 Global Gateway 8, Rue de la Perle, Providence, Mahe, Seychelles.</p>
        </div>
      )
    },
    aml: {
      title: "Политика AML и KYC",
      icon: <Shield className="text-orange-500" size={24}/>,
      text: (
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
          <p><strong>Ghost Trace</strong> строго соблюдает международные нормы по борьбе с отмыванием денег (AML) и процедуру "Знай своего клиента" (KYC).</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Верификация:</strong> Для доступа к выводу средств каждый пользователь обязан пройти многоуровневую верификацию личности и адреса.</li>
            <li><strong>Мониторинг:</strong> Служба безопасности отслеживает подозрительные транзакции в реальном времени.</li>
            <li><strong>Происхождение средств:</strong> В отдельных случаях мы можем запросить подтверждение источника происхождения средств.</li>
            <li><strong>Санкции:</strong> Мы не обслуживаем резидентов стран, находящихся под международными санкциями.</li>
          </ul>
        </div>
      )
    },
    payment: {
      title: "Политика платежей",
      icon: <CreditCard className="text-blue-400" size={24}/>,
      text: (
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>Правила ввода и вывода средств на платформе <strong>Ghost Trace</strong>:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Методы:</strong> Мы работаем преимущественно с криптовалютами (USDT, BTC, ETH) для обеспечения скорости транзакций.</li>
            <li><strong>Вывод средств:</strong> Заявки на вывод обрабатываются от 15 минут до 24 часов. Вывод доступен только на те реквизиты, с которых было пополнение (или верифицированные кошельки).</li>
            <li><strong>Комиссии:</strong> Платформа не взимает комиссию за пополнение. Комиссия за вывод зависит от загруженности сети блокчейн.</li>
            <li><strong>Лимиты:</strong> Минимальная сумма депозита — $100. Минимальная сумма вывода — $1000.</li>
          </ul>
        </div>
      )
    }
  };

  const currentModal = activeModal ? MODAL_CONTENT[activeModal] : null;

  return (
    <div className="h-screen w-full overflow-y-auto overflow-x-hidden bg-[#0d1117] text-white font-sans selection:bg-blue-500/30">
      
      {/* МОДАЛЬНОЕ ОКНО */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-[#1e232d] w-full max-w-2xl rounded-2xl border border-[#2a323d] shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="h-16 border-b border-[#2a323d] flex items-center justify-between px-6 bg-[#1c2028] shrink-0">
              <div className="flex items-center gap-3">
                {currentModal.icon}
                <h2 className="text-lg font-bold text-white">{currentModal.title}</h2>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-white transition-colors bg-[#2a323d] p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              {currentModal.text}
            </div>
            {/* Footer */}
            <div className="p-4 border-t border-[#2a323d] bg-[#1c2028] shrink-0 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors">
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 border border-blue-500/30 bg-blue-500/10 rounded-xl flex items-center justify-center font-black text-lg text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]">G</div>
                <span className="font-bold text-lg tracking-tight text-gray-200">Ghost Trace</span>
            </div>
            <div className="flex gap-4">
                <Link href="/login" className="px-5 py-2 rounded-lg font-bold text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Войти</Link>
                <Link href="/register" className="px-5 py-2 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95">Регистрация</Link>
            </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Ghost Trace Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter bg-gradient-to-br from-white via-blue-100 to-blue-500 bg-clip-text text-transparent relative z-10 max-w-4xl leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Торгуй без ограничений.
        </h1>
        
        <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100">
            Анонимность, скорость и точность. Платформа нового поколения для тех, кто ценит безопасность.
        </p>
        
        <Link href="/register" className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)] active:scale-95 z-10 flex items-center gap-2 animate-in fade-in zoom-in duration-500 delay-200">
            Начать торговать <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
        </Link>

        {/* UI Mockup */}
        <div className="mt-20 relative z-10 w-full max-w-5xl rounded-xl border border-white/10 bg-[#161b22] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent z-20"></div>
            <div className="h-8 bg-[#1c2028] border-b border-white/5 flex items-center gap-2 px-4 z-30 relative">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
            </div>
            <div className="relative min-h-[300px] md:h-[500px] w-full bg-[#10141b] overflow-hidden">
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d="M0,400 C100,350 200,450 300,300 C400,150 500,350 600,250 C700,150 800,200 900,100 L1200,150" fill="none" stroke="#3b82f6" strokeWidth="3" className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <path d="M0,400 C100,350 200,450 300,300 C400,150 500,350 600,250 C700,150 800,200 900,100 L1200,150 V600 H0 Z" fill="url(#chartGradient)" stroke="none" />
                </svg>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
                    <div className="w-16 h-10 bg-green-500 rounded-lg shadow-lg shadow-green-500/20 animate-pulse"></div>
                    <div className="w-16 h-10 bg-red-500 rounded-lg shadow-lg shadow-red-500/20"></div>
                </div>
            </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="bg-[#10141b] py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard icon={<Zap size={24}/>} title="Ghost Speed" desc="Сделки исполняются быстрее тени. Никаких задержек и реквот."/>
              <FeatureCard icon={<Shield size={24}/>} title="Trace Security" desc="Полная анонимность и защита данных. Ваши средства в безопасности."/>
              <FeatureCard icon={<BarChart2 size={24}/>} title="Pro Analytics" desc="Инструменты, которые видят то, что скрыто от других."/>
          </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 bg-[#0a0d12]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
            
            <div className="flex flex-col items-center gap-6 mb-8">
                {/* LOGO */}
                <div className="flex items-center gap-3 opacity-70">
                    <div className="w-8 h-8 border border-blue-500/30 bg-blue-500/10 rounded flex items-center justify-center font-black text-blue-500 text-xs shadow-[0_0_10px_rgba(59,130,246,0.2)]">G</div>
                    <span className="font-bold text-lg text-gray-300">Ghost Trace</span>
                </div>

                {/* TELEGRAM BUTTON */}
                <a 
                    href="https://t.me/ghosttrace" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#2aabee]/10 hover:bg-[#2aabee]/20 text-[#2aabee] border border-[#2aabee]/20 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-[0_0_15px_rgba(42,171,238,0.2)]"
                >
                    <Send size={16} /> Наш Telegram канал
                </a>
            </div>

            {/* МЕНЮ ФУТЕРА (КНОПКИ МОДАЛОК) */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-sm font-bold text-gray-500 uppercase tracking-wide">
                <button onClick={() => setActiveModal('about')} className="hover:text-blue-500 transition-colors">О компании</button>
                <button onClick={() => setActiveModal('terms')} className="hover:text-blue-500 transition-colors">Условия пользования</button>
                <button onClick={() => setActiveModal('privacy')} className="hover:text-blue-500 transition-colors">Политика конфиденциальности</button>
                <button onClick={() => setActiveModal('aml')} className="hover:text-blue-500 transition-colors">AML & KYC</button>
                <button onClick={() => setActiveModal('payment')} className="hover:text-blue-500 transition-colors">Политика платежей</button>
            </div>

            <div className="text-center text-xs text-gray-600 max-w-2xl leading-relaxed">
                <p className="mb-2">Торговля финансовыми инструментами сопряжена с высоким риском. Вы можете потерять весь вложенный капитал.</p>
                <p>© 2024 Ghost Trace International Ltd. All rights reserved.</p>
            </div>
          </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon, title, desc }: any) => (
    <div className="p-8 rounded-2xl bg-[#161b22] border border-[#2a2e39] hover:border-blue-500/30 hover:bg-[#1c222b] transition-all group">
        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
);