# Voice Receptionist & Router Skill

## Overview

El Agente Recepcionista es el punto de entrada para todos los contactos con clientes. Su función es:

1. **Recibir** - Llamadas, emails, WhatsApp, formularios web
2. **Entender** - Qué necesita el cliente
3. **Clasificar** - A qué departamento/agente enviar
4. **Transferir** - Pasar la solicitud al agente correcto
5. **Confirmar** - Informar al cliente qué pasará

---

## Arquitectura del Router

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ENTRADA                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   📞 Llamada         📧 Email          📱 WhatsApp       🌐 Web Form        │
│   (Twilio/Vapi)      (IMAP)            (Twilio/Meta)     (Webhook)          │
│        │                 │                  │                 │              │
│        └─────────────────┴──────────────────┴─────────────────┘              │
│                                    │                                         │
│                                    ▼                                         │
│                    ┌──────────────────────────────┐                         │
│                    │   🤖 AGENTE RECEPCIONISTA    │                         │
│                    │                              │                         │
│                    │  Personalidad:               │                         │
│                    │  • Amable y profesional      │                         │
│                    │  • Bilingüe (EN/ES)          │                         │
│                    │  • Paciente                  │                         │
│                    │  • Eficiente                 │                         │
│                    │                              │                         │
│                    │  Acciones:                   │                         │
│                    │  1. Saluda al cliente        │                         │
│                    │  2. Identifica necesidad     │                         │
│                    │  3. Extrae información clave │                         │
│                    │  4. Clasifica y enruta       │                         │
│                    │  5. Confirma acción          │                         │
│                    └──────────────┬───────────────┘                         │
│                                   │                                          │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLASIFICADOR DE INTENCIÓN                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  El clasificador analiza:                                                    │
│                                                                              │
│  1. TIPO DE SOLICITUD                                                        │
│     • receipt_upload    → Tiene imagen/archivo de recibo/factura            │
│     • report_request    → Pide reporte, análisis, dashboard                 │
│     • accounting_query  → Pregunta sobre balance, P&L, invoices             │
│     • general_inquiry   → Pregunta general, info, precios                   │
│     • support_request   → Problema técnico, queja                           │
│     • appointment       → Quiere agendar cita/llamada                       │
│                                                                              │
│  2. URGENCIA                                                                 │
│     • high    → "urgente", "ahora", "emergencia", "deadline"                │
│     • medium  → "esta semana", "pronto", "cuando puedas"                    │
│     • low     → "cuando tengas tiempo", "no hay prisa"                      │
│                                                                              │
│  3. CONTENIDO ADJUNTO                                                        │
│     • has_image     → Foto de recibo/factura                                │
│     • has_document  → PDF, Word, Excel                                      │
│     • has_audio     → Mensaje de voz                                        │
│     • none          → Solo texto                                            │
│                                                                              │
│  4. IDIOMA                                                                   │
│     • en → English                                                          │
│     • es → Español                                                          │
│     • fr → Français (futuro)                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tabla de Routing

### Routing Principal

| Intención | Keywords/Triggers | Agente Destino | Prioridad |
|-----------|-------------------|----------------|-----------|
| **receipt_upload** | "recibo", "factura", "receipt", "invoice", "expense", [imagen adjunta] | Receipt Capture Agent | Alta |
| **report_request** | "reporte", "report", "análisis", "dashboard", "comparar", "tendencia" | Excel/SQL Agent | Media |
| **accounting_query** | "balance", "P&L", "profit", "invoices", "cuentas por cobrar", "AR", "AP" | QuickBooks/Sage Agent | Alta |
| **data_query** | "cuánto", "total", "ventas", "how much", "show me" | SQL Agent | Media |
| **general_inquiry** | "precio", "cómo funciona", "información", "pricing", "demo" | Human Sales / Info Bot | Baja |
| **support_request** | "problema", "error", "no funciona", "ayuda", "issue", "bug" | Support Queue | Alta |
| **appointment** | "cita", "reunión", "llamada", "meeting", "schedule", "agendar" | Calendar/Calendly | Media |

### Routing por Archivo Adjunto

