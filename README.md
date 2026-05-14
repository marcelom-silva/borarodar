# 🚗 BoraRodar

> Planejador inteligente de viagens de carro — gratuito, open source e feito para a estrada.

**Produção:** https://borarodar.vercel.app  
**Repositório:** https://github.com/marcelom-silva/borarodar

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth — Email + Google OAuth |
| Mapas | Leaflet + OpenStreetMap |
| Roteamento | OSRM (gratuito, sem API key) |
| Geocoding/Autocomplete | Nominatim (OpenStreetMap) |
| IA / Roteiro | Google Gemini Flash |
| Deploy | Vercel |
| Afiliados (pendente) | Booking.com, GetYourGuide, Decolar |

---

## ✨ Funcionalidades

### Planejador de Rotas
- Autocomplete de cidades via Nominatim (OpenStreetMap)
- Até 4 paradas intermediárias
- Cálculo de rota via OSRM com visualização no mapa (Leaflet)
- Dois modos: **Planejamento Completo** (rota + orçamento + roteiro) e **Montar Roteiro** (apenas itinerário IA)
- Toggles: Ida e Volta, Evitar Pedágios

### Seletor de Veículo
- Banco de dados com 100+ modelos populares no Brasil (Fiat, VW, GM, Toyota, Honda, etc.)
- 3 campos: Marca → Modelo → Ano com filtro de busca
- Km/L sugerido automaticamente pelo modelo selecionado
- Default: sedan/hatch 1.6 (13 km/L) se nenhum veículo selecionado
- Multiplicador de pedágio por tipo de veículo (moto 0.5×, carro 1×, pickup 1.5×, motorhome 2×, caminhão 2.5×)

### Orçamento Separado
- **Custos do Veículo:** combustível + pedágios
- **Custos do Roteiro:** alimentação + hospedagem
- **Racha por pessoa:** total / nº de passageiros
- Estilos: Econômico 💰 / Moderado ⚖️ / Esbanjando ✨

### Perfil de Viajante
- 5 perfis: Solo 🧍, Casal 👫, Família+Bebê 👶, Com Idosos 👴, Grupo 👥
- A IA adapta 100% do roteiro: locais, horários, acessibilidade, clima de cada perfil

### Período e Clima
- Campos de Data de Ida e Data de Retorno (dia/mês/ano)
- Dicas automáticas de clima, vestuário e eventos sazonais por data
- Cobre: verão, inverno, época de chuvas, Carnaval, Semana Santa, Festas Juninas

### Roteiro com IA (Google Gemini)
- Itinerário dia a dia (manhã, tarde, noite)
- Sugestões de refeições com links para Google Maps
- Sugestões de hospedagem com links para Booking.com
- Links de atividades via GetYourGuide
- Sem repetição de atrações ou check-in nos dias seguintes
- Limite gratuito: 1.500 req/dia

### Links Externos
- Cada local sugerido tem link "Ver no Maps" (Google Maps)
- Hospedagem: link para Booking.com
- Atividades: link para GetYourGuide
- Todos os links abrem em nova aba com aviso ao usuário
- **IDs de afiliado:** configuráveis via variáveis de ambiente (ver abaixo)

### Comunidade
- Feed de dicas em tempo real (Supabase Realtime)
- Ranking de exploradores
- Publicação de alertas e avaliações de rota

### Autenticação
- Login por email/senha
- Login com Google OAuth
- Avatar + primeiro nome do usuário no Navbar quando logado
- Dropdown com link para Perfil e botão Sair

### Internacionalização
- 🇧🇷 Português (PT) — padrão
- 🇺🇸 English (EN)
- 🇪🇸 Español (ES)
- Seletor de idioma no Navbar (bandeiras)
- Persistência via localStorage

---

## 🚀 Setup Local

### Pré-requisitos
- Node.js 18+
- npm

### Instalação

```bash
git clone https://github.com/marcelom-silva/borarodar.git
cd borarodar
npm install
```

### Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Google Gemini (IA para roteiros)
# Obtenha em: https://aistudio.google.com/app/apikey
NEXT_PUBLIC_GEMINI_API_KEY=AIza...

# URL do app
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Afiliados — adicionar quando disponível (links já preparados no código)
NEXT_PUBLIC_BOOKING_AFFILIATE_ID=
NEXT_PUBLIC_DECOLAR_AFFILIATE_ID=
NEXT_PUBLIC_GYG_AFFILIATE_ID=
NEXT_PUBLIC_TRIPADVISOR_AFFILIATE_ID=
```

### Rodar

```bash
npm run dev
```

Acesse http://localhost:3000

---

## 🗄️ Banco de Dados (Supabase)

Execute o seguinte SQL no Editor SQL do Supabase:

```sql
-- Perfis de usuário
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT, full_name TEXT, avatar_url TEXT,
  km_rodados INT DEFAULT 0, viagens_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Viagens salvas
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  origem TEXT, destino TEXT, distance_km NUMERIC, duration_hours NUMERIC,
  budget JSONB, route_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dicas da comunidade
CREATE TABLE community_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  user_name TEXT, content TEXT, tip_type TEXT,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Curtidas
CREATE TABLE tip_likes (
  user_id UUID, tip_id UUID,
  PRIMARY KEY (user_id, tip_id)
);

-- Trigger: cria perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips            ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_tips   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_likes         ENABLE ROW LEVEL SECURITY;

-- Realtime para comunidade
ALTER PUBLICATION supabase_realtime ADD TABLE community_tips;
```

---

## 🔐 Google OAuth (Supabase)

1. **Google Cloud Console** → Criar credencial OAuth 2.0 para Web
2. **Origens JavaScript autorizadas:**
   - `http://localhost:3000`
   - `https://borarodar.vercel.app`
