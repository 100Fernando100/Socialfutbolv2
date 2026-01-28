# Calendar Integration Skill

## Overview

Este skill integra Ops-1 con sistemas de calendario para agendar citas, reuniones y llamadas automáticamente.

**Integraciones:**
- Calendly (principal)
- Google Calendar
- Microsoft Outlook/365

**Capacidades:**
- Mostrar disponibilidad
- Agendar citas
- Enviar confirmaciones
- Reagendar/cancelar
- Recordatorios automáticos

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                  │
│                                                                  │
│  "Quiero agendar una llamada para discutir mi contabilidad"     │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RECEPTIONIST ROUTER                           │
│                                                                  │
│  Intent: appointment                                             │
│  → Route to Calendar Agent                                       │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CALENDAR AGENT                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PARSE REQUEST                                                │
│     • Meeting type: call, video, in-person                      │
│     • Duration: 15, 30, 60 min                                  │
│     • Topic/Purpose                                              │
│     • Preferred date/time                                        │
│                                                                  │
│  2. CHECK AVAILABILITY                                           │
│     • Query Calendly/Google/Outlook                             │
│     • Get available slots                                        │
│     • Filter by preferences                                      │
│                                                                  │
│  3. PRESENT OPTIONS                                              │
│     • Show 3-5 available times                                   │
│     • In user's timezone                                         │
│     • In user's language                                         │
│                                                                  │
│  4. BOOK APPOINTMENT                                             │
│     • Create event                                               │
│     • Send confirmation                                          │
│     • Add to CRM                                                 │
│                                                                  │
│  5. FOLLOW UP                                                    │
│     • Send reminder (24h before)                                 │
│     • Send meeting link                                          │
│     • Post-meeting follow up                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Calendly Integration

### API Setup