| Tipo de Archivo | Extensiones | Agente Destino |
|-----------------|-------------|----------------|
| **Imagen** | .jpg, .png, .heic, .gif | Receipt Capture Agent |
| **PDF** | .pdf | Receipt Capture Agent (si parece factura) o Document Agent |
| **Spreadsheet** | .xlsx, .xls, .csv | Excel Agent |
| **Document** | .docx, .doc | Document Agent |
| **Audio** | .mp3, .wav, .m4a | Transcription → Re-classify |

---

## Prompt del Clasificador

```python
CLASSIFIER_PROMPT = """You are an intelligent request classifier for Ops-1, an AI accounting automation platform.

Analyze the user's message and any attachments to determine:

1. **intent**: The primary intention (choose ONE):
   - receipt_upload: User wants to submit a receipt, invoice, or expense for processing
   - report_request: User wants to generate a report, analysis, or dashboard
   - accounting_query: User has a question about financial data (balance, P&L, invoices, AR/AP)
   - data_query: User wants to query or analyze data
   - general_inquiry: User wants information about the service, pricing, or general questions
   - support_request: User has a problem or technical issue
   - appointment: User wants to schedule a meeting or call

2. **urgency**: How urgent is this request:
   - high: Contains words like "urgent", "now", "emergency", "deadline", "ASAP"
   - medium: Contains words like "this week", "soon", "when you can"
   - low: Contains words like "no rush", "when you have time", or no urgency indicators

3. **has_attachment**: Type of attachment if any:
   - image: Photo/image file attached
   - document: PDF or document attached
   - spreadsheet: Excel/CSV attached
   - audio: Voice message attached
   - none: No attachment

4. **language**: Detected language:
   - en: English
   - es: Spanish

5. **extracted_info**: Key information extracted:
   - vendor_name: If mentioned
   - amount: If mentioned
   - date_range: If mentioned (e.g., "January", "Q4", "last month")
   - report_type: If requesting a report (e.g., "P&L", "balance sheet", "sales")

Respond ONLY in JSON format:
{
    "intent": "receipt_upload|report_request|accounting_query|data_query|general_inquiry|support_request|appointment",
    "urgency": "high|medium|low",
    "has_attachment": "image|document|spreadsheet|audio|none",
    "language": "en|es",
    "extracted_info": {
        "vendor_name": "string or null",
        "amount": "number or null",
        "date_range": "string or null",
        "report_type": "string or null"
    },
    "confidence": 0.0-1.0,
    "suggested_response": "Brief response to acknowledge the request in the user's language"
}"""
```

---

## Implementación del Router

