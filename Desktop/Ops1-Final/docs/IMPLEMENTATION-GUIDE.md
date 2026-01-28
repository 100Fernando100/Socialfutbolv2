# Ops-1 Workflows - Guía de Implementación de Correcciones

## Resumen de Cambios

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `parse-rules-node-FIXED.json` | Corrección | Umbral 0.75 + fallback + logging |
| `retrieve-client-rules-node-FIXED.json` | Corrección | URL Pinecone + headers + timeout |
| `embedding-error-handling-NUEVO.json` | Nuevo | Error handling para embeddings |
| `pdf-legal-cleaner-pro-NUEVO.json` | Nuevo | Limpieza de PDFs fiscales |

---

## Paso 1: Verificar PINECONE_HOST (CRÍTICO)

Antes de cualquier cambio, verifica que tu variable de entorno esté correcta:

1. Ve a [Pinecone Console](https://app.pinecone.io)
2. Selecciona tu índice
3. En "Overview", copia el valor de **"Index host"**
4. Debe verse así: `mi-index-abc123.svc.us-west4-gcp.pinecone.io`
5. En n8n → Settings → Variables, actualiza `PINECONE_HOST` con este valor

**NO incluyas** `https://` ni `/query` - solo el host.

---

## Paso 2: Actualizar Parse Retrieved Rules

**Workflow:** `execution-workflow.json`  
**Nodo:** `Parse Retrieved Rules`

1. En n8n, abre el nodo "Parse Retrieved Rules"
2. Reemplaza todo el código JavaScript con el de `parse-rules-node-FIXED.json`
3. El cambio principal: línea `const THRESHOLD = 0.75;`

**Qué hace:**
- Filtra reglas con score > 0.75 (antes era 0.5)
- Si Pinecone falla o no hay matches → mensaje de fallback claro
- Logging de métricas para auditoría

---

## Paso 3: Actualizar Retrieve Client Rules

**Workflow:** `execution-workflow.json`  
**Nodo:** `Retrieve Client Rules`

1. Abre el nodo HTTP Request "Retrieve Client Rules"
2. Agrega el header `Api-Key` con valor `{{ $env.PINECONE_API_KEY }}`
3. En Options, agrega timeout: `30000` (30 segundos)

---

## Paso 4: Agregar Error Handling para Embeddings

**Workflow:** `execution-workflow.json`

Insertar entre "Embed Task Description" y "Retrieve Client Rules":

1. Crea un nodo IF llamado "Embedding OK?"
2. Condición: `{{ $json.data && $json.data[0] && $json.data[0].embedding && $json.data[0].embedding.length > 100 }}`
3. Rama TRUE → conecta a "Retrieve Client Rules"
4. Rama FALSE → crea nodo Code "Embedding Fallback" con el código del archivo

---

## Paso 5: Agregar PDF Legal Cleaner (Configuration Workflow)

**Workflow:** `configuration-workflow.json`

Insertar DESPUÉS de extraer texto del PDF y ANTES de PII Sanitization:

1. Crea un nodo Code llamado "PDF Legal Cleaner Pro"
2. Pega el código de `pdf-legal-cleaner-pro-NUEVO.json`
3. Conecta: Extract PDF → PDF Legal Cleaner Pro → PII Sanitization
4. En el nodo siguiente, usa `{{ $json.cleaned_content }}` en lugar de `{{ $json.raw_content }}`

---

## Paso 6: Testing

### Test 1: Verificar Pinecone
```bash
curl -X POST "https://TU_PINECONE_HOST/query" \
  -H "Api-Key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"namespace": "test", "vector": [0.1, 0.2, ...], "topK": 5}'
```

### Test 2: Verificar umbral
1. Ejecuta el webhook `/ops1/execute` con una task_description simple
2. Revisa los logs de n8n
3. Busca: `[Ops-1] Retrieval: X/Y reglas > 0.75`
4. Verifica que solo pasen reglas relevantes

### Test 3: Verificar fallback
1. Desconecta temporalmente Pinecone (pon host inválido)
2. Ejecuta el workflow
3. Debe continuar sin crashear, con mensaje de fallback

---

## Ajuste Fino del Umbral

Después de 20-30 ejecuciones reales:

| Si ves esto... | Ajusta a... |
|----------------|-------------|
| Muchas reglas irrelevantes pasan | 0.78 - 0.82 |
| Reglas relevantes se filtran | 0.70 - 0.72 |
| Balance correcto | Mantén 0.75 |

---

## Variables de Entorno Requeridas

```
PINECONE_HOST=tu-index-abc123.svc.region.pinecone.io
PINECONE_API_KEY=tu-api-key
OPENAI_API_KEY=tu-openai-key
```

---

## Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| 401 Unauthorized | API key inválida | Verifica PINECONE_API_KEY |
| 404 Not Found | Host incorrecto | Verifica PINECONE_HOST (debe ser completo) |
| Timeout | Red lenta o Pinecone sobrecargado | El timeout de 30s debería manejarlo |
| 0 reglas siempre | Umbral muy alto o embeddings inconsistentes | Baja a 0.70 o verifica modelo de embedding |

---

## Contacto

Si algo no funciona, revisa:
1. Logs de n8n (cada nodo tiene console.log)
2. Dashboard de Pinecone → Metrics
3. OpenAI Usage para rate limits
