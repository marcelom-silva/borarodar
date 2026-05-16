import { Syne, DM_Sans, Space_Mono, Sora } from 'next/font/google';
import { LanguageProvider } from '@/contexts/LanguageContext';
import './globals.css';

const syne = Syne({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-syne' });
const dm   = DM_Sans({ subsets: ['latin'], weight: ['300','400','500','600'], variable: '--font-dm' });
const mono = Space_Mono({ subsets: ['latin'], weight: ['400','700'], variable: '--font-mono' });

/* Sora — pesos disponíveis: 100‥800 (sem 900) */
const sora = Sora({ subsets: ['latin'], weight: ['300','400','600','700','800'], variable: '--font-sora' });

export const metadata = {
  title:       'BoraRodar — Transformando viagens em histórias épicas',
  description: 'Planejador de viagens de carro com IA. Rotas, orçamento, roteiro e checklist.',
  icons:       { icon: '/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${syne.variable} ${dm.variable} ${mono.variable} ${sora.variable}`}
    >
      <body className="bg-br-bg text-white font-dm antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