```python
# receptionist_router.py

from typing import Dict, Optional, Tuple
from enum import Enum
import anthropic
import json

class Intent(Enum):
    RECEIPT_UPLOAD = "receipt_upload"
    REPORT_REQUEST = "report_request"
    ACCOUNTING_QUERY = "accounting_query"
    DATA_QUERY = "data_query"
    GENERAL_INQUIRY = "general_inquiry"
    SUPPORT_REQUEST = "support_request"
    APPOINTMENT = "appointment"

class Urgency(Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class AgentType(Enum):
    RECEIPT_CAPTURE = "receipt_capture"
    EXCEL_AGENT = "excel_agent"
    SQL_AGENT = "sql_agent"
    QUICKBOOKS_AGENT = "quickbooks_agent"
    SAGE_AGENT = "sage_agent"
    SUPPORT_QUEUE = "support_queue"
    CALENDAR = "calendar"
    HUMAN_SALES = "human_sales"

# Routing table
ROUTING_TABLE = {
    Intent.RECEIPT_UPLOAD: AgentType.RECEIPT_CAPTURE,
    Intent.REPORT_REQUEST: AgentType.EXCEL_AGENT,
    Intent.ACCOUNTING_QUERY: AgentType.QUICKBOOKS_AGENT,  # or SAGE based on company config
    Intent.DATA_QUERY: AgentType.SQL_AGENT,
    Intent.GENERAL_INQUIRY: AgentType.HUMAN_SALES,
    Intent.SUPPORT_REQUEST: AgentType.SUPPORT_QUEUE,
    Intent.APPOINTMENT: AgentType.CALENDAR,
}

class ReceptionistRouter:
    """
    Intelligent router that classifies incoming requests and routes them
    to the appropriate agent/department.
    """
    
    def __init__(self, api_key: str, company_config: Optional[Dict] = None):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.company_config = company_config or {}
        
        # Company-specific settings
        self.accounting_system = self.company_config.get('accounting_system', 'quickbooks')
        self.default_language = self.company_config.get('default_language', 'en')
    
    def classify_request(
        self, 
        message: str, 
        attachment_type: Optional[str] = None,
        source: str = "web"
    ) -> Dict:
        """
        Classify an incoming request and determine routing.
        
        Args:
            message: The user's message/request
            attachment_type: Type of attachment if any (image, document, etc.)
            source: Source channel (phone, email, whatsapp, web)
        
        Returns:
            Classification result with routing information
        """
        
        # Build context for classifier
        context = f"Source: {source}\n"
        if attachment_type:
            context += f"Attachment: {attachment_type}\n"
        context += f"Message: {message}"
        
        # Call Claude for classification
        response = self.client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=500,
            system=self._get_classifier_prompt(),
            messages=[{"role": "user", "content": context}]
        )
        
        # Parse response
        try:
            result = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            result = self._fallback_classification(message, attachment_type)
        
        # Add routing information
        result['routing'] = self._determine_routing(result, attachment_type)
        
        return result
    
    def _get_classifier_prompt(self) -> str:
        """Get the classifier system prompt"""
        
        return """You are an intelligent request classifier for Ops-1, an AI accounting automation platform.

Analyze the user's message and determine:

1. **intent**: The primary intention (choose ONE):
   - receipt_upload: User wants to submit a receipt, invoice, or expense
   - report_request: User wants a report, analysis, or dashboard
   - accounting_query: Question about financial data (balance, P&L, invoices)
   - data_query: User wants to query or analyze data
   - general_inquiry: Information about service, pricing, general questions
   - support_request: Problem or technical issue
   - appointment: Schedule a meeting or call

2. **urgency**: high | medium | low

3. **has_attachment**: image | document | spreadsheet | audio | none

4. **language**: en | es

5. **extracted_info**: Key information (vendor_name, amount, date_range, report_type)

Respond ONLY in JSON format:
{
    "intent": "string",
    "urgency": "string",
    "has_attachment": "string",
    "language": "string",
    "extracted_info": {},
    "confidence": 0.0-1.0,
    "suggested_response": "Brief acknowledgment in user's language"
}"""
    
    def _determine_routing(self, classification: Dict, attachment_type: Optional[str]) -> Dict:
        """Determine the routing based on classification"""
        
        intent = Intent(classification.get('intent', 'general_inquiry'))
        
        # Special case: if image attached, likely a receipt
        if attachment_type == 'image' and intent != Intent.RECEIPT_UPLOAD:
            # Override to receipt capture if image attached
            intent = Intent.RECEIPT_UPLOAD
        
        # Get base agent
        agent = ROUTING_TABLE.get(intent, AgentType.HUMAN_SALES)
        
        # Adjust for accounting system preference
        if agent == AgentType.QUICKBOOKS_AGENT and self.accounting_system == 'sage':
            agent = AgentType.SAGE_AGENT
        
        # Build routing info
        routing = {
            "agent": agent.value,
            "queue": self._get_queue_name(agent),
            "priority": self._get_priority(classification.get('urgency', 'medium')),
            "webhook": self._get_agent_webhook(agent),
            "fallback_agent": self._get_fallback_agent(agent)
        }
        
        return routing
    
    def _get_queue_name(self, agent: AgentType) -> str:
        """Get the queue name for an agent"""
        
        queues = {
            AgentType.RECEIPT_CAPTURE: "receipts",
            AgentType.EXCEL_AGENT: "reports",
            AgentType.SQL_AGENT: "data_queries",
            AgentType.QUICKBOOKS_AGENT: "accounting",
            AgentType.SAGE_AGENT: "accounting",
            AgentType.SUPPORT_QUEUE: "support",
            AgentType.CALENDAR: "scheduling",
            AgentType.HUMAN_SALES: "sales"
        }
        return queues.get(agent, "general")
    
    def _get_priority(self, urgency: str) -> int:
        """Convert urgency to numeric priority (1=highest)"""
        
        priorities = {
            "high": 1,
            "medium": 2,
            "low": 3
        }
        return priorities.get(urgency, 2)
    
    def _get_agent_webhook(self, agent: AgentType) -> str:
        """Get the webhook URL for an agent"""
        
        base_url = self.company_config.get('webhook_base_url', 'https://n8n.ops1.ai/webhook')
        
        webhooks = {
            AgentType.RECEIPT_CAPTURE: f"{base_url}/receipt-capture",
            AgentType.EXCEL_AGENT: f"{base_url}/excel-agent",
            AgentType.SQL_AGENT: f"{base_url}/sql-agent",
            AgentType.QUICKBOOKS_AGENT: f"{base_url}/quickbooks-query",
            AgentType.SAGE_AGENT: f"{base_url}/sage-query",
            AgentType.SUPPORT_QUEUE: f"{base_url}/support-ticket",
            AgentType.CALENDAR: f"{base_url}/schedule-meeting",
            AgentType.HUMAN_SALES: f"{base_url}/sales-inquiry"
        }
        return webhooks.get(agent, f"{base_url}/general")
    
    def _get_fallback_agent(self, agent: AgentType) -> str:
        """Get fallback agent if primary fails"""
        
        fallbacks = {
            AgentType.RECEIPT_CAPTURE: AgentType.SUPPORT_QUEUE.value,
            AgentType.QUICKBOOKS_AGENT: AgentType.SAGE_AGENT.value,
            AgentType.SAGE_AGENT: AgentType.QUICKBOOKS_AGENT.value,
        }
        return fallbacks.get(agent, AgentType.HUMAN_SALES.value)
    
    def _fallback_classification(self, message: str, attachment_type: Optional[str]) -> Dict:
        """Fallback classification using keyword matching"""
        
        message_lower = message.lower()
        
        # Keyword-based classification
        if attachment_type == 'image':
            intent = "receipt_upload"
        elif any(kw in message_lower for kw in ['receipt', 'invoice', 'factura', 'recibo', 'expense']):
            intent = "receipt_upload"
        elif any(kw in message_lower for kw in ['report', 'reporte', 'analysis', 'dashboard']):
            intent = "report_request"
        elif any(kw in message_lower for kw in ['balance', 'p&l', 'profit', 'loss', 'invoices', 'ar', 'ap']):
            intent = "accounting_query"
        elif any(kw in message_lower for kw in ['problem', 'error', 'issue', 'help', 'problema']):
            intent = "support_request"
        elif any(kw in message_lower for kw in ['meeting', 'schedule', 'call', 'cita', 'reunión']):
            intent = "appointment"
        else:
            intent = "general_inquiry"
        
        # Urgency detection
        if any(kw in message_lower for kw in ['urgent', 'now', 'asap', 'emergency', 'urgente']):
            urgency = "high"
        elif any(kw in message_lower for kw in ['soon', 'this week', 'pronto']):
            urgency = "medium"
        else:
            urgency = "low"
        
        # Language detection (simple)
        spanish_indicators = ['hola', 'necesito', 'quiero', 'por favor', 'gracias', 'factura', 'recibo']
        language = "es" if any(kw in message_lower for kw in spanish_indicators) else "en"
        
        return {
            "intent": intent,
            "urgency": urgency,
            "has_attachment": attachment_type or "none",
            "language": language,
            "extracted_info": {},
            "confidence": 0.6,
            "suggested_response": "I'll help you with that right away." if language == "en" else "Te ayudo con eso enseguida."
        }
    
    def route_request(self, classification: Dict, original_message: str, attachments: list = None) -> Dict:
        """
        Route the request to the appropriate agent.
        
        Returns the response from the agent or a confirmation message.
        """
        
        routing = classification['routing']
        webhook_url = routing['webhook']
        
        # Build payload for the agent
        payload = {
            "message": original_message,
            "classification": classification,
            "attachments": attachments or [],
            "priority": routing['priority'],
            "language": classification.get('language', 'en'),
            "source": "receptionist_router"
        }
        
        # In production, send to webhook
        # response = requests.post(webhook_url, json=payload)
        
        return {
            "routed_to": routing['agent'],
            "queue": routing['queue'],
            "priority": routing['priority'],
            "webhook": webhook_url,
            "payload": payload,
            "status": "routed"
        }


# Convenience functions for n8n

def classify_and_route(message: str, attachment_type: str = None, source: str = "web") -> Dict:
    """
    Simple function for n8n Code node.
    
    Usage in n8n:
        const result = classify_and_route($json.message, $json.attachment_type, "email");
    """
    
    router = ReceptionistRouter(api_key="")  # Uses env var
    classification = router.classify_request(message, attachment_type, source)
    
    return {
        "intent": classification['intent'],
        "urgency": classification['urgency'],
        "language": classification['language'],
        "agent": classification['routing']['agent'],
        "webhook": classification['routing']['webhook'],
        "priority": classification['routing']['priority'],
        "response": classification.get('suggested_response', '')
    }
```