```python
# calendly_client.py

import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class CalendlyClient:
    """
    Client for Calendly API v2.
    """
    
    BASE_URL = "https://api.calendly.com"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self._user = None
        self._organization = None
    
    # ==================== USER INFO ====================
    
    def get_current_user(self) -> Dict:
        """Get current authenticated user"""
        
        if self._user:
            return self._user
        
        response = requests.get(
            f"{self.BASE_URL}/users/me",
            headers=self.headers
        )
        
        if response.status_code == 200:
            self._user = response.json().get('resource', {})
            self._organization = self._user.get('current_organization')
            return self._user
        
        return {}
    
    # ==================== EVENT TYPES ====================
    
    def list_event_types(self, active: bool = True) -> List[Dict]:
        """
        List available event types (meeting types).
        
        Returns list of event types like:
        - 15 Minute Call
        - 30 Minute Meeting
        - 60 Minute Consultation
        """
        
        user = self.get_current_user()
        user_uri = user.get('uri', '')
        
        params = {
            "user": user_uri,
            "active": active
        }
        
        response = requests.get(
            f"{self.BASE_URL}/event_types",
            headers=self.headers,
            params=params
        )
        
        if response.status_code == 200:
            return response.json().get('collection', [])
        
        return []
    
    def get_event_type(self, event_type_uuid: str) -> Dict:
        """Get details of a specific event type"""
        
        response = requests.get(
            f"{self.BASE_URL}/event_types/{event_type_uuid}",
            headers=self.headers
        )
        
        return response.json().get('resource', {}) if response.status_code == 200 else {}
    
    # ==================== AVAILABILITY ====================
    
    def get_available_times(
        self,
        event_type_uuid: str,
        start_time: str,
        end_time: str
    ) -> List[Dict]:
        """
        Get available time slots for an event type.
        
        Args:
            event_type_uuid: The event type to check
            start_time: ISO format datetime (e.g., "2025-01-28T00:00:00Z")
            end_time: ISO format datetime
        
        Returns:
            List of available slots with start_time
        """
        
        params = {
            "event_type": f"https://api.calendly.com/event_types/{event_type_uuid}",
            "start_time": start_time,
            "end_time": end_time
        }
        
        response = requests.get(
            f"{self.BASE_URL}/event_type_available_times",
            headers=self.headers,
            params=params
        )
        
        if response.status_code == 200:
            return response.json().get('collection', [])
        
        return []
    
    def get_user_availability(
        self,
        user_uri: str,
        start_time: str,
        end_time: str
    ) -> Dict:
        """Get user's general availability schedule"""
        
        params = {
            "user": user_uri,
            "start_time": start_time,
            "end_time": end_time
        }
        
        response = requests.get(
            f"{self.BASE_URL}/user_availability_schedules",
            headers=self.headers,
            params=params
        )
        
        return response.json() if response.status_code == 200 else {}
    
    # ==================== SCHEDULED EVENTS ====================
    
    def list_scheduled_events(
        self,
        status: str = "active",
        min_start_time: Optional[str] = None,
        max_start_time: Optional[str] = None
    ) -> List[Dict]:
        """
        List scheduled events.
        
        Args:
            status: active, canceled
            min_start_time: Filter events starting after this time
            max_start_time: Filter events starting before this time
        """
        
        user = self.get_current_user()
        
        params = {
            "user": user.get('uri'),
            "status": status
        }
        
        if min_start_time:
            params["min_start_time"] = min_start_time
        if max_start_time:
            params["max_start_time"] = max_start_time
        
        response = requests.get(
            f"{self.BASE_URL}/scheduled_events",
            headers=self.headers,
            params=params
        )
        
        if response.status_code == 200:
            return response.json().get('collection', [])
        
        return []
    
    def get_scheduled_event(self, event_uuid: str) -> Dict:
        """Get details of a scheduled event"""
        
        response = requests.get(
            f"{self.BASE_URL}/scheduled_events/{event_uuid}",
            headers=self.headers
        )
        
        return response.json().get('resource', {}) if response.status_code == 200 else {}
    
    def cancel_event(self, event_uuid: str, reason: str = "") -> bool:
        """Cancel a scheduled event"""
        
        payload = {}
        if reason:
            payload["reason"] = reason
        
        response = requests.post(
            f"{self.BASE_URL}/scheduled_events/{event_uuid}/cancellation",
            headers=self.headers,
            json=payload
        )
        
        return response.status_code in [200, 201]
    
    # ==================== INVITEES ====================
    
    def list_invitees(self, event_uuid: str) -> List[Dict]:
        """List invitees for a scheduled event"""
        
        response = requests.get(
            f"{self.BASE_URL}/scheduled_events/{event_uuid}/invitees",
            headers=self.headers
        )
        
        if response.status_code == 200:
            return response.json().get('collection', [])
        
        return []
    
    # ==================== SCHEDULING LINKS ====================
    
    def create_scheduling_link(
        self,
        event_type_uuid: str,
        max_event_count: int = 1,
        owner_type: str = "EventType"
    ) -> Dict:
        """
        Create a single-use scheduling link.
        
        This is useful for sending a personalized booking link
        to a specific client.
        """
        
        payload = {
            "max_event_count": max_event_count,
            "owner": f"https://api.calendly.com/event_types/{event_type_uuid}",
            "owner_type": owner_type
        }
        
        response = requests.post(
            f"{self.BASE_URL}/scheduling_links",
            headers=self.headers,
            json=payload
        )
        
        if response.status_code in [200, 201]:
            return response.json().get('resource', {})
        
        return {"error": response.text}
    
    # ==================== WEBHOOKS ====================
    
    def create_webhook(
        self,
        url: str,
        events: List[str],
        scope: str = "user"
    ) -> Dict:
        """
        Create a webhook subscription.
        
        Args:
            url: Webhook endpoint URL
            events: List of events to subscribe to:
                - invitee.created
                - invitee.canceled
                - routing_form_submission.created
            scope: user or organization
        """
        
        user = self.get_current_user()
        
        payload = {
            "url": url,
            "events": events,
            "scope": scope,
            "user": user.get('uri') if scope == "user" else None,
            "organization": self._organization if scope == "organization" else None
        }
        
        response = requests.post(
            f"{self.BASE_URL}/webhook_subscriptions",
            headers=self.headers,
            json=payload
        )
        
        return response.json() if response.status_code in [200, 201] else {"error": response.text}
```

---

## Calendar Agent

