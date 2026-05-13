# 🚗💨 Bora Rodar

> Planejador de viagens de carro feito para o Brasil. Calcule rotas, orçamentos, gere roteiros com IA e descubra destinos incríveis.

**Site:** [borarodar.vercel.app](https://borarodar.vercel.app) &nbsp;|&nbsp; **Stack:** Next.js 14 + Supabase + Gemini AI

---

## ✨ Funcionalidades

| Feature | Descrição | Tecnologia |
|---|---|---|
| 🗺️ Rotas inteligentes | Calcula o melhor caminho com waypoints | OSRM + OpenStreetMap |
| 💰 Orçamento detalhado | Combustível, pedágios, comida, hotel | Cálculo próprio |
| 🤖 Roteiro com IA | Itinerário dia a dia personalizado | Google Gemini Flash |
| 📍 Paradas e atrações | Pit stops + atrações por região (Vale o Desvio) | Banco estático + IA |
| 🛡️ Alertas de segurança | Dicas de segurança baseadas na distância | Lógica própria |
| 👥 Comunidade | Feed de dicas em tempo real | Supabase Realtime |
| 🏆 Gamificação | Medalhas e ranking de exploradores | Supabase |
| 📤 Exportação | WhatsApp, PDF, e-mail, link | jsPDF + Web APIs |
| 🌐 Multilíngue | Português, English, Español | Context API própria |
| 🔐 Autenticação | E-mail/senha + Login com Google | Supabase Auth |

---

## 🛠️ Stack Técnica

```
Frontend:     Next.js 14 (App Router) + React 18 + Tailwind CSS
Banco:        Supabase (PostgreSQL) — plano gratuito
Auth:         Supabase Auth (email + Google OAuth)
Mapas:        Leaflet + OpenStreetMap (100% gratuito, sem chave)
Rotas:        OSRM — Open Source Routing Machine (100% gratuito)
Geocodificação: Nominatim / OpenStreetMap (100% gratuito)
IA:           Google Gemini Flash — 1.500 req/dia gratuito
PDF:          jsPDF
Deploy:       Vercel — plano gratuito
```

**Custo mensal em produção: R$ 0,00** (dentro dos limites gratuitos de cada serviço)

---

## 🚀 Setup Local

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com) (grátis)
- Conta no [Google Cloud Console](https://console.cloud.google.com) (grátis)
- Chave do [Google AI Studio](https://aistudio.google.com/app/apikey) (grátis)

### 1. Clonar e instalar
```bash
git clone https://github.com/marcelom-silva/borarodar.git
cd borarodar
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas chaves:
```env
# Supabase (Settings > API no painel do projeto)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Google Gemini — https://aistudio.google.com/app/apikey
NEXT_PUBLIC_GEMINI_API_KEY=AIza...

# URL do app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Criar tabelas no Supabase
Cole este SQL no **SQL Editor** do painel do Supabase:

```sql
-- Perfis
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT, full_name TEXT, avatar_url TEXT,
  total_trips INT DEFAULT 0, total_km FLOAT DEFAULT 0, total_tips INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Viagens
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, origin TEXT NOT NULL, destination TEXT NOT NULL,
  origin_coords JSONB, destination_coords JSONB, waypoints JSONB DEFAULT '[]',
  distance_km FLOAT, duration_hours FLOAT, total_days INT DEFAULT 1,
  budget JSONB, is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dicas da comunidade
CREATE TABLE IF NOT EXISTS community_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT NOT NULL DEFAULT 'Anonimo',
  content TEXT NOT NULL, tip_type TEXT DEFAULT 'dica', likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfil proprio" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "viagem propria" ON trips FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "viagem publica" ON trips FOR SELECT USING (is_public = true);
CREATE POLICY "dicas select" ON community_tips FOR SELECT USING (true);
CREATE POLICY "dicas insert" ON community_tips FOR INSERT WITH CHECK (true);

-- Trigger: cria perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Realtime para o feed da comunidade
ALTER PUBLICATION supabase_realtime ADD TABLE community_tips;
```

### 4. Configurar Google OAuth (para login com Google)
1. [console.cloud.google.com](https://console.cloud.google.com) → Criar projeto → `BoraRodar`
2. **APIs e serviços → Tela de consentimento OAuth** → Externo → preencher nome e e-mail
3. **Credenciais → Criar credencial → ID do cliente OAuth → Aplicativo da Web**
4. Origens autorizadas: `https://xxxx.supabase.co`
5. Redirecionamento: `https://xxxx.supabase.co/auth/v1/callback`
6. No Supabase: **Authentication → Providers → Google** → habilitar → colar Client ID e Secret

### 5. Rodar
```bash
npm run dev
```
Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # Páginas (Next.js App Router)
│   ├── layout.js           # Layout raiz com providers
│   ├── page.js             # Home
│   ├── planejar/page.js    # Planejador de rota
│   ├── comunidade/page.js  # Comunidade
│   ├── explorar/page.js    # Explorar destinos
│   ├── perfil/page.js      # Perfil e autenticação
│   └── ajuda/page.js       # Página de ajuda
│
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── home/               # Hero, AnimatedMap, Features, TrendingRoutes...
│   ├── planner/            # PlannerMain, RouteForm, MapView, DayItinerary...
│   ├── community/          # CommunityPage
│   ├── explore/            # ExplorePage
│   ├── profile/            # ProfilePage
│   └── help/               # HelpPage
│
├── lib/
│   ├── supabase.js         # Cliente Supabase
│   ├── routing.js          # OSRM (rotas) + Nominatim (geocoding)
│   ├── budget.js           # Cálculo de orçamento
│   ├── export.js           # Export PDF
│   ├── ai.js               # Google Gemini API
│   ├── itinerary.js        # Banco de roteiros estáticos (fallback)
│   ├── translations.js     # Dicionário de traduções (PT/EN/ES)
│   └── utils.js            # Utilitários
│
├── contexts/
│   └── LanguageContext.jsx # Provider de idioma (PT/EN/ES)
│
└── hooks/
    ├── useAuth.js          # Hook de autenticação
    └── useTrip.js          # Hook de viagens
```

---

## 🤖 Como funciona o Agente de IA

O BoraRodar não usa múltiplos agentes. Um único prompt bem estruturado é enviado ao **Google Gemini Flash**:

```
Usuário informa → destino, dias, pessoas, interesses, orçamento
         ↓
Prompt estruturado → enviado ao Gemini (em português)
         ↓
Gemini retorna → JSON com roteiro dia a dia
         ↓
App exibe → manhã/tarde/noite + refeições + hospedagem + dicas
```

**Fallback:** Se a chave Gemini não estiver configurada ou o limite diário for atingido, o app exibe roteiros do banco estático (Campos do Jordão, Gramado, Ouro Preto, etc.).

**Limite gratuito:** 1.500 requisições/dia no Gemini Flash. Suficiente para projetos pessoais e pequenos startups.

---

## 🌐 Deploy no Vercel

1. Push para GitHub: `git push origin main`
2. [vercel.com](https://vercel.com) → Import do repositório `borarodar`
3. **Environment Variables** → adicionar as mesmas do `.env.local`
4. Deploy → aguardar ~2 minutos
5. Após deploy: atualizar **Site URL** no Supabase com a URL do Vercel

---

## 📝 Variáveis de Ambiente

| Variável | Obrigatório | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chave anon do Supabase |
| `NEXT_PUBLIC_GEMINI_API_KEY` | ⚡ Opcional | Chave Gemini (IA). Sem ela usa banco estático |
| `NEXT_PUBLIC_APP_URL` | ⚡ Opcional | URL do app (para links de compartilhamento) |

---

## 🗺️ APIs Utilizadas (todas gratuitas)

| API | Uso | Limite Grátis |
|---|---|---|
| OSRM | Cálculo de rotas | Sem limite (uso justo) |
| Nominatim | Geocodificação de endereços | 1 req/segundo |
| OpenStreetMap | Tiles do mapa | Sem limite (uso justo) |
| Google Gemini Flash | Roteiros com IA | 1.500 req/dia |
| Supabase | Banco + Auth | 500MB, 50.000 usuários |
| Vercel | Hospedagem | 100GB banda, funções serverless |

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Commit: `git commit -m "feat: adiciona minha feature"`
4. Push: `git push origin feat/minha-feature`
5. Abra um Pull Request

---

**Feito com ❤️ para quem ama a estrada brasileira** 🇧🇷