---

## Respuestas del Recepcionista

### Templates por Idioma e Intención

```python
# receptionist_responses.py

RESPONSES = {
    "receipt_upload": {
        "en": {
            "acknowledgment": "I've received your {attachment_type}. I'm sending it to our Receipt Processing team right now.",
            "processing": "Your receipt is being processed. You'll receive a confirmation once it's been added to {accounting_system}.",
            "confirmation": "Your receipt from {vendor_name} for {amount} has been processed and added to your records. Receipt ID: {receipt_id}"
        },
        "es": {
            "acknowledgment": "He recibido tu {attachment_type}. Lo estoy enviando a nuestro equipo de Procesamiento de Recibos ahora mismo.",
            "processing": "Tu recibo está siendo procesado. Recibirás una confirmación cuando se haya agregado a {accounting_system}.",
            "confirmation": "Tu recibo de {vendor_name} por {amount} ha sido procesado y agregado a tus registros. ID del recibo: {receipt_id}"
        }
    },
    "report_request": {
        "en": {
            "acknowledgment": "I understand you need a {report_type} report. Let me get that started for you.",
            "clarification": "Just to confirm - you'd like a {report_type} for {date_range}, correct?",
            "processing": "Your report is being generated. This usually takes about {estimated_time}.",
            "completion": "Your {report_type} report is ready! {download_link}"
        },
        "es": {
            "acknowledgment": "Entiendo que necesitas un reporte de {report_type}. Déjame comenzar eso para ti.",
            "clarification": "Solo para confirmar - ¿quieres un {report_type} para {date_range}, correcto?",
            "processing": "Tu reporte está siendo generado. Esto usualmente toma aproximadamente {estimated_time}.",
            "completion": "¡Tu reporte de {report_type} está listo! {download_link}"
        }
    },
    "accounting_query": {
        "en": {
            "acknowledgment": "I'm checking your {query_type} now...",
            "result": "Here's what I found: {result}",
            "no_result": "I couldn't find any data matching your request. Would you like me to try a different search?"
        },
        "es": {
            "acknowledgment": "Estoy revisando tu {query_type} ahora...",
            "result": "Esto es lo que encontré: {result}",
            "no_result": "No pude encontrar datos que coincidan con tu solicitud. ¿Te gustaría que intente una búsqueda diferente?"
        }
    },
    "general_inquiry": {
        "en": {
            "greeting": "Hello! Welcome to {company_name}. How can I help you today?",
            "info": "I'd be happy to help with that. {info}",
            "transfer": "For more detailed information, I'm connecting you with our sales team. One moment please."
        },
        "es": {
            "greeting": "¡Hola! Bienvenido a {company_name}. ¿En qué puedo ayudarte hoy?",
            "info": "Con gusto te ayudo con eso. {info}",
            "transfer": "Para información más detallada, te estoy conectando con nuestro equipo de ventas. Un momento por favor."
        }
    },
    "support_request": {
        "en": {
            "acknowledgment": "I'm sorry you're experiencing an issue. Let me help you resolve this.",
            "ticket_created": "I've created support ticket #{ticket_id}. Our team will respond within {sla_time}.",
            "urgent": "I understand this is urgent. I'm escalating this to our support team immediately."
        },
        "es": {
            "acknowledgment": "Lamento que estés experimentando un problema. Déjame ayudarte a resolverlo.",
            "ticket_created": "He creado el ticket de soporte #{ticket_id}. Nuestro equipo responderá dentro de {sla_time}.",
            "urgent": "Entiendo que esto es urgente. Estoy escalando esto a nuestro equipo de soporte inmediatamente."
        }
    },
    "appointment": {
        "en": {
            "acknowledgment": "I'd be happy to help you schedule a meeting.",
            "available_slots": "Here are some available times: {slots}",
            "confirmation": "Your meeting is scheduled for {date_time}. You'll receive a calendar invitation shortly."
        },
        "es": {
            "acknowledgment": "Con gusto te ayudo a agendar una reunión.",
            "available_slots": "Aquí hay algunos horarios disponibles: {slots}",
            "confirmation": "Tu reunión está programada para {date_time}. Recibirás una invitación de calendario en breve."
        }
    }
}

def get_response(intent: str, stage: str, language: str, **kwargs) -> str:
    """
    Get the appropriate response template and fill in variables.
    
    Args:
        intent: The classified intent
        stage: The response stage (acknowledgment, processing, confirmation, etc.)
        language: Language code (en, es)
        **kwargs: Variables to fill in the template
    
    Returns:
        Formatted response string
    """
    
    template = RESPONSES.get(intent, {}).get(language, {}).get(stage, "")
    
    if not template:
        # Fallback to English
        template = RESPONSES.get(intent, {}).get("en", {}).get(stage, "I'll help you with that.")
    
    try:
        return template.format(**kwargs)
    except KeyError:
        return template
```

