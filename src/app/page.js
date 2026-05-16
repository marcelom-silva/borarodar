import ImmersiveHero from '@/components/home/ImmersiveHero';

export const metadata = {
  title: 'BoraRodar — Transformando viagens em histórias épicas',
  description: 'Planejador de viagens de carro com IA. Calcule rotas, orçamento, roteiro e checklist completo.',
  openGraph: {
    title: 'BoraRodar — Transformando viagens em histórias épicas',
    description: 'Planeje sua viagem de carro com IA: rotas, orçamento, roteiro e checklist.',
    url: 'https://borarodar.vercel.app',
    siteName: 'BoraRodar',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function Home() {
  return <ImmersiveHero />;
}
