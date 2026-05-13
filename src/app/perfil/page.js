// Impede o Next.js de pre-renderizar esta pagina no build
// (necessario porque usa Supabase Auth que precisa do browser)
export const dynamic = 'force-dynamic';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProfilePage from '@/components/profile/ProfilePage';

export const metadata = {
  title: 'Meu Perfil - Bora Rodar',
  description: 'Gerencie seu perfil, viagens salvas e conquistas.',
};

export default function Perfil() {
  return (
    <main>
      <Navbar />
      <ProfilePage />
      <Footer />
    </main>
  );
}
