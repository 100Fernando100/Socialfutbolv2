# Power BI Agent Skill

## Overview

El Power BI Agent permite a los usuarios crear, actualizar y consultar dashboards de Power BI usando lenguaje natural.

**Capacidades:**
- Conectar datasets de QuickBooks/Sage/Excel
- Crear visualizaciones automáticamente
- Actualizar dashboards existentes
- Responder preguntas sobre los datos
- Exportar reportes

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                  │
│                                                                  │
│  "Crea un dashboard de ventas por mes con gráfico de barras"   │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POWER BI AGENT                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PARSE REQUEST                                                │
│     • Tipo: create_dashboard | update_visual | query_data       │
│     • Métricas: ventas, gastos, profit, etc.                    │
│     • Dimensiones: tiempo, producto, cliente, región            │
│     • Visualización: bar, line, pie, table, card                │
│                                                                  │
│  2. CONNECT DATA SOURCE                                          │
│     • QuickBooks Online → Sales, Expenses, Invoices             │
│     • Sage → Transactions, P&L, Balance                         │
│     • Excel/CSV → Custom datasets                                │
│                                                                  │
│  3. GENERATE DAX/M QUERY                                         │
│     • Medidas calculadas                                         │
│     • Filtros                                                    │
│     • Agregaciones                                               │
│                                                                  │
│  4. CREATE/UPDATE VISUAL                                         │
│     • Power BI REST API                                          │
│     • Push datasets                                              │
│     • Update reports                                             │
│                                                                  │
│  5. RETURN RESULT                                                │
│     • Link al dashboard                                          │
│     • Embed code                                                 │
│     • Screenshot/PDF                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Power BI API Integration

### Authentication (Azure AD)

```python
# powerbi_auth.py

import msal
import requests
from typing import Dict, Optional

class PowerBIAuth:
    """
    Handles Azure AD authentication for Power BI API.
    """
    
    AUTHORITY = "https://login.microsoftonline.com/{tenant_id}"
    SCOPE = ["https://analysis.windows.net/powerbi/api/.default"]
    
    def __init__(
        self,
        client_id: str,
        client_secret: str,
        tenant_id: str
    ):
        self.client_id = client_id
        self.client_secret = client_secret
        self.tenant_id = tenant_id
        self.authority = self.AUTHORITY.format(tenant_id=tenant_id)
        
        self.app = msal.ConfidentialClientApplication(
            client_id,
            authority=self.authority,
            client_credential=client_secret
        )
        
        self._token = None
    
    def get_token(self) -> str:
        """Get access token for Power BI API"""
        
        result = self.app.acquire_token_for_client(scopes=self.SCOPE)
        
        if "access_token" in result:
            self._token = result["access_token"]
            return self._token
        else:
            raise Exception(f"Auth failed: {result.get('error_description')}")
    
    @property
    def headers(self) -> Dict:
        """Get headers with auth token"""
        
        if not self._token:
            self.get_token()
        
        return {
            "Authorization": f"Bearer {self._token}",
            "Content-Type": "application/json"
        }
```

### Power BI Client

