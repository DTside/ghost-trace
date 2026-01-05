import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner'; // <-- Импорт уведомлений

export const metadata: Metadata = {
  title: 'Ghost Trace | Trading Platform',
  description: 'Advanced trading platform with instant withdrawals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-[#0d1117] text-white">
        {children}
        {/* Компонент уведомлений должен быть здесь, поверх всего */}
        <Toaster position="top-center" theme="dark" richColors closeButton />
      </body>
    </html>
  );
}