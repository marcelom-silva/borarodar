import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import TrendingRoutes from '@/components/home/TrendingRoutes';
import CommunityPreview from '@/components/home/CommunityPreview';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <TrendingRoutes />
      <CommunityPreview />
      <Footer />
    </main>
  );
}
