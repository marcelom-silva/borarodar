'use client';
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PlannerMain from '@/components/planner/PlannerMain';

export default function PlanejarPage() {
  return (
    <main>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Carregando...
        </div>
      }>
        <PlannerMain />
      </Suspense>
      <Footer />
    </main>
  );
}
