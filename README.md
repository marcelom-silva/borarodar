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
| IA Principal | Google Gemini 2.0 Flash (1.500 req/dia gratuito) |
| IA Fallback | Groq Llama 3.3 70B (14.400 req/dia gratuito) |
| Clima | OpenWeatherMap (1.000 req/dia gratuito) |
| Deploy | Vercel |
| PWA | Service Worker + Web App Manifest |

---

## ✨ Funcionalidades

### 🗺️ Planejador de Rotas
- Autocomplete de cidades via Nominatim (OpenStreetMap)
- Até 4 paradas intermediárias
- Cálculo de rota via OSRM com visualização Leaflet
- **2 modos:** Planejamento Completo (rota + orçamento + roteiro) ou Montar Roteiro (só itinerário)
- Toggles: Ida e Volta, Evitar Pedágios
- **Validação completa:** campos obrigatórios, lógica de datas, ranges de valores

### 🎲 Destino Surpresa
- Botão "Me surpreenda! 🎲" no formulário
- IA sugere 3 destinos: Próximo (<3h), Médio (3-6h), Aventura (+6h ou internacional)
- Cada sugestão mostra: tempo de viagem, distância, destaque principal, dica local exclusiva
- Um clique preenche o formulário automaticamente

### 🚗 Seletor de Veículo
- 100+ modelos populares no Brasil (Fiat, VW, GM, Toyota, Honda, etc.)
- 3 campos: Marca → Modelo → Ano com busca/filtro
- Km/L sugerido automaticamente por modelo
- Multiplicador de pedágio por tipo (moto 0.5×, carro 1×, pickup 1.5×, motorhome 2×, caminhão 2.5×)

### 💰 Orçamento Detalhado
- Custos separados: **Veículo** (combustível + pedágios) vs **Roteiro** (alimentação + hospedagem)
- Racha por pessoa calculado automaticamente
- 3 estilos: Econômico 💰 / Moderado ⚖️ / Esbanjando ✨

### 👥 Perfis de Viajante
| Perfil | Foco |
|--------|------|
| 🧍 Solo | Segurança, hostels sociais, economia |
| 👫 Casal | Romântico, mirantes, spa, boutique |
| 👩 Só Mulheres | **Safety-first**, locais movimentados, dicas de segurança feminina |
| 👶 Família+Bebê | Acessibilidade carrrinho, trocador, antes das 17h, **confirmação obrigatória** |
| 👴 Com Idosos | Acessibilidade total, passeios curtos, ritmo tranquilo |
| 👥 Grupo de Amigos | Atividades em grupo, happy hour, custo-benefício |
| 🐾 Com Pets | **Pet-friendly exclusivo**, confirmação de políticas, dicas de vets |

### 🤖 Roteiro com IA (Gemini → Groq fallback automático)
- **Prompt em 2 fases:** planejamento de tema por dia → execução sem repetições
- **60% clássicos + 40% descobertas locais** que guias não mencionam
- **"Vale o desvio":** locais que valem mesmo sendo distantes
- Mini-mapa Leaflet por dia com marcadores numerados
- Botão "Abrir dia no Google Maps" com rota multi-parada sequencial
- Links diretos: Google Maps, Booking.com, GetYourGuide
- **Fallback automático:** Gemini → Groq/Llama se limite diário atingido

### 🛡️ Alertas de Segurança
- IA identifica trechos perigosos na rota específica
- Alertas de criminalidade, horários a evitar, áreas de risco
- Cobertura: Brasil (polígono da Bahia, trechos noturnos) e internacional (cartéis, áreas restritas)
- Integrado no roteiro E na checklist de viagem

### 📋 Checklist de Viagem
- Categorias: Documentos Pessoais, Itens do Carro, Roupas, Medicamentos, Eletrônicos, Emergência
- **Fronteiras internacionais:** requisitos específicos por país
  - 🇦🇷 Argentina: RG/Passaporte + Carta Verde + extintor + triângulo + colete
  - 🇨🇱 Chile: SOAP EX + proibição de alimentos frescos na fronteira
  - 🇧🇴 Bolívia: galão de combustível extra + altitude + documentação
  - 🇵🇾 Paraguai: RG + limite aduaneiro
  - 🇺🇾 Uruguai: SOAT + pneu reserva
  - 🇲🇽 México: TIP + seguro mexicano + zonas de risco