---

## Voice Agent Configuration (Vapi/Twilio)

### Vapi Assistant Configuration

```json
{
  "name": "Ops-1 Receptionist",
  "model": {
    "provider": "anthropic",
    "model": "claude-3-haiku-20240307",
    "temperature": 0.7,
    "systemPrompt": "You are a friendly, professional bilingual receptionist for Ops-1, an AI accounting automation company. Your name is Sofia.\n\nYour responsibilities:\n1. Greet callers warmly in their preferred language (English or Spanish)\n2. Listen carefully to understand what they need\n3. Classify their request (receipt processing, reports, accounting questions, support, scheduling)\n4. Collect any necessary information\n5. Confirm the action you're taking\n6. Transfer to the appropriate department\n\nPersonality:\n- Warm and welcoming\n- Patient and helpful\n- Professional but not robotic\n- Efficient - don't waste the caller's time\n\nIf someone wants to submit a receipt or invoice:\n- Ask if they can send it via email to receipts@[company].ops1.ai\n- Or ask them to upload it on our website\n- Confirm you'll process it right away\n\nIf someone needs a report:\n- Ask what type of report (P&L, balance sheet, sales, expenses)\n- Ask for the time period\n- Confirm and let them know when to expect it\n\nAlways end by confirming what action you're taking and what the caller should expect next."
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM",
    "stability": 0.5,
    "similarityBoost": 0.75
  },
  "firstMessage": "Hello! Thank you for calling Ops-1. This is Sofia. How can I help you today?",
  "firstMessageSpanish": "¡Hola! Gracias por llamar a Ops-1. Soy Sofia. ¿En qué puedo ayudarte hoy?",
  "endCallMessage": "Thank you for calling Ops-1. Have a great day!",
  "endCallPhrases": ["goodbye", "bye", "that's all", "thank you", "adiós", "gracias", "eso es todo"],
  "serverUrl": "https://n8n.ops1.ai/webhook/vapi-receptionist",
  "serverUrlSecret": "your-webhook-secret"
}
```

