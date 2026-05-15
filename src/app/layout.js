import { Syne, DM_Sans, Space_Mono } from 'next/font/google';
import { LanguageProvider } from '@/contexts/LanguageContext';
import './globals.css';

const syne = Syne({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-syne' });
const dm   = DM_Sans({ subsets: ['latin'], weight: ['300','400','500','600'], variable: '--font-dm' });
const mono = Space_Mono({ subsets: ['latin'], weight: ['400','700'], variable: '--font-mono' });

export const metadata = {
  title:       'Bora Rodar - Planeje sua viagem de carro',
  description: 'Planeje rotas, calcule orcamentos e descubra o Brasil de carro.',
  icons:       { icon: '/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={syne.variable + ' ' + dm.variable + ' ' + mono.variable}>
      <body className="bg-br-bg text-white font-dm antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