- **Pets:** certidão veterinária, vacina antirrábica, microchip, CRMV, exigências do país
- **Bebê:** cadeirinha (norma do país), certidão, autorização notarial
- Items com checkbox (marca como "feito")
- Nota obrigatória recomendando confirmação com consulados e estabelecimentos

### ⛅ Clima em Tempo Real
- Busca automática ao digitar o destino
- Previsão de 5 dias via OpenWeatherMap
- Mostra: temperatura máx/mín, condições, umidade, ícone do tempo
- Fallback: dicas sazonais baseadas no mês (sem API key)

### 📅 Período e Dicas Sazonais
- Seletor de data de ida e retorno
- **Auto-calcula noites** e exibe "X noites → Y dias de roteiro"
- Dicas automáticas de clima e vestuário por época
- Cobre: Carnaval, Semana Santa, Festas Juninas, verão, inverno, chuvas

### 📍 Passeios de Um Dia (/explorar)
6 roteiros curados com dados reais:
- Ouro Preto · Gramado/Canela · Bonito · Campos do Jordão · Chapada dos Veadeiros · Paraty
- Cada um: paradas com horários, mini-mapa Leaflet interativo, link Google Maps completo
- Botão "Planejar" pré-preenche o planejador

### 📱 PWA — Instalar como App
- `manifest.json` configurado (ícone, nome, cores, atalhos)
- Service Worker com cache offline das páginas principais
- Estratégia: cache-first para assets, stale-while-revalidate para páginas, network-only para APIs
- Instalar: Chrome/Safari → "Adicionar à tela inicial"

### 🌐 Internacionalização
- 🇧🇷 Português (PT) — padrão
- 🇺🇸 English (EN)
- 🇪🇸 Español (ES)
- ~200 chaves de tradução em `translations.js`
- Persistência via localStorage

### 🔐 Autenticação
- Login email/senha ou Google OAuth
- Avatar + primeiro nome no Navbar quando logado
- Dropdown: Perfil + Sair

---

## 🚀 Setup Local

### Pré-requisitos
- Node.js 18+

### Instalação
```bash
git clone https://github.com/marcelom-silva/borarodar.git
cd borarodar
npm install
```

### Variáveis de Ambiente

Crie `.env.local` na raiz:

```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Google Gemini — IA principal (obrigatório)
# https://aistudio.google.com/app/apikey
NEXT_PUBLIC_GEMINI_API_KEY=AIza...

# Groq — IA fallback (recomendado — gratuito)
# https://console.groq.com/
NEXT_PUBLIC_GROQ_API_KEY=gsk_...

# OpenWeatherMap — Clima em tempo real (opcional — gratuito)
# https://openweathermap.org/api
NEXT_PUBLIC_OPENWEATHER_API_KEY=

# URL do app
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Afiliados (opcional — adicionar quando disponível)
NEXT_PUBLIC_BOOKING_AFFILIATE_ID=
NEXT_PUBLIC_DECOLAR_AFFILIATE_ID=
NEXT_PUBLIC_GYG_AFFILIATE_ID=
NEXT_PUBLIC_TRIPADVISOR_AFFILIATE_ID=
```

### Executar
```bash
npm run dev
```
Acesse http://localhost:3000

---

## 🗄️ Banco de Dados (Supabase)

Execute no SQL Editor do Supabase:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT, full_name TEXT, avatar_url TEXT,
  km_rodados INT DEFAULT 0, viagens_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  origem TEXT, destino TEXT, distance_km NUMERIC,
  budget JSONB, route_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  user_name TEXT, content TEXT, tip_type TEXT,
  likes INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: cria perfil automaticamente
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE community_tips;
```

---

## 🔐 Google OAuth

1. Google Cloud Console → Criar credencial OAuth 2.0 Web
2. Origens autorizadas: `http://localhost:3000`, `https://borarodar.vercel.app`
3. URIs de redirecionamento: `https://xxx.supabase.co/auth/v1/callback`
4. Supabase → Auth → Providers → Google → habilitar + colar Client ID e Secret
5. Supabase → Auth → URL Config → Site URL: `https://borarodar.vercel.app`