---

## n8n Workflow Completo

```json
{
  "name": "Ops-1 Receptionist Router",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "receptionist",
        "responseMode": "responseNode"
      },
      "name": "Incoming Request",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "// Classify the incoming request\nconst message = $json.body?.message || $json.body?.text || $json.body?.transcript || '';\nconst source = $json.body?.source || 'web';\nconst attachmentType = $json.body?.attachment_type || null;\nconst companyId = $json.body?.company_id || 'default';\n\n// Keywords for classification\nconst intents = {\n  receipt_upload: ['receipt', 'invoice', 'factura', 'recibo', 'expense', 'gasto'],\n  report_request: ['report', 'reporte', 'analysis', 'dashboard', 'análisis'],\n  accounting_query: ['balance', 'p&l', 'profit', 'loss', 'invoices', 'cuentas', 'ar', 'ap'],\n  support_request: ['problem', 'error', 'issue', 'help', 'problema', 'ayuda'],\n  appointment: ['meeting', 'schedule', 'call', 'cita', 'reunión', 'agendar']\n};\n\nconst urgencyKeywords = {\n  high: ['urgent', 'now', 'asap', 'emergency', 'urgente', 'ahora'],\n  medium: ['soon', 'this week', 'pronto'],\n  low: ['no rush', 'when you can', 'cuando puedas']\n};\n\nconst msgLower = message.toLowerCase();\n\n// Detect intent\nlet intent = 'general_inquiry';\nif (attachmentType === 'image') intent = 'receipt_upload';\nelse {\n  for (const [key, keywords] of Object.entries(intents)) {\n    if (keywords.some(kw => msgLower.includes(kw))) {\n      intent = key;\n      break;\n    }\n  }\n}\n\n// Detect urgency\nlet urgency = 'medium';\nfor (const [level, keywords] of Object.entries(urgencyKeywords)) {\n  if (keywords.some(kw => msgLower.includes(kw))) {\n    urgency = level;\n    break;\n  }\n}\n\n// Detect language\nconst spanishWords = ['hola', 'necesito', 'quiero', 'por favor', 'gracias'];\nconst language = spanishWords.some(w => msgLower.includes(w)) ? 'es' : 'en';\n\n// Routing table\nconst routing = {\n  receipt_upload: { agent: 'receipt_capture', webhook: '/webhook/receipt-capture', queue: 'receipts' },\n  report_request: { agent: 'excel_agent', webhook: '/webhook/excel-agent', queue: 'reports' },\n  accounting_query: { agent: 'quickbooks_agent', webhook: '/webhook/quickbooks-query', queue: 'accounting' },\n  support_request: { agent: 'support_queue', webhook: '/webhook/support-ticket', queue: 'support' },\n  appointment: { agent: 'calendar', webhook: '/webhook/schedule-meeting', queue: 'scheduling' },\n  general_inquiry: { agent: 'sales', webhook: '/webhook/sales-inquiry', queue: 'sales' }\n};\n\nconst route = routing[intent];\n\nreturn {\n  json: {\n    classification: {\n      intent,\n      urgency,\n      language,\n      has_attachment: attachmentType || 'none',\n      confidence: attachmentType === 'image' ? 0.95 : 0.8\n    },\n    routing: {\n      agent: route.agent,\n      webhook: route.webhook,\n      queue: route.queue,\n      priority: urgency === 'high' ? 1 : urgency === 'medium' ? 2 : 3\n    },\n    original: {\n      message,\n      source,\n      company_id: companyId,\n      attachment_type: attachmentType\n    }\n  }\n};"
      },
      "name": "Classify & Route",
      "type": "n8n-nodes-base.code",
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.classification.intent }}",
              "operation": "equals",
              "value2": "receipt_upload"
            }
          ]
        }
      },
      "name": "Is Receipt?",
      "type": "n8n-nodes-base.if",
      "position": [650, 200]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.classification.intent }}",
              "operation": "equals",
              "value2": "accounting_query"
            }
          ]
        }
      },
      "name": "Is Accounting?",
      "type": "n8n-nodes-base.if",
      "position": [650, 400]
    },
    {
      "parameters": {
        "url": "={{ $env.N8N_BASE_URL }}/webhook/receipt-capture",
        "method": "POST",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "=",
              "value": "={{ $json }}"
            }
          ]
        }
      },
      "name": "Route to Receipt Agent",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 100]
    },
    {
      "parameters": {
        "url": "={{ $env.N8N_BASE_URL }}/webhook/quickbooks-query",
        "method": "POST",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "=",
              "value": "={{ $json }}"
            }
          ]
        }
      },
      "name": "Route to Accounting Agent",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 400]
    },
    {
      "parameters": {
        "jsCode": "// Generate appropriate response based on classification\nconst { intent, language } = $json.classification;\n\nconst responses = {\n  receipt_upload: {\n    en: \"I've received your receipt and I'm processing it now. You'll get a confirmation once it's been added to your accounting system.\",\n    es: \"He recibido tu recibo y lo estoy procesando ahora. Recibirás una confirmación cuando se haya agregado a tu sistema contable.\"\n  },\n  report_request: {\n    en: \"I'm generating your report now. This usually takes a few moments.\",\n    es: \"Estoy generando tu reporte ahora. Esto usualmente toma unos momentos.\"\n  },\n  accounting_query: {\n    en: \"Let me look that up for you...\",\n    es: \"Déjame buscar eso para ti...\"\n  },\n  support_request: {\n    en: \"I'm sorry you're having trouble. I've created a support ticket and our team will respond shortly.\",\n    es: \"Lamento que estés teniendo problemas. He creado un ticket de soporte y nuestro equipo responderá pronto.\"\n  },\n  appointment: {\n    en: \"I'd be happy to help you schedule a meeting. Let me check available times.\",\n    es: \"Con gusto te ayudo a agendar una reunión. Déjame revisar los horarios disponibles.\"\n  },\n  general_inquiry: {\n    en: \"Thank you for your interest! I'm connecting you with our team for more information.\",\n    es: \"¡Gracias por tu interés! Te estoy conectando con nuestro equipo para más información.\"\n  }\n};\n\nconst response = responses[intent]?.[language] || responses[intent]?.['en'] || \"I'll help you with that.\";\n\nreturn {\n  json: {\n    ...$json,\n    response,\n    status: 'routed'\n  }\n};"
      },
      "name": "Generate Response",
      "type": "n8n-nodes-base.code",
      "position": [1050, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({ success: true, message: $json.response, routed_to: $json.routing.agent, ticket_id: $json.routing.queue + '-' + Date.now() }) }}"
      },
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1250, 300]
    }
  ],
  "connections": {
    "Incoming Request": {
      "main": [[{"node": "Classify & Route", "type": "main", "index": 0}]]
    },
    "Classify & Route": {
      "main": [
        [{"node": "Is Receipt?", "type": "main", "index": 0}],
        [{"node": "Is Accounting?", "type": "main", "index": 0}]
      ]
    },
    "Is Receipt?": {
      "main": [
        [{"node": "Route to Receipt Agent", "type": "main", "index": 0}],
        [{"node": "Is Accounting?", "type": "main", "index": 0}]
      ]
    },
    "Is Accounting?": {
      "main": [
        [{"node": "Route to Accounting Agent", "type": "main", "index": 0}],
        [{"node": "Generate Response", "type": "main", "index": 0}]
      ]
    },
    "Route to Receipt Agent": {
      "main": [[{"node": "Generate Response", "type": "main", "index": 0}]]
    },
    "Route to Accounting Agent": {
      "main": [[{"node": "Generate Response", "type": "main", "index": 0}]]
    },
    "Generate Response": {
      "main": [[{"node": "Respond", "type": "main", "index": 0}]]
    }
  }
}
```