```python
# powerbi_client.py

import requests
from typing import Dict, List, Optional
import json

class PowerBIClient:
    """
    Client for Power BI REST API operations.
    """
    
    BASE_URL = "https://api.powerbi.com/v1.0/myorg"
    
    def __init__(self, auth: 'PowerBIAuth'):
        self.auth = auth
    
    # ==================== WORKSPACES ====================
    
    def list_workspaces(self) -> List[Dict]:
        """List all workspaces (groups)"""
        
        url = f"{self.BASE_URL}/groups"
        response = requests.get(url, headers=self.auth.headers)
        
        if response.status_code == 200:
            return response.json().get('value', [])
        return []
    
    def get_workspace(self, workspace_id: str) -> Dict:
        """Get workspace details"""
        
        url = f"{self.BASE_URL}/groups/{workspace_id}"
        response = requests.get(url, headers=self.auth.headers)
        
        return response.json() if response.status_code == 200 else {}
    
    # ==================== DATASETS ====================
    
    def list_datasets(self, workspace_id: str) -> List[Dict]:
        """List datasets in a workspace"""
        
        url = f"{self.BASE_URL}/groups/{workspace_id}/datasets"
        response = requests.get(url, headers=self.auth.headers)
        
        if response.status_code == 200:
            return response.json().get('value', [])
        return []
    
    def create_push_dataset(
        self,
        workspace_id: str,
        dataset_name: str,
        tables: List[Dict]
    ) -> Dict:
        """
        Create a push dataset for real-time data.
        
        Args:
            workspace_id: Target workspace
            dataset_name: Name for the dataset
            tables: List of table definitions with columns
        
        Example tables:
            [{
                "name": "Sales",
                "columns": [
                    {"name": "Date", "dataType": "DateTime"},
                    {"name": "Amount", "dataType": "Double"},
                    {"name": "Product", "dataType": "String"}
                ]
            }]
        """
        
        url = f"{self.BASE_URL}/groups/{workspace_id}/datasets"
        
        payload = {
            "name": dataset_name,
            "defaultMode": "Push",
            "tables": tables
        }
        
        response = requests.post(url, headers=self.auth.headers, json=payload)
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            return {"error": response.text}
    
    def push_rows(
        self,
        workspace_id: str,
        dataset_id: str,
        table_name: str,
        rows: List[Dict]
    ) -> bool:
        """Push data rows to a dataset table"""
        
        url = f"{self.BASE_URL}/groups/{workspace_id}/datasets/{dataset_id}/tables/{table_name}/rows"
        
        payload = {"rows": rows}
        
        response = requests.post(url, headers=self.auth.headers, json=payload)
        
        return response.status_code == 200
    
    def refresh_dataset(self, workspace_id: str, dataset_id: str) -> bool:
        """Trigger dataset refresh"""
        
        url = f"{self.BASE_URL}/groups/{workspace_id}/datasets/{dataset_id}/refreshes"
        
        response = requests.post(url, headers=self.auth.headers)
        
        return response.status_code == 202
    
    # ==================== REPORTS ====================
    
    def list_reports(self, workspace_id: str) -> List[Dict]:
        """List reports in a workspace"""
        
        url = f"{self.BASE_URL}/groups/{workspace_id}/reports"
        response = requests.get(url, headers=self.auth.headers)
        
        if response.status_code == 200:
            return response.json().get('value', [])
        return []
    
    def get_report(self, workspace_id: str, report_id: str) -> Dict:
        """Get report details"""
        
        url = f"{self.BASE_URL}/groups/{workspace_id}/reports/{report_id}"
        response = requests.get(url, headers=self.auth.headers)
        
        return response.json() if response.status_code == 200 else {}
    
    def clone_report(
        self,
        workspace_id: str,
        report_id: str,
        new_name: str,
        target_workspace_id: Optional[str] = None
    ) -> Dict:
        """Clone a report"""
        
        url = f"{self.BASE_URL}/groups/{workspace_id}/reports/{report_id}/Clone"
        
        payload = {
            "name": new_name,
            "targetWorkspaceId": target_workspace_id or workspace_id
        }
        
        response = requests.post(url, headers=self.auth.headers, json=payload)
        
        return response.json() if response.status_code == 200 else {"error": response.text}
    
    def export_report(
        self,
        workspace_id: str,
        report_id: str,
        format: str = "PDF"
    ) -> bytes:
        """
        Export report to file.
        
        Args:
            format: PDF, PPTX, PNG
        """
        
        # Start export
        url = f"{self.BASE_URL}/groups/{workspace_id}/reports/{report_id}/ExportTo"
        
        payload = {"format": format}
        
        response = requests.post(url, headers=self.auth.headers, json=payload)
        
        if response.status_code == 202:
            export_id = response.json().get('id')
            
            # Poll for completion
            import time
            for _ in range(30):  # Max 30 attempts
                status_url = f"{self.BASE_URL}/groups/{workspace_id}/reports/{report_id}/exports/{export_id}"
                status_response = requests.get(status_url, headers=self.auth.headers)
                
                if status_response.status_code == 200:
                    status = status_response.json()
                    if status.get('status') == 'Succeeded':
                        # Download file
                        file_url = f"{status_url}/file"
                        file_response = requests.get(file_url, headers=self.auth.headers)
                        return file_response.content
                    elif status.get('status') == 'Failed':
                        break
                
                time.sleep(2)
        
        return None
    
    # ==================== EMBED ====================
    
    def get_embed_token(
        self,
        workspace_id: str,
        report_id: str,
        dataset_id: str
    ) -> Dict:
        """Get embed token for embedding report in app"""
        
        url = f"{self.BASE_URL}/groups/{workspace_id}/reports/{report_id}/GenerateToken"
        
        payload = {
            "accessLevel": "View",
            "datasetId": dataset_id
        }
        
        response = requests.post(url, headers=self.auth.headers, json=payload)
        
        if response.status_code == 200:
            return response.json()
        return {"error": response.text}
    
    def get_embed_url(self, workspace_id: str, report_id: str) -> str:
        """Get the embed URL for a report"""
        
        report = self.get_report(workspace_id, report_id)
        return report.get('embedUrl', '')
```

