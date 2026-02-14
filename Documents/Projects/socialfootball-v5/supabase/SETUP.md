# SocialFootball.ai - Edge Functions Setup Guide

## Estructura de archivos

Copia estas carpetas a tu proyecto:

```
~/Documents/Projects/socialfootball-v5/
  └── supabase/
      ├── migrations/
      │   ├── 001_drop_all.sql
      │   └── 002_schema_v5_unified.sql
      └── functions/
          ├── sync-teams/
          │   └── index.ts
          └── sync-fixtures/
              └── index.ts
```

## Paso 1: Instalar Supabase CLI (si no lo tenés)

```bash
brew install supabase/tap/supabase
```

## Paso 2: Linkar proyecto

```bash
cd ~/Documents/Projects/socialfootball-v5
supabase login
supabase link --project-ref TU_PROJECT_REF
```

Tu Project Ref lo encontrás en:
Supabase Dashboard → Settings → General → Reference ID

## Paso 3: Configurar secrets (API key)

```bash
supabase secrets set APISPORTS_KEY=tu_key_de_api_sports_aqui
```

SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya están disponibles automáticamente
en Edge Functions, no necesitás configurarlos.

## Paso 4: Deploy

```bash
supabase functions deploy sync-teams
supabase functions deploy sync-fixtures
```

## Paso 5: Probar

### Sync equipos (todas las ligas):
```bash
supabase functions invoke sync-teams
```

### Sync equipos (una liga específica):
```bash
supabase functions invoke sync-teams --body '{"league_id": 128}'
```

### Sync partidos de hoy:
```bash
supabase functions invoke sync-fixtures
```

### Sync partidos en vivo:
```bash
supabase functions invoke sync-fixtures --body '{"mode": "live"}'
```

### Sync próximos partidos:
```bash
supabase functions invoke sync-fixtures --body '{"mode": "upcoming"}'
```

### Sync fecha específica:
```bash
supabase functions invoke sync-fixtures --body '{"mode": "date", "date": "2025-02-15"}'
```

## Paso 6: Verificar en Supabase

```sql
-- Ver equipos sincronizados
SELECT id, name, league_id FROM teams ORDER BY league_id, name LIMIT 50;

-- Ver fixtures
SELECT id, home_team_name, away_team_name, fixture_date, status_short 
FROM fixtures ORDER BY fixture_date LIMIT 20;

-- Ver log de sincronización
SELECT * FROM sync_log ORDER BY started_at DESC LIMIT 10;
```

## Automatización con pg_cron (opcional)

Una vez que funcione manualmente, podés automatizar con cron jobs
directamente desde Supabase SQL Editor:

```sql
-- Habilitar pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Sync partidos en vivo cada 2 minutos (cuando hay partidos)
SELECT cron.schedule(
  'sync-live-fixtures',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/sync-fixtures',
    headers := jsonb_build_object(
      'Authorization', 'Bearer TU_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{"mode": "live"}'
  );
  $$
);

-- Sync partidos de hoy cada hora
SELECT cron.schedule(
  'sync-today-fixtures',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/sync-fixtures',
    headers := jsonb_build_object(
      'Authorization', 'Bearer TU_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{"mode": "today"}'
  );
  $$
);

-- Sync upcoming cada 6 horas
SELECT cron.schedule(
  'sync-upcoming-fixtures',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/sync-fixtures',
    headers := jsonb_build_object(
      'Authorization', 'Bearer TU_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{"mode": "upcoming"}'
  );
  $$
);
```

## Notas sobre API-Sports Rate Limits

- Free plan: 100 requests/day
- Pro plan: 7,500 requests/day
- Las funciones incluyen rate limiting (1.2-1.5s entre llamadas)
- El sync de teams de 15 ligas = 15 API calls
- El sync de fixtures de 15 ligas = 15 API calls
- Live fixtures = 1 API call (trae todos los en vivo)

## Troubleshooting

### Ver logs de Edge Function:
```bash
supabase functions logs sync-teams
supabase functions logs sync-fixtures
```

### Error "APISPORTS_KEY not set":
```bash
supabase secrets set APISPORTS_KEY=tu_key
supabase functions deploy sync-teams
```

### Error de RLS al insertar:
Las Edge Functions usan SUPABASE_SERVICE_ROLE_KEY que bypasea RLS.
Si ves errores de permisos, verificá que estés usando service_role.
