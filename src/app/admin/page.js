'use client';
// src/app/admin/page.js
// ─────────────────────────────────────────────────────────────────────────────
// Painel administrativo — acesso restrito a marcelo.993888@gmail.com
// Estatísticas para apresentação a investidores
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Users, Route, Share2, Eye, Zap, TrendingUp, MapPin,
  Car, Clock, BarChart2, Globe, Shield, RefreshCw, LogOut
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = '#39FF14', loading }) {
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '20' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className="text-2xl font-extrabold text-white">
          {loading ? <span className="animate-pulse">—</span> : value}
        </div>
        {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 mt-6 flex items-center gap-2">
      {children}
    </h2>
  );
}

// ── Admin check ───────────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'marcelo.993888@gmail.com';

export default function AdminPage() {
  const router   = useRouter();
  const [auth,     setAuth]     = useState(null);   // null = checking
  const [stats,    setStats]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const [lastRefr, setLastRefr] = useState(null);

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        router.replace('/');
        return;
      }
      setAuth(session);
      loadStats();
    });
  }, [router]);

  // ── Load stats from Supabase ─────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const last30 = new Date(now - 30 * 86400000).toISOString();
      const last7  = new Date(now -  7 * 86400000).toISOString();

      const results = await Promise.allSettled([
        // Viagens compartilhadas — total
        supabase.from('shared_trips').select('*', { count: 'exact', head: true }),
        // Viagens compartilhadas — últimos 30 dias
        supabase.from('shared_trips').select('*', { count: 'exact', head: true }).gte('created_at', last30),
        // Total de visualizações de links compartilhados
        supabase.from('shared_trips').select('views'),
        // Cache de pedágios — indica rotas únicas calculadas
        supabase.from('toll_cache').select('*', { count: 'exact', head: true }),
        // Rotas calculadas últimos 30 dias
        supabase.from('toll_cache').select('*', { count: 'exact', head: true }).gte('created_at', last30),
        // Histórico salvo por usuários logados
        supabase.from('user_trips').select('*', { count: 'exact', head: true }),
        // Últimas 10 viagens compartilhadas
        supabase.from('shared_trips')
          .select('id, trip_data, created_at, views')
          .order('created_at', { ascending: false })
          .limit(10),
        // Análise de eventos (se tabela existir)
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }),
        // Eventos últimos 7 dias
        supabase.from('analytics_events').select('event_type, count:id', { count: 'exact' })
          .gte('created_at', last7).order('created_at', { ascending: false }).limit(200),
        // Rotas mais populares (cache_key = rota hash)
        supabase.from('toll_cache').select('cache_key, result, created_at').order('created_at', { ascending: false }).limit(20),
      ]);

      const get = (r) => r.status === 'fulfilled' ? r.value : { data: null, count: 0, error: r.reason };

      const sharedTotal   = get(results[0]).count || 0;
      const shared30d     = get(results[1]).count || 0;
      const viewsData     = get(results[2]).data || [];
      const totalViews    = viewsData.reduce((s, r) => s + (r.views || 0), 0);
      const tollTotal     = get(results[3]).count || 0;
      const toll30d       = get(results[4]).count || 0;
      const historyTotal  = get(results[5]).count || 0;
      const recentShared  = get(results[6]).data || [];
      const eventsTotal   = get(results[7]).count || 0;
      const recentEvents  = get(results[8]).data || [];
      const recentRoutes  = get(results[9]).data || [];

      // Extrai rotas populares do toll_cache
      const routeMap = {};
      recentRoutes.forEach(r => {
        const key = r.cache_key || '';
        const parts = key.split('_');
        const route = parts.slice(0, 2).join(' → ');
        routeMap[route] = (routeMap[route] || 0) + 1;
      });
      const topRoutes = Object.entries(routeMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

      // Processa shared trips para lista
      const recentList = recentShared.map(s => ({
        id: s.id,
        orig: s.trip_data?.formValues?.origem?.split(',')[0] || '?',
        dest: s.trip_data?.formValues?.destino?.split(',')[0] || '?',
        views: s.views || 0,
        budget: s.trip_data?.budgetData?.total || 0,
        dist: s.trip_data?.routeData?.distance?.toFixed(0),
        date: new Date(s.created_at).toLocaleDateString('pt-BR'),
        profile: s.trip_data?.formValues?.travel_profile || '',
      }));

      setStats({
        sharedTotal, shared30d, totalViews, tollTotal, toll30d,
        historyTotal, eventsTotal, recentList, topRoutes, recentEvents,
        avgViewsPerShare: sharedTotal > 0 ? (totalViews / sharedTotal).toFixed(1) : 0,
      });
      setLastRefr(new Date().toLocaleTimeString('pt-BR'));
    } catch (err) {
      console.error('Admin stats error:', err);
    }
    setLoading(false);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  // Auth loading
  if (auth === null) return (
    <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center">
      <div className="text-white text-center">
        <Shield className="w-10 h-10 mx-auto mb-4 text-[#39FF14] animate-pulse"/>
        <p className="text-gray-400">Verificando acesso...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F0F13] text-white">
      {/* Header */}
      <header className="bg-[#141414] border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#39FF14]"/>
          <span className="font-extrabold text-lg">
            <span className="text-[#FF6B35]">Bora</span><span className="text-[#39FF14]">Rodar</span>
            <span className="text-gray-500 font-normal text-sm ml-2">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 hidden sm:block">
            {lastRefr && `Atualizado: ${lastRefr}`}
          </span>
          <button onClick={loadStats} disabled={loading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}/>
            Atualizar
          </button>
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            ← Site
          </Link>
          <button onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
            <LogOut className="w-3 h-3"/>
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero summary */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1">Painel Executivo</h1>
          <p className="text-gray-500 text-sm">Métricas em tempo real — BoraRodar.vercel.app</p>
        </div>

        {/* KPIs principais */}
        <SectionTitle><TrendingUp className="w-4 h-4"/> Indicadores Principais</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard icon={Route}    label="Rotas únicas calculadas"  value={stats.tollTotal?.toLocaleString('pt-BR')}  sub="desde o início"          color="#39FF14"  loading={loading}/>
          <StatCard icon={Route}    label="Rotas (últimos 30 dias)"  value={stats.toll30d?.toLocaleString('pt-BR')}    sub="via calcularpedagio.com.br" color="#00D4FF" loading={loading}/>
          <StatCard icon={Share2}   label="Rotas compartilhadas"     value={stats.sharedTotal?.toLocaleString('pt-BR')} sub="links públicos criados"   color="#B24BF3"  loading={loading}/>
          <StatCard icon={Eye}      label="Visualizações de links"   value={stats.totalViews?.toLocaleString('pt-BR')}  sub={`média ${stats.avgViewsPerShare} por link`} color="#FF6B35" loading={loading}/>
          <StatCard icon={Share2}   label="Novos links (30 dias)"    value={stats.shared30d?.toLocaleString('pt-BR')}   sub="últimos 30 dias"         color="#FFD700"  loading={loading}/>
          <StatCard icon={Users}    label="Viagens salvas (logados)" value={stats.historyTotal?.toLocaleString('pt-BR')} sub="usuários autenticados"  color="#FF69B4"  loading={loading}/>
          <StatCard icon={Globe}    label="Países monitorados"       value="8"                                           sub="BR AR CL UY PY BO PE CO" color="#00D4FF"  loading={loading}/>
          <StatCard icon={Zap}      label="Modelos EV disponíveis"   value="28"                                          sub="9 marcas elétricas"      color="#39FF14"  loading={loading}/>
        </div>

        {/* Últimas rotas compartilhadas */}
        <SectionTitle><Share2 className="w-4 h-4"/> Últimas Rotas Compartilhadas</SectionTitle>
        <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse">Carregando...</div>
          ) : stats.recentList?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhuma rota compartilhada ainda.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                  <th className="text-left px-4 py-3">Rota</th>
                  <th className="text-center px-3 py-3 hidden sm:table-cell">Distância</th>
                  <th className="text-center px-3 py-3 hidden md:table-cell">Orçamento</th>
                  <th className="text-center px-3 py-3">Views</th>
                  <th className="text-right px-4 py-3 hidden sm:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentList?.map((r, i) => (
                  <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0"/>
                        <span className="font-medium text-gray-200 truncate max-w-[160px]">
                          {r.orig} → {r.dest}
                        </span>
                      </div>
                      {r.profile && <span className="text-xs text-gray-600 ml-6">{r.profile}</span>}
                    </td>
                    <td className="text-center px-3 py-3 text-gray-400 hidden sm:table-cell">
                      {r.dist ? `${r.dist} km` : '—'}
                    </td>
                    <td className="text-center px-3 py-3 text-[#39FF14] font-medium hidden md:table-cell">
                      {r.budget > 0 ? `R$ ${r.budget.toLocaleString('pt-BR')}` : '—'}
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B24BF3]/10 text-[#B24BF3] text-xs font-semibold">
                        <Eye className="w-3 h-3"/>
                        {r.views}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3 text-gray-600 text-xs hidden sm:table-cell">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Rotas mais populares */}
        {stats.topRoutes?.length > 0 && (
          <>
            <SectionTitle><BarChart2 className="w-4 h-4"/> Corredores Mais Calculados</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {stats.topRoutes.map(([route, count], i) => (
                <div key={i} className="bg-[#1a1a2e] border border-white/10 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1 truncate">{route || 'Rota'}</div>
                  <div className="text-lg font-bold text-[#FF6B35]">{count}×</div>
                  <div className="text-xs text-gray-600">calculada</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Info para investidores */}
        <SectionTitle><TrendingUp className="w-4 h-4"/> Pitch para Investidores</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#39FF14]/10 to-transparent border border-[#39FF14]/20 rounded-2xl p-5">
            <h3 className="font-bold text-[#39FF14] mb-3">🚀 Diferenciais Técnicos</h3>
            <ul className="space-y-1.5 text-sm text-gray-300">
              <li>✓ IA dupla: Gemini 2.0 Flash + Groq Llama 3.3 (fallback automático)</li>
              <li>✓ Pedágios reais via API da ANTT para todo o Brasil</li>
              <li>✓ Cobertura de 8 países da América do Sul</li>
              <li>✓ 28 modelos de carros elétricos com análise de autonomia</li>
              <li>✓ Eletropostos via OpenChargeMap (cobertura global)</li>
              <li>✓ 10 perfis de viajante incl. acessibilidade e LGBT+</li>
              <li>✓ PWA pronto para iOS e Android</li>
              <li>✓ WCAG 2.1 AA — acessibilidade completa</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-[#FF6B35]/10 to-transparent border border-[#FF6B35]/20 rounded-2xl p-5">
            <h3 className="font-bold text-[#FF6B35] mb-3">💰 Modelo de Receita</h3>
            <ul className="space-y-1.5 text-sm text-gray-300">
              <li>📱 Afiliados: Booking.com, GetYourGuide, Decolar (pendentes)</li>
              <li>🏨 Comissão por reserva de hospedagem</li>
              <li>🚗 Afiliado de aluguel de carros</li>
              <li>⭐ Plano Premium (histórico ilimitado, sem anúncios)</li>
              <li>🏢 B2B: API para agências e plataformas de turismo</li>
              <li>📊 Dados anonimizados de rotas para análise do setor</li>
            </ul>
          </div>
        </div>

        {/* Stack técnica */}
        <SectionTitle><Car className="w-4 h-4"/> Stack Tecnológica</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {['Next.js 14','React','Tailwind CSS','Supabase (PostgreSQL)','Gemini 2.0 Flash',
            'Groq Llama 3.3','OSRM (mapas)','OpenWeatherMap','calcularpedagio.com.br',
            'OpenChargeMap','Vercel','TypeScript-ready','WCAG 2.1 AA','i18n PT/EN/ES'].map(t => (
            <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400">{t}</span>
          ))}
        </div>

        <div className="mt-8 pb-4 text-xs text-gray-700 text-center">
          Acesso restrito — {ADMIN_EMAIL} · BoraRodar © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
