# Ops-1 Workflows - Versiones Corregidas

## Archivos Incluidos

| Archivo | Descripción |
|---------|-------------|
| `execution-workflow-FIXED.json` | Motor de ejecución con umbral 0.75, error handling, timeouts |
| `configuration-workflow-FIXED.json` | Configuración con PDF Legal Cleaner Pro integrado |
| `compliance-workflow-FIXED.json` | Compliance con mejor manejo de errores y timeouts |

---

## Cambios Principales

### 1. Execution Workflow

**Nodo: Parse Retrieved Rules**
- Umbral subido de 0.5 a 0.75 (reduce falsos positivos en legal/auditoría)
- Fallback robusto cuando no hay matches
- Logging de métricas para auditoría

**Nodo: Retrieve Client Rules (Pinecone)**
- Agregado header `Api-Key` explícito
- Timeout de 30 segundos

**NUEVO: Embedding OK? + Embedding Fallback**
- Verifica que OpenAI generó el embedding correctamente
- Si falla, continúa con fallback sin crashear

**Todos los nodos Claude/OpenAI**
- Timeout de 60 segundos

### 2. Configuration Workflow

**NUEVO: PDF Legal Cleaner Pro**
- Limpia PDFs fiscales antes de PII Sanitization
- Elimina paginación, headers repetitivos
- Une líneas rotas (crítico para documentos legales)
- Normaliza términos fiscales (Art., Inc., Nº)
- Soporta: AFIP, IRS, CRA, SAT, BOE

**Nodo: Upsert to Pinecone**
- Agregado header `Api-Key`
- Timeout de 30 segundos

**Response mejorado**
- Incluye métricas del PDF Cleaner (reduction_percent)

### 3. Compliance Workflow

**Nodo: Compliance Scan (Claude)**
- Timeout de 60 segundos

**Nodo: Parse Compliance Result**
- Mejor manejo de respuestas vacías
- Logging mejorado

**Response mejorado**
- Incluye compliance_metrics (threshold_used, avg_score)

---

## Variables de Entorno Requeridas

Configura estas variables en n8n (Settings > Variables):

```
PINECONE_HOST=tu-index-abc123.svc.us-west4-gcp.pinecone.io
PINECONE_API_KEY=tu-pinecone-api-key
OPENAI_API_KEY=tu-openai-api-key
N8N_WEBHOOK_BASE_URL=https://tu-n8n-url.com
```

**IMPORTANTE:** `PINECONE_HOST` debe ser el host completo del índice (sin https:// ni /query).
Encuéntralo en: Pinecone Console > Tu índice > Overview > Index host

---

## Cómo Importar

1. En n8n, ve a **Workflows**
2. Click en **Import from file**
3. Selecciona cada archivo JSON
4. **IMPORTANTE:** Actualiza los IDs de credenciales:
   - Busca `POSTGRES_CREDENTIAL_ID` y reemplaza con tu ID real
   - Busca `OPENAI_CREDENTIAL_ID` y reemplaza con tu ID real
   - Busca `ANTHROPIC_CREDENTIAL_ID` y reemplaza con tu ID real
   - Busca `PINECONE_CREDENTIAL_ID` y reemplaza con tu ID real

---

## Testing

### Test 1: Configuration Workflow
```bash
curl -X POST https://tu-n8n-url/webhook/ops1/configure \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "TEST_CLIENT",
    "data": {
      "content": "Regla 1: Usar formato DD/MM/YYYY para fechas. Regla 2: Redondear a 2 decimales."
    }
  }'
```

### Test 2: Execution Workflow
```bash
curl -X POST https://tu-n8n-url/webhook/ops1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "TEST_CLIENT",
    "task_description": "Formatear columna de fechas",
    "mode": "excel",
    "data": {"columns": ["fecha", "monto"]}
  }'
```

---

## Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| 401 en Pinecone | API key inválida | Verifica PINECONE_API_KEY |
| 404 en Pinecone | Host incorrecto | Verifica PINECONE_HOST (debe ser completo) |
| 0 reglas siempre | Umbral muy alto | Baja a 0.70 o verifica embeddings |
| Timeout | Red lenta | Los timeouts de 30-60s deberían manejarlo |

---

## Ajuste del Umbral

Después de 20-30 ejecuciones, revisa los logs:

- Si muchas reglas irrelevantes pasan → sube a 0.78-0.82
- Si reglas relevantes se filtran → baja a 0.70-0.72
- Si está balanceado → mantén 0.75

---

## Soporte

Creado para Ops-1 / Multicomm.ai
Mercado objetivo: Contadores latinos en USA/Canadá