---

## Natural Language to Dashboard

### Dashboard Generator

```python
# dashboard_generator.py

import anthropic
from typing import Dict, List, Optional
import json

class DashboardGenerator:
    """
    Converts natural language requests to Power BI dashboard configurations.
    """
    
    PARSE_PROMPT = """You are a Power BI dashboard expert. Parse the user's request and extract:

1. **dashboard_type**: The type of dashboard
   - sales: Revenue, orders, customers
   - expenses: Costs, spending, budgets
   - financial: P&L, balance sheet, cash flow
   - kpi: Key performance indicators
   - custom: Other

2. **metrics**: What to measure (list)
   - revenue, sales, orders, units
   - expenses, costs, spending
   - profit, margin, growth
   - count, average, sum, percentage

3. **dimensions**: How to break down the data (list)
   - time: day, week, month, quarter, year
   - product, category, sku
   - customer, segment, region
   - employee, department

4. **visualizations**: Suggested chart types (list)
   - bar: Compare categories
   - line: Show trends over time
   - pie: Show proportions
   - card: Single KPI number
   - table: Detailed data
   - map: Geographic data
   - gauge: Progress toward goal

5. **filters**: Any filters mentioned
   - date_range: Start and end dates
   - categories: Specific categories to include/exclude
   - threshold: Minimum/maximum values

6. **data_source**: Where the data comes from
   - quickbooks, sage, excel, sql, custom

Respond ONLY in JSON:
{
    "dashboard_type": "string",
    "title": "Suggested dashboard title",
    "metrics": ["metric1", "metric2"],
    "dimensions": ["dimension1", "dimension2"],
    "visualizations": [
        {"type": "bar", "metric": "revenue", "dimension": "month"},
        {"type": "card", "metric": "total_revenue"}
    ],
    "filters": {
        "date_range": {"start": "2025-01-01", "end": "2025-12-31"},
        "categories": []
    },
    "data_source": "quickbooks"
}"""

    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def parse_request(self, user_request: str, context: Optional[Dict] = None) -> Dict:
        """
        Parse natural language request into dashboard configuration.
        """
        
        # Add context if available
        prompt = user_request
        if context:
            prompt = f"Context: Company uses {context.get('accounting_system', 'QuickBooks')}.\n"
            prompt += f"Available data: {context.get('available_tables', 'sales, expenses, invoices')}\n\n"
            prompt += f"Request: {user_request}"
        
        response = self.client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            system=self.PARSE_PROMPT,
            messages=[{"role": "user", "content": prompt}]
        )
        
        try:
            text = response.content[0].text
            if "```" in text:
                text = text.split("```")[1].replace("json", "").strip()
            return json.loads(text)
        except:
            return self._fallback_parse(user_request)
    
    def _fallback_parse(self, request: str) -> Dict:
        """Fallback parsing using keywords"""
        
        request_lower = request.lower()
        
        # Detect dashboard type
        if any(kw in request_lower for kw in ['sales', 'revenue', 'ventas']):
            dashboard_type = "sales"
        elif any(kw in request_lower for kw in ['expense', 'cost', 'gasto']):
            dashboard_type = "expenses"
        elif any(kw in request_lower for kw in ['p&l', 'profit', 'financial']):
            dashboard_type = "financial"
        else:
            dashboard_type = "kpi"
        
        # Detect time dimension
        time_dimension = "month"
        if "week" in request_lower or "semana" in request_lower:
            time_dimension = "week"
        elif "quarter" in request_lower or "trimestre" in request_lower:
            time_dimension = "quarter"
        elif "year" in request_lower or "año" in request_lower:
            time_dimension = "year"
        
        return {
            "dashboard_type": dashboard_type,
            "title": f"{dashboard_type.title()} Dashboard",
            "metrics": ["total", "count", "average"],
            "dimensions": [time_dimension],
            "visualizations": [
                {"type": "bar", "metric": "total", "dimension": time_dimension},
                {"type": "line", "metric": "total", "dimension": time_dimension},
                {"type": "card", "metric": "total"}
            ],
            "filters": {},
            "data_source": "quickbooks"
        }
    
    def generate_dax_measures(self, config: Dict) -> List[Dict]:
        """Generate DAX measures for the dashboard"""
        
        measures = []
        
        for metric in config.get('metrics', []):
            if metric in ['revenue', 'sales', 'total']:
                measures.append({
                    "name": "Total Revenue",
                    "expression": "SUM(Sales[Amount])",
                    "formatString": "$#,##0.00"
                })
            elif metric in ['count', 'orders']:
                measures.append({
                    "name": "Order Count",
                    "expression": "COUNTROWS(Sales)",
                    "formatString": "#,##0"
                })
            elif metric in ['average', 'avg']:
                measures.append({
                    "name": "Average Order",
                    "expression": "AVERAGE(Sales[Amount])",
                    "formatString": "$#,##0.00"
                })
            elif metric in ['growth', 'change']:
                measures.append({
                    "name": "Growth %",
                    "expression": """
                        VAR CurrentPeriod = SUM(Sales[Amount])
                        VAR PreviousPeriod = CALCULATE(SUM(Sales[Amount]), DATEADD(Calendar[Date], -1, MONTH))
                        RETURN DIVIDE(CurrentPeriod - PreviousPeriod, PreviousPeriod)
                    """,
                    "formatString": "0.0%"
                })
        
        return measures
    
    def generate_dataset_schema(self, data_source: str) -> Dict:
        """Generate dataset schema based on data source"""
        
        schemas = {
            "quickbooks": {
                "name": "QuickBooks Data",
                "tables": [
                    {
                        "name": "Sales",
                        "columns": [
                            {"name": "TransactionId", "dataType": "String"},
                            {"name": "Date", "dataType": "DateTime"},
                            {"name": "CustomerName", "dataType": "String"},
                            {"name": "Amount", "dataType": "Double"},
                            {"name": "Product", "dataType": "String"},
                            {"name": "Category", "dataType": "String"}
                        ]
                    },
                    {
                        "name": "Expenses",
                        "columns": [
                            {"name": "TransactionId", "dataType": "String"},
                            {"name": "Date", "dataType": "DateTime"},
                            {"name": "VendorName", "dataType": "String"},
                            {"name": "Amount", "dataType": "Double"},
                            {"name": "Category", "dataType": "String"},
                            {"name": "Account", "dataType": "String"}
                        ]
                    },
                    {
                        "name": "Calendar",
                        "columns": [
                            {"name": "Date", "dataType": "DateTime"},
                            {"name": "Year", "dataType": "Int64"},
                            {"name": "Month", "dataType": "Int64"},
                            {"name": "MonthName", "dataType": "String"},
                            {"name": "Quarter", "dataType": "String"},
                            {"name": "Week", "dataType": "Int64"}
                        ]
                    }
                ]
            },
            "sage": {
                "name": "Sage Data",
                "tables": [
                    {
                        "name": "Transactions",
                        "columns": [
                            {"name": "Id", "dataType": "String"},
                            {"name": "Date", "dataType": "DateTime"},
                            {"name": "ContactName", "dataType": "String"},
                            {"name": "Amount", "dataType": "Double"},
                            {"name": "Type", "dataType": "String"},
                            {"name": "LedgerAccount", "dataType": "String"}
                        ]
                    }
                ]
            }
        }
        
        return schemas.get(data_source, schemas["quickbooks"])