```python
# calendar_agent.py

import anthropic
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json
import pytz

class CalendarAgent:
    """
    AI agent for handling calendar and scheduling requests.
    """
    
    PARSE_PROMPT = """You are a scheduling assistant. Parse the user's request and extract:

1. **meeting_type**: Type of meeting
   - call: Phone call
   - video: Video conference (Zoom, Meet)
   - in_person: Face to face meeting
   - consultation: Professional consultation

2. **duration**: Preferred duration in minutes
   - 15, 30, 45, 60, 90

3. **topic**: What the meeting is about

4. **preferred_date**: If mentioned (YYYY-MM-DD or relative like "tomorrow", "next week")

5. **preferred_time**: If mentioned (morning, afternoon, specific time)

6. **urgency**: How soon they need to meet
   - asap: Within 24-48 hours
   - this_week: Within the week
   - flexible: No rush

7. **timezone**: If mentioned or inferred

Respond ONLY in JSON:
{
    "meeting_type": "call|video|in_person|consultation",
    "duration": 30,
    "topic": "string",
    "preferred_date": "YYYY-MM-DD or null",
    "preferred_time": "morning|afternoon|evening|HH:MM or null",
    "urgency": "asap|this_week|flexible",
    "timezone": "America/Toronto or null"
}"""

    def __init__(
        self,
        anthropic_key: str,
        calendly_client: 'CalendlyClient',
        default_timezone: str = "America/Toronto"
    ):
        self.claude = anthropic.Anthropic(api_key=anthropic_key)
        self.calendly = calendly_client
        self.default_timezone = default_timezone
    
    def parse_request(self, user_message: str, language: str = "en") -> Dict:
        """Parse natural language scheduling request"""
        
        response = self.claude.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=500,
            system=self.PARSE_PROMPT,
            messages=[{"role": "user", "content": user_message}]
        )
        
        try:
            text = response.content[0].text
            if "```" in text:
                text = text.split("```")[1].replace("json", "").strip()
            return json.loads(text)
        except:
            return self._fallback_parse(user_message)
    
    def _fallback_parse(self, message: str) -> Dict:
        """Keyword-based fallback parsing"""
        
        msg_lower = message.lower()
        
        # Meeting type
        if any(kw in msg_lower for kw in ['call', 'phone', 'llamada']):
            meeting_type = "call"
        elif any(kw in msg_lower for kw in ['video', 'zoom', 'meet']):
            meeting_type = "video"
        elif any(kw in msg_lower for kw in ['person', 'office', 'presencial']):
            meeting_type = "in_person"
        else:
            meeting_type = "video"  # Default
        
        # Duration
        if '15' in msg_lower or 'quick' in msg_lower or 'brief' in msg_lower:
            duration = 15
        elif '60' in msg_lower or 'hour' in msg_lower or 'hora' in msg_lower:
            duration = 60
        else:
            duration = 30
        
        # Urgency
        if any(kw in msg_lower for kw in ['urgent', 'asap', 'today', 'tomorrow', 'hoy', 'mañana']):
            urgency = "asap"
        elif any(kw in msg_lower for kw in ['this week', 'esta semana', 'soon', 'pronto']):
            urgency = "this_week"
        else:
            urgency = "flexible"
        
        return {
            "meeting_type": meeting_type,
            "duration": duration,
            "topic": "General consultation",
            "preferred_date": None,
            "preferred_time": None,
            "urgency": urgency,
            "timezone": self.default_timezone
        }
    
    def get_available_slots(
        self,
        meeting_request: Dict,
        num_slots: int = 5
    ) -> List[Dict]:
        """Get available time slots based on request"""
        
        # Get event types
        event_types = self.calendly.list_event_types()
        
        # Find matching event type by duration
        duration = meeting_request.get('duration', 30)
        matching_event = None
        
        for et in event_types:
            if et.get('duration') == duration:
                matching_event = et
                break
        
        if not matching_event and event_types:
            matching_event = event_types[0]
        
        if not matching_event:
            return []
        
        # Determine date range
        urgency = meeting_request.get('urgency', 'flexible')
        preferred_date = meeting_request.get('preferred_date')
        
        if preferred_date:
            start = datetime.strptime(preferred_date, '%Y-%m-%d')
            end = start + timedelta(days=7)
        elif urgency == 'asap':
            start = datetime.now()
            end = start + timedelta(days=3)
        elif urgency == 'this_week':
            start = datetime.now()
            end = start + timedelta(days=7)
        else:
            start = datetime.now()
            end = start + timedelta(days=14)
        
        # Get available times
        event_type_uuid = matching_event.get('uri', '').split('/')[-1]
        
        available = self.calendly.get_available_times(
            event_type_uuid,
            start.isoformat() + 'Z',
            end.isoformat() + 'Z'
        )
        
        # Format slots
        slots = []
        tz = pytz.timezone(meeting_request.get('timezone', self.default_timezone))
        
        for slot in available[:num_slots]:
            start_time = datetime.fromisoformat(slot['start_time'].replace('Z', '+00:00'))
            local_time = start_time.astimezone(tz)
            
            slots.append({
                "datetime_utc": slot['start_time'],
                "datetime_local": local_time.strftime('%Y-%m-%d %H:%M'),
                "day": local_time.strftime('%A'),
                "date": local_time.strftime('%B %d, %Y'),
                "time": local_time.strftime('%I:%M %p'),
                "event_type_uuid": event_type_uuid
            })
        
        return slots
    
    def create_booking_link(self, event_type_uuid: str) -> str:
        """Create a one-time booking link"""
        
        result = self.calendly.create_scheduling_link(event_type_uuid)
        return result.get('booking_url', '')
    
    def format_slots_message(
        self,
        slots: List[Dict],
        language: str = "en"
    ) -> str:
        """Format available slots as a user-friendly message"""
        
        if not slots:
            if language == "es":
                return "Lo siento, no encontré horarios disponibles en ese período. ¿Te gustaría ver opciones para la próxima semana?"
            return "I'm sorry, I couldn't find available times in that period. Would you like to see options for next week?"
        
        if language == "es":
            message = "Estos son los horarios disponibles:\n\n"
            for i, slot in enumerate(slots, 1):
                message += f"{i}. {slot['day']}, {slot['date']} a las {slot['time']}\n"
            message += "\n¿Cuál prefieres?"
        else:
            message = "Here are the available times:\n\n"
            for i, slot in enumerate(slots, 1):
                message += f"{i}. {slot['day']}, {slot['date']} at {slot['time']}\n"
            message += "\nWhich one works for you?"
        
        return message
    
    def confirm_booking(
        self,
        slot: Dict,
        invitee_name: str,
        invitee_email: str,
        language: str = "en"
    ) -> Dict:
        """
        Confirm a booking and return confirmation message.
        
        Note: Calendly API v2 doesn't support direct booking creation.
        Instead, we create a scheduling link and send it to the user.
        """
        
        booking_link = self.create_booking_link(slot['event_type_uuid'])
        
        if language == "es":
            message = f"""¡Perfecto! He reservado tu cita para:

📅 {slot['day']}, {slot['date']}
🕐 {slot['time']}

Por favor confirma tu cita usando este enlace:
{booking_link}

Recibirás un email de confirmación con los detalles y el enlace de la reunión."""
        else:
            message = f"""Perfect! I've reserved your appointment for:

📅 {slot['day']}, {slot['date']}
🕐 {slot['time']}

Please confirm your appointment using this link:
{booking_link}

You'll receive a confirmation email with the details and meeting link."""
        
        return {
            "success": True,
            "message": message,
            "booking_link": booking_link,
            "slot": slot
        }


