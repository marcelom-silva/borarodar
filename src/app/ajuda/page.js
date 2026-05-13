export const dynamic = 'force-dynamic';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HelpPage from '@/components/help/HelpPage';

export const metadata = {
  title: 'Ajuda - Bora Rodar',
  description: 'Duvidas sobre o BoraRodar? Encontre respostas rapidas sobre planejamento de rotas, orcamento, IA e muito mais.',
};

export default function Ajuda() {
  return (
    <main>
      <Navbar />
      <HelpPage />
      <Footer />
    </main>
  );
}