3. **URIs de redirecionamento autorizados:**
   - `https://xxx.supabase.co/auth/v1/callback`
   - `https://borarodar.vercel.app`
4. **Supabase** → Authentication → Sign In / Providers → Google → Habilitar → colar Client ID e Secret
5. **Supabase** → Authentication → URL Configuration:
   - Site URL: `https://borarodar.vercel.app`
   - Redirect URLs: `https://borarodar.vercel.app/**` e `http://localhost:3000/**`

---

## 🚢 Deploy (Vercel)

Push para `main` → Vercel faz deploy automático.

Adicionar no Vercel → Environment Variables:

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key do Supabase |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Chave da API Gemini |
| `NEXT_PUBLIC_APP_URL` | `https://borarodar.vercel.app` |
| `NEXT_PUBLIC_BOOKING_AFFILIATE_ID` | ID afiliado Booking (opcional) |
| `NEXT_PUBLIC_GYG_AFFILIATE_ID` | ID afiliado GetYourGuide (opcional) |

---

## 🤝 Programas de Afiliados (Pendente)

Cadastros realizados / em processo:

| Programa | URL | Status |
|----------|-----|--------|
| Booking.com | https://www.booking.com/affiliate-program/ | Pendente ID |
| GetYourGuide | https://partner.getyourguide.com/ | Pendente ID |
| Decolar.com | https://www.decolar.com/afiliados | Pendente ID |
| TripAdvisor | https://www.cj.com (buscar TripAdvisor) | Pendente ID |

Quando os IDs chegarem, adicionar nas variáveis de ambiente — o código já está preparado.

---

## 📁 Estrutura de Arquivos

```
src/
  app/
    layout.js              # LanguageProvider wrapper
    page.js                # Home
    planejar/page.js
    comunidade/page.js
    explorar/page.js
    perfil/page.js
    ajuda/page.js
  components/
    home/
      Hero.jsx             # Título animado com rodas SVG + autocomplete
      Features.jsx         # Cards de funcionalidades com scroll reveal
      AnimatedMap.jsx      # Mapa esquemático do Brasil com carrinho SVG
      TrendingRoutes.jsx   # Rotas em alta
      CommunityPreview.jsx # Preview do feed da comunidade
    layout/
      Navbar.jsx           # Logo, links, bandeiras, avatar do usuário logado
      Footer.jsx           # Links, redes sociais
    planner/
      PlannerMain.jsx      # Orquestrador principal do planejador
      RouteForm.jsx        # Formulário (modo, perfil, rota, veículo, período)
      MapView.jsx          # Wrapper SSR-safe do Leaflet
      LeafletMap.jsx       # Mapa interativo com marcadores
      VehicleSelect.jsx    # Seletor de marca/modelo/ano com filtro
      BudgetBreakdown.jsx  # Custos separados (veículo / roteiro / racha)
      StopPoints.jsx       # Pit stops e atrações da rota
      SafetyAlerts.jsx     # Alertas de segurança por distância e veículo
      DayItinerary.jsx     # Roteiro IA com links Maps/Booking/GYG
      ExportOptions.jsx    # WhatsApp, PDF, Email, Link
    community/
      CommunityPage.jsx
    explore/
      ExplorePage.jsx
    profile/
      ProfilePage.jsx      # Login email/Google + perfil do usuário
    help/
      HelpPage.jsx         # FAQ completo
    ui/
      CityAutocomplete.jsx # Autocomplete Nominatim debounced
  lib/
    ai.js                  # Gemini API + mapsLink/bookingLink/gygLink
    budget.js              # Cálculo de orçamento + dicas sazonais (com t())
    routing.js             # OSRM multi-waypoints
    supabase.js            # Cliente Supabase
    translations.js        # PT / EN / ES — ~170 chaves
    vehicleData.js         # Base de veículos BR com km/L e tipo
    itinerary.js           # Fallback estático de roteiro
    export.js              # Exportação para PDF / WhatsApp / Email
  contexts/
    LanguageContext.jsx    # Provider com t(), lang, setLang + localStorage
  hooks/
    useAuth.js
    useTrip.js
public/
  logo.png                 # Logo da estrada ao pôr do sol
```

---

## 📝 Convenções de Desenvolvimento

### Tradução
Todo texto visível ao usuário **deve** usar `t('chave')` via `useLanguage()`. Nunca adicionar strings hardcoded em PT nos componentes. Ao criar uma nova chave:
1. Adicionar em `translations.js` nas três línguas (pt, en, es)
2. Usar `t('nova_chave')` no componente

### Novos componentes
Seguir o padrão:
```jsx
'use client';
import { useLanguage } from '@/contexts/LanguageContext';
export default function MeuComponente() {
  var { t } = useLanguage();
  // ...
}
```

### Checklist ao adicionar uma feature
- [ ] Strings visíveis usam `t()`?
- [ ] Chaves adicionadas em PT, EN e ES em `translations.js`?
- [ ] HelpPage.jsx atualizado com FAQ se necessário?
- [ ] README.md atualizado?
- [ ] Commit com mensagem descritiva (`feat:`, `fix:`, `docs:`)?

---

## 🐛 Bugs Conhecidos / Pendências

- [ ] IDs de afiliados (Booking, GYG, Decolar, TripAdvisor) — aguardando cadastros
- [ ] Salvar viagens no banco (ProfilePage → histórico de viagens)
- [ ] Achievements / medalhas funcionais (banco já criado, lógica pendente)
- [ ] HelpPage em EN e ES com FAQ completo (atualmente PT)
- [ ] StopPoints: dados estáticos — futura integração com API de POIs

---

*Feito com ☕ e estrada. Bora Rodar! 🚗*