---

## 🚢 Deploy (Vercel)

Push para `main` → deploy automático.

Variables no Vercel:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_GEMINI_API_KEY
NEXT_PUBLIC_GROQ_API_KEY
NEXT_PUBLIC_OPENWEATHER_API_KEY
NEXT_PUBLIC_APP_URL=https://borarodar.vercel.app
```

---

## 📁 Estrutura

```
src/
  app/
    layout.js              # LanguageProvider + manifest link + SW registration
    page.js                # Home
    planejar/page.js
    comunidade/page.js
    explorar/page.js
    perfil/page.js
    ajuda/page.js
  components/
    home/
      Hero.jsx             # Título animado + autocomplete de destino
      Features.jsx         # Cards de funcionalidades
      AnimatedMap.jsx      # Mapa esquemático do Brasil
      TrendingRoutes.jsx
      CommunityPreview.jsx
    layout/
      Navbar.jsx           # Logo, links, bandeiras, avatar do usuário
      Footer.jsx
    planner/
      PlannerMain.jsx      # Orquestrador principal
      RouteForm.jsx        # Formulário com validação + SurpriseMode integrado
      SurpriseMode.jsx     # Modo destino surpresa (3 opções da IA)
      VehicleSelect.jsx    # Seletor marca/modelo/ano
      BudgetBreakdown.jsx  # Orçamento separado veículo/roteiro
      StopPoints.jsx       # Pit stops e atrações
      SafetyAlerts.jsx     # Alertas de segurança da rota
      DayItinerary.jsx     # Roteiro IA com mapa + disclaimer bebê/pet
      TravelChecklist.jsx  # Checklist com fronteiras, segurança, pets, bebê
      WeatherWidget.jsx    # Clima em tempo real (OpenWeatherMap)
      ExportOptions.jsx    # WhatsApp, PDF, Email, Link
    community/CommunityPage.jsx
    explore/ExplorePage.jsx      # Passeios de Um Dia + Rotas + Destinos
    profile/ProfilePage.jsx
    help/HelpPage.jsx            # FAQ completo PT/EN/ES via getFAQData(lang)
    ui/
      CityAutocomplete.jsx       # Autocomplete Nominatim debounced
      DayTripLeaflet.jsx         # Mapa Leaflet para passeios
      DayTripMap.jsx             # Wrapper SSR-safe
  lib/
    ai.js                  # Gemini + Groq fallback; itinerary, checklist, surprise
    budget.js              # Orçamento + dicas sazonais com t()
    routing.js             # OSRM multi-waypoints
    supabase.js
    translations.js        # PT/EN/ES — ~200 chaves
    vehicleData.js         # Veículos BR com km/L
    itinerary.js           # Fallback estático
    export.js
  contexts/
    LanguageContext.jsx
public/
  logo.png
  manifest.json            # PWA manifest
  sw.js                    # Service Worker (cache + offline)
```

---

## ✅ Checklist ao adicionar feature

- [ ] Strings visíveis usam `t('chave')`?
- [ ] Chave adicionada em PT, EN e ES em `translations.js`?
- [ ] FAQ em `HelpPage.jsx` atualizado nas 3 línguas via `getFAQData(lang)`?
- [ ] `README.md` atualizado?
- [ ] Commit com prefixo `feat:`, `fix:` ou `docs:`?

---

## 🤝 Afiliados (Pendentes)

| Programa | URL |
|----------|-----|
| Booking.com | https://www.booking.com/affiliate-program/ |
| GetYourGuide | https://partner.getyourguide.com/ |
| Decolar.com | https://www.decolar.com/afiliados |

---

*Feito com ☕ e estrada. Bora Rodar! 🚗*
