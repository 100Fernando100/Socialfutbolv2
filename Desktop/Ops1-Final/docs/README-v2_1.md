# Configuration Workflow v2.1 - Cross-Border Fiscal Rules

## Cambios en v2.1

### Nodo "Rule Extraction (Claude) v2.1"
- **Modelo actualizado**: `claude-3-5-sonnet-latest` (mejor extraccion de reglas complejas)
- **Timeout**: 120s (documentos fiscales largos)
- **Prompt v2.1**: Optimizado para cross-border CA-US-MX

**Prioridades de extraccion:**
1. Withholding Taxes (dividendos, intereses, royalties, servicios tecnicos)
2. VAT/GST/HST (IVA Mexico, GST/HST Canada, Sales Tax USA)
3. Common Deductions (home office, vehicle, QBI, Sec 179)
4. Treaty Provisions (US-MX, US-CA, CA-MX)
5. Simplified Regimes (RESICO, Small Supplier, state exemptions)

### Nodo "Parse & Prepare Rules v2.1"
Nuevo schema con campos adicionales:

```javascript
metadata: {
  // Existentes
  client_id, rule_id, category, rule_text, confidence,

  // NUEVOS en v2.1
  subcategory: "dividends" | "home_office" | "GST_registration" | etc.,
  source_country: "US" | "CA" | "MX" | null,
  recipient_country: "US" | "CA" | "MX" | null,
  applicable_countries: "US,CA,MX",
  rate: "5%" | "16%" | null,
  threshold: "$30,000 CAD" | "$182,100" | null,
  conditions: JSON.stringify([...]),
  exceptions: JSON.stringify([...]),
  source_document: "US-Mexico Tax Treaty",
  article_section: "Article 10, Paragraph 2(a)",
  direct_quote: "...",
  practical_example: "US LLC owns 15% of Mexican SA → 5% WHT"
}
```

### Nodo "PDF Legal Cleaner Pro v2.1"
- Soporta headers de Tax Treaties
- Normaliza Art./Sec./Para. en ambos idiomas
- Optimizado para IRS Pubs, CRA guides, SAT/LISR

---

## Instalacion en n8n

### Opcion 1: Importar workflow completo
1. Abrir n8n
2. Click en "+" → Import from File
3. Seleccionar: `Opus(2.0)/configuration-workflow-v2.1.json`
4. Configurar credenciales (ver abajo)

### Opcion 2: Actualizar nodos individuales
Si prefieres actualizar tu workflow existente:

**1. Reemplazar nodo "Rule Extraction (Claude)"**
- Copiar el `jsonBody` del nodo en `configuration-workflow-v2.1.json` lineas 109-147
- Actualizar nombre a "Rule Extraction (Claude) v2.1"
- Cambiar modelo a `claude-3-5-sonnet-latest`
- Timeout: 120000

**2. Reemplazar nodo "Parse & Prepare Rules"**
- Copiar el `jsCode` completo del nodo en lineas 148-220
- Actualizar nombre a "Parse & Prepare Rules v2.1"

**3. Actualizar referencias**
- Buscar/reemplazar: `$('Parse & Prepare Rules')` → `$('Parse & Prepare Rules v2.1')`
- Buscar/reemplazar: `$('PDF Legal Cleaner Pro')` → `$('PDF Legal Cleaner Pro v2.1')`

---

## Credenciales requeridas

```env
# .env o n8n credentials
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_HOST=xxx-xxx.svc.xxx.pinecone.io

# PostgreSQL
POSTGRES_HOST=...
POSTGRES_DB=ops1
POSTGRES_USER=...
POSTGRES_PASSWORD=...
```

---

## Test rapido

### Prerequisitos
```bash
# macOS
brew install poppler jq curl

# Ubuntu/Debian
sudo apt-get install poppler-utils jq curl
```

### Ejecutar tests
```bash
# Configurar URL de n8n
export N8N_WEBHOOK_BASE_URL="http://localhost:5678"

# Ejecutar suite de tests
cd /Users/fernandosorokin/Desktop/Opsversion
./tests/test-v2.1-cross-border.sh
```

### Tests incluidos
| Test ID | Documento | Reglas esperadas |
|---------|-----------|------------------|
| TEST_US_MX_TREATY | US-Mexico Tax Treaty | Withholding rates (Art. 10, 11, 12), PE rules |
| TEST_IRS_PUB_519 | IRS Pub 519 | Treaty benefits, 183-day rule, residency |
| TEST_CA_GST_HST | CRA GST/HST Guide | Small supplier $30K, place of supply |

---

## Output esperado

### Response exitoso
```json
{
  "success": true,
  "client_id": "TEST_US_MX_TREATY",
  "configuration": {
    "version": "2.1",
    "rules_extracted": 12,
    "status": "active"
  },
  "coverage_summary": {
    "withholding_taxes": { "extracted": true, "rule_count": 5 },
    "vat_gst_hst": { "extracted": false, "reason": "Not in document" },
    "treaty_provisions": { "extracted": true, "rule_count": 7 }
  }
}
```

### Ejemplo de regla extraida (Pinecone metadata)
```json
{
  "rule_id": "R001",
  "category": "WITHHOLDING",
  "subcategory": "dividends",
  "source_country": "MX",
  "recipient_country": "US",
  "rule_text": "Apply 5% withholding on dividends if US corp owns ≥10% of Mexican company",
  "rate": "5%",
  "threshold": "10% ownership",
  "article_section": "Article 10, Paragraph 2(a)",
  "confidence": "HIGH",
  "practical_example": "US LLC owns 15% of SA de CV → 5% WHT instead of 10%"
}
```

---

## Troubleshooting

### Error: "AI_ERROR: Failed to parse JSON"
- Causa: Claude devolvio texto extra fuera del JSON
- Solucion: El codigo ya maneja markdown code blocks, pero si persiste:
  ```javascript
  // En Parse & Prepare Rules, agregar mas patrones:
  jsonText = jsonText.replace(/^[\s\S]*?(\{)/m, '$1');
  jsonText = jsonText.replace(/\}[\s\S]*$/m, '}');
  ```

### Error: Timeout en Rule Extraction
- Causa: Documento muy largo
- Solucion: Reducir `head -c` en el PDF cleaner o aumentar timeout a 180000

### Pocas reglas extraidas
- Revisar `coverage_summary` en response
- Si categoria tiene `"extracted": false`, el documento no contenia esas reglas
- Verificar que el PDF se limpio correctamente (check `reduction_percent`)

---

## Archivos creados

```
Opsversion/
├── prompts/
│   └── configuration-extraction-module-v2.1.md    # Prompt completo (referencia)
├── Opus(2.0)/
│   ├── configuration-workflow-v2.1.json           # Workflow n8n completo
│   └── README-v2.1.md                             # Este archivo
└── tests/
    └── test-v2.1-cross-border.sh                  # Script de prueba
```

---

## Proximos pasos

1. [ ] Importar workflow en n8n
2. [ ] Configurar credenciales
3. [ ] Ejecutar tests con los 3 PDFs
4. [ ] Verificar reglas en Pinecone
5. [ ] Ajustar umbrales si es necesario (actualmente 0.75)
