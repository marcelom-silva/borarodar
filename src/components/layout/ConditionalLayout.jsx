'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Wraps Navbar + Footer for all pages EXCEPT the homepage.
 * ImmersiveHero provides its own header/footer on '/'.
 * Import this in layout.js and replace the direct <Navbar>/<Footer> calls.
 *
 * Usage in layout.js:
 *   import ConditionalLayout from '@/components/layout/ConditionalLayout';
 *   // Replace:   <Navbar/>{children}<Footer/>
 *   // With:      <ConditionalLayout>{children}</ConditionalLayout>
 */
export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isHome   = pathname === '/';

  if (isHome) {
    /* Homepage: no Navbar/Footer wrapper, no padding-top for nav */
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