# n8n function
def handle_scheduling_request(
    message: str,
    user_email: str,
    user_name: str,
    language: str = "en"
) -> Dict:
    """
    Handle a scheduling request in n8n workflow.
    """
    
    # In production, initialize with real credentials
    # calendly = CalendlyClient(api_key=os.environ['CALENDLY_API_KEY'])
    # agent = CalendarAgent(os.environ['ANTHROPIC_API_KEY'], calendly)
    
    # Parse request
    # request = agent.parse_request(message, language)
    
    # Get slots
    # slots = agent.get_available_slots(request)
    
    # Format response
    # response = agent.format_slots_message(slots, language)
    
    # Placeholder for n8n
    return {
        "success": True,
        "message": "I'd be happy to help you schedule a meeting. Here are some available times...",
        "slots": [
            {"day": "Monday", "date": "January 29, 2025", "time": "10:00 AM"},
            {"day": "Monday", "date": "January 29, 2025", "time": "2:00 PM"},
            {"day": "Tuesday", "date": "January 30, 2025", "time": "11:00 AM"}
        ],
        "booking_link": "https://calendly.com/ops1/30min"
    }
```

---

## n8n Workflow

```json
{
  "name": "Ops-1 Calendar Agent",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "schedule-meeting",
        "responseMode": "responseNode"
      },
      "name": "Schedule Request",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "model": "claude-3-haiku-20240307",
        "messages": {
          "values": [
            {
              "role": "system",
              "content": "Parse scheduling request. Return JSON: {meeting_type, duration, topic, urgency, preferred_date, preferred_time}. meeting_type: call/video/in_person. duration: 15/30/60. urgency: asap/this_week/flexible."
            },
            {
              "role": "user",
              "content": "={{ $json.body.message }}"
            }
          ]
        }
      },
      "name": "Parse Request",
      "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      "position": [450, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://api.calendly.com/event_type_available_times",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "calendlyApi",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "event_type",
              "value": "={{ $env.CALENDLY_EVENT_TYPE_URL }}"
            },
            {
              "name": "start_time",
              "value": "={{ new Date().toISOString() }}"
            },
            {
              "name": "end_time",
              "value": "={{ new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }}"
            }
          ]
        }
      },
      "name": "Get Available Times",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300],
      "credentials": {
        "calendlyApi": {
          "id": "calendly-api"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "// Format available slots\nconst slots = $json.collection || [];\nconst language = $('Schedule Request').first().json.body?.language || 'en';\n\nconst formatted = slots.slice(0, 5).map((slot, i) => {\n  const date = new Date(slot.start_time);\n  return {\n    index: i + 1,\n    datetime_utc: slot.start_time,\n    day: date.toLocaleDateString('en-US', { weekday: 'long' }),\n    date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),\n    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })\n  };\n});\n\nlet message;\nif (language === 'es') {\n  message = 'Estos son los horarios disponibles:\\n\\n';\n  formatted.forEach(s => {\n    message += `${s.index}. ${s.day}, ${s.date} a las ${s.time}\\n`;\n  });\n  message += '\\n¿Cuál prefieres?';\n} else {\n  message = 'Here are the available times:\\n\\n';\n  formatted.forEach(s => {\n    message += `${s.index}. ${s.day}, ${s.date} at ${s.time}\\n`;\n  });\n  message += '\\nWhich one works for you?';\n}\n\nreturn {\n  json: {\n    success: true,\n    message,\n    slots: formatted,\n    booking_link: $env.CALENDLY_BOOKING_URL || 'https://calendly.com/ops1'\n  }\n};"
      },
      "name": "Format Response",
      "type": "n8n-nodes-base.code",
      "position": [850, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify($json) }}"
      },
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1050, 300]
    }
  ],
  "connections": {
    "Schedule Request": {
      "main": [[{"node": "Parse Request", "type": "main", "index": 0}]]
    },
    "Parse Request": {
      "main": [[{"node": "Get Available Times", "type": "main", "index": 0}]]
    },
    "Get Available Times": {
      "main": [[{"node": "Format Response", "type": "main", "index": 0}]]
    },
    "Format Response": {
      "main": [[{"node": "Respond", "type": "main", "index": 0}]]
    }
  }
}
```

---

## Ejemplos de Uso

### Agendar Llamada

**Usuario:** "Quiero agendar una llamada para discutir mi contabilidad"

**Agente:**
```
Estos son los horarios disponibles:

1. Monday, January 29, 2025 a las 10:00 AM
2. Monday, January 29, 2025 a las 2:00 PM
3. Tuesday, January 30, 2025 a las 11:00 AM
4. Wednesday, January 31, 2025 a las 9:00 AM
5. Wednesday, January 31, 2025 a las 3:00 PM

¿Cuál prefieres?
```

**Usuario:** "El martes a las 11"

**Agente:**
```
¡Perfecto! He reservado tu cita para:

📅 Tuesday, January 30, 2025
🕐 11:00 AM

Por favor confirma tu cita usando este enlace:
https://calendly.com/ops1/30min?date=2025-01-30&time=11:00

Recibirás un email de confirmación con los detalles y el enlace de la reunión.
```

---

## Webhooks para Notificaciones

### Calendly Webhook Events

```python
# Cuando alguien agenda
{
    "event": "invitee.created",
    "payload": {
        "event": {...},
        "invitee": {
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}

# Cuando alguien cancela
{
    "event": "invitee.canceled",
    "payload": {...}
}
```

### n8n Webhook Handler

```json
{
  "name": "Calendly Webhook Handler",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "calendly-webhook"
      },
      "name": "Calendly Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.body.event }}",
              "value2": "invitee.created"
            }
          ]
        }
      },
      "name": "Event Type",
      "type": "n8n-nodes-base.if",
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "send",
        "toEmail": "={{ $json.body.payload.invitee.email }}",
        "subject": "Meeting Confirmed - Ops-1",
        "message": "Your meeting has been confirmed!"
      },
      "name": "Send Confirmation",
      "type": "n8n-nodes-base.emailSend",
      "position": [650, 200]
    }
  ]
}
```

---

## Configuración

### Variables de Entorno

```env
CALENDLY_API_KEY=your-api-key
CALENDLY_EVENT_TYPE_URL=https://api.calendly.com/event_types/abc123
CALENDLY_BOOKING_URL=https://calendly.com/your-company/30min
```

### Calendly Setup

1. Ir a https://calendly.com/integrations/api_webhooks
2. Crear Personal Access Token
3. Configurar Event Types (15 min, 30 min, 60 min)
4. Configurar Webhooks para notificaciones