```

---

## n8n Workflow

```json
{
  "name": "Ops-1 Power BI Agent",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "powerbi-agent",
        "responseMode": "responseNode"
      },
      "name": "PowerBI Request",
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
              "content": "Parse the dashboard request and return JSON with: dashboard_type, title, metrics[], dimensions[], visualizations[], data_source. Only return valid JSON."
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
        "jsCode": "// Parse the dashboard config\nlet config;\ntry {\n  let text = $json.message?.content || $json.text;\n  if (text.includes('```')) {\n    text = text.split('```')[1].replace('json', '').trim();\n  }\n  config = JSON.parse(text);\n} catch (e) {\n  config = {\n    dashboard_type: 'sales',\n    title: 'Sales Dashboard',\n    metrics: ['revenue'],\n    dimensions: ['month'],\n    visualizations: [{type: 'bar', metric: 'revenue', dimension: 'month'}],\n    data_source: 'quickbooks'\n  };\n}\n\nreturn { json: { config, original_request: $('PowerBI Request').first().json.body } };"
      },
      "name": "Process Config",
      "type": "n8n-nodes-base.code",
      "position": [650, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.powerbi.com/v1.0/myorg/groups/{{ $env.POWERBI_WORKSPACE_ID }}/datasets",
        "authentication": "oAuth2",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "name",
              "value": "={{ $json.config.title }}"
            },
            {
              "name": "defaultMode",
              "value": "Push"
            },
            {
              "name": "tables",
              "value": "={{ JSON.stringify([{name: 'Data', columns: [{name: 'Date', dataType: 'DateTime'}, {name: 'Amount', dataType: 'Double'}, {name: 'Category', dataType: 'String'}]}]) }}"
            }
          ]
        }
      },
      "name": "Create Dataset",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300],
      "credentials": {
        "oAuth2Api": {
          "id": "powerbi-oauth"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({ success: true, dashboard_title: $json.config.title, dataset_id: $('Create Dataset').first().json.id, embed_url: 'https://app.powerbi.com/reportEmbed?reportId=' + $('Create Dataset').first().json.id }) }}"
      },
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1050, 300]
    }
  ],
  "connections": {
    "PowerBI Request": {
      "main": [[{"node": "Parse Request", "type": "main", "index": 0}]]
    },
    "Parse Request": {
      "main": [[{"node": "Process Config", "type": "main", "index": 0}]]
    },
    "Process Config": {
      "main": [[{"node": "Create Dataset", "type": "main", "index": 0}]]
    },
    "Create Dataset": {
      "main": [[{"node": "Respond", "type": "main", "index": 0}]]
    }
  }
}
```

---

## Ejemplos de Uso

### Crear Dashboard de Ventas

**Usuario:** "Crea un dashboard de ventas por mes con gráfico de barras"

**Resultado:**
```json
{
  "success": true,
  "dashboard_title": "Monthly Sales Dashboard",
  "dataset_id": "abc123",
  "embed_url": "https://app.powerbi.com/reportEmbed?reportId=abc123",
  "visualizations": [
    {"type": "bar", "title": "Sales by Month"},
    {"type": "card", "title": "Total Revenue"},
    {"type": "line", "title": "Sales Trend"}
  ]
}
```

### Actualizar con Datos de QuickBooks

**Usuario:** "Actualiza el dashboard con los datos de ventas de enero"

**Sistema:**
1. Conecta a QuickBooks API
2. Extrae ventas de enero
3. Push datos al dataset de Power BI
4. Dashboard se actualiza automáticamente

---

## Integración con Otros Agentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO INTEGRADO                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  QuickBooks Agent                                                │
│       │                                                          │
│       ▼                                                          │
│  Extrae datos (Sales, Expenses, Invoices)                       │
│       │                                                          │
│       ▼                                                          │
│  Power BI Agent                                                  │
│       │                                                          │
│       ▼                                                          │
│  Crea/Actualiza Dashboard                                        │
│       │                                                          │
│       ▼                                                          │
│  Genera link embebido o PDF                                      │
│       │                                                          │
│       ▼                                                          │
│  Word/PDF Agent (opcional)                                       │
│       │                                                          │
│       ▼                                                          │
│  Envía reporte al cliente                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuración Requerida

### Azure AD App Registration

1. Ir a Azure Portal → Azure Active Directory
2. App registrations → New registration
3. Agregar permisos de Power BI:
   - `Dataset.ReadWrite.All`
   - `Report.ReadWrite.All`
   - `Workspace.ReadWrite.All`

### Variables de Entorno

```env
POWERBI_CLIENT_ID=your-client-id
POWERBI_CLIENT_SECRET=your-client-secret
POWERBI_TENANT_ID=your-tenant-id
POWERBI_WORKSPACE_ID=your-workspace-id
```
