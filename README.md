# Bora Rodar

Planejador de viagens de carro para o Brasil.

## Stack
- Next.js 14 + Tailwind CSS
- Supabase (banco + autenticacao)
- Leaflet + OpenStreetMap (mapas gratuitos)
- OSRM (rotas gratuitas)
- Nominatim (geocodificacao gratuita)

## Rodar localmente
```bash
npm install
cp .env.local.example .env.local
# edite .env.local com suas chaves do Supabase
npm run dev
```

## SQL do Supabase (cole no SQL Editor)
```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT,
  full_name   TEXT,
  total_trips INT DEFAULT 0,
  total_km    FLOAT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trips (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  origin             TEXT NOT NULL,
  destination        TEXT NOT NULL,
  origin_coords      JSONB,
  destination_coords JSONB,
  distance_km        FLOAT,
  duration_hours     FLOAT,
  budget             JSONB,
  is_public          BOOLEAN DEFAULT false,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfil proprio"   ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "viagens proprias" ON trips FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "viagens publicas" ON trips FOR SELECT USING (is_public = true);
```