---

## Resumen de Routing

```
┌─────────────────────────────────────────────────────────────────┐
│                    TABLA DE ROUTING                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📧 "Adjunto factura del proveedor"                             │
│     → Intent: receipt_upload                                     │
│     → Agent: Receipt Capture                                     │
│     → Response (ES): "He recibido tu recibo..."                 │
│                                                                  │
│  📞 "I need the P&L for January"                                │
│     → Intent: accounting_query                                   │
│     → Agent: QuickBooks/Sage                                     │
│     → Response (EN): "Let me look that up..."                   │
│                                                                  │
│  📱 [Foto de recibo de Starbucks]                               │
│     → Intent: receipt_upload (auto-detect image)                │
│     → Agent: Receipt Capture                                     │
│     → Response: "Processing your receipt..."                    │
│                                                                  │
│  🌐 "Quiero un reporte de ventas del Q4"                        │
│     → Intent: report_request                                     │
│     → Agent: Excel/SQL Agent                                     │
│     → Response (ES): "Estoy generando tu reporte..."            │
│                                                                  │
│  📞 "I have an urgent problem with my account"                  │
│     → Intent: support_request                                    │
│     → Urgency: HIGH                                              │
│     → Agent: Support Queue (Priority 1)                         │
│     → Response: "I've escalated this immediately..."            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Archivos Creados

Este skill incluye todo lo que el Agente Recepcionista necesita para saber a dónde enviar cada solicitud.
