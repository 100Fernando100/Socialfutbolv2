# Sage Integration Skill

## Overview
This skill enables Ops-1 to connect to Sage accounting products (Business Cloud and Desktop/Sage 50) to generate financial reports, query transactions, and extract accounting data using natural language.

## Supported Versions
- **Sage Business Cloud Accounting** - Cloud-based, REST API
- **Sage 50 (Peachtree)** - Desktop, SDK/ODBC
- **Sage Intacct** - Enterprise cloud, REST API

---

## Sage Business Cloud Accounting

### Authentication
```
Method: OAuth 2.0
Authorization URL: https://www.sageone.com/oauth2/auth/central
Token URL: https://oauth.accounting.sage.com/token
Scopes: full_access (or readonly)
```

### Environment URLs
```
API Base: https://api.accounting.sage.com/v3.1
Countries: US, CA, UK, IE, ES, FR, DE
```

### Required Credentials
```yaml
client_id: "YOUR_CLIENT_ID"
client_secret: "YOUR_CLIENT_SECRET"
redirect_uri: "https://your-app.com/sage/callback"
access_token: "TOKEN"
refresh_token: "TOKEN"
resource_owner_id: "BUSINESS_ID"
```

### Core API Endpoints

#### Financial Reports
```
# Balance Sheet
GET /balance_sheets?from_date=2025-01-01&to_date=2025-12-31

# Profit and Loss
GET /profit_and_loss?from_date=2025-01-01&to_date=2025-12-31

# Aged Receivables
GET /aged_receivables_reports?report_date=2025-01-28

# Aged Payables  
GET /aged_payables_reports?report_date=2025-01-28

# Trial Balance
GET /trial_balance?from_date=2025-01-01&to_date=2025-12-31

# Cash Flow (Manual calculation from transactions)
GET /bank_transactions?from_date=2025-01-01&to_date=2025-12-31
```

#### Contacts & Customers
```
# All contacts
GET /contacts

# Customers only
GET /contacts?contact_type_id=CUSTOMER

# Suppliers/Vendors only
GET /contacts?contact_type_id=VENDOR

# Single contact
GET /contacts/{contact_id}

# Contact with balances
GET /contacts/{contact_id}?include_balance=true
```

#### Sales & Invoices
```
# All sales invoices
GET /sales_invoices

# Unpaid invoices
GET /sales_invoices?status_id=UNPAID

# Overdue invoices
GET /sales_invoices?status_id=OVERDUE

# By customer
GET /sales_invoices?contact_id={customer_id}

# By date range
GET /sales_invoices?from_date=2025-01-01&to_date=2025-01-31

# Single invoice
GET /sales_invoices/{invoice_id}
```

#### Purchases & Bills
```
# All purchase invoices (bills)
GET /purchase_invoices

# Unpaid bills
GET /purchase_invoices?status_id=UNPAID

# By vendor
GET /purchase_invoices?contact_id={vendor_id}
```

#### Bank & Transactions
```
# Bank accounts
GET /bank_accounts

# Bank transactions
GET /bank_transactions?bank_account_id={id}&from_date=2025-01-01

# Payments received
GET /contact_payments

# Payments made
GET /supplier_payments
```

#### Products & Services
```
# All products
GET /products

# Services
GET /services

# Stock items
GET /stock_items
```

#### Ledger Accounts
```
# Chart of accounts
GET /ledger_accounts

# Account transactions
GET /ledger_entries?ledger_account_id={id}&from_date=2025-01-01
```

### Pagination
```
# All list endpoints support pagination
GET /sales_invoices?page=1&items_per_page=50

# Response includes:
{
  "$total": 150,
  "$page": 1,
  "$next": "/sales_invoices?page=2&items_per_page=50",
  "$items_per_page": 50
}
```

---

## Sage 50 (Desktop) Integration

### Connection Methods

#### Option 1: Sage 50 SDK (Recommended)
```
Platform: Windows only
SDK: Sage.Peachtree.API.dll
Connection: Local or network path to company file
```

#### Option 2: ODBC Connection
```
Driver: Sage Line 50 v27 ODBC Driver
DSN: Setup in Windows ODBC Administrator
Database: Company data path
```

### SDK Connection Example (C#/.NET)
```csharp
using Sage.Peachtree.API;

// Connect to company
var company = new Company();
company.Open("C:\\Sage\\Company\\Sample.SAJ", "username", "password");

// Get customers
var customers = company.Factories.CustomerFactory.List();

// Get invoices
var invoices = company.Factories.SalesInvoiceFactory.List();

// Get aged receivables
var aging = company.Reports.GetAgedReceivables(DateTime.Today);

company.Close();
```

### ODBC Query Examples
```sql
-- Connect via ODBC to Sage 50 database

-- List all customers
SELECT CUSTOMER_ID, NAME, BALANCE, CREDIT_LIMIT
FROM CUSTOMER
WHERE INACTIVE = 0;

-- Unpaid invoices
SELECT i.INVOICE_NO, i.CUSTOMER_ID, c.NAME, i.TOTAL, i.BALANCE, i.DUE_DATE
FROM INVOICE i
JOIN CUSTOMER c ON i.CUSTOMER_ID = c.CUSTOMER_ID
WHERE i.BALANCE > 0;

-- Aged receivables
SELECT 
    c.NAME,
    SUM(CASE WHEN DATEDIFF(day, i.DUE_DATE, GETDATE()) <= 0 THEN i.BALANCE ELSE 0 END) as Current,
    SUM(CASE WHEN DATEDIFF(day, i.DUE_DATE, GETDATE()) BETWEEN 1 AND 30 THEN i.BALANCE ELSE 0 END) as Days_1_30,
    SUM(CASE WHEN DATEDIFF(day, i.DUE_DATE, GETDATE()) BETWEEN 31 AND 60 THEN i.BALANCE ELSE 0 END) as Days_31_60,
    SUM(CASE WHEN DATEDIFF(day, i.DUE_DATE, GETDATE()) > 60 THEN i.BALANCE ELSE 0 END) as Over_60
FROM INVOICE i
JOIN CUSTOMER c ON i.CUSTOMER_ID = c.CUSTOMER_ID
WHERE i.BALANCE > 0
GROUP BY c.NAME;

-- Sales by customer
SELECT c.NAME, SUM(i.TOTAL) as Total_Sales
FROM INVOICE i
JOIN CUSTOMER c ON i.CUSTOMER_ID = c.CUSTOMER_ID
WHERE i.DATE BETWEEN '2025-01-01' AND '2025-12-31'
GROUP BY c.NAME
ORDER BY Total_Sales DESC;

-- Bank account balances
SELECT ACCOUNT_ID, DESCRIPTION, BALANCE
FROM NOMINAL_LEDGER
WHERE ACCOUNT_TYPE = 'BANK';
```

### Python + pyodbc Example
```python
import pyodbc

# Connect to Sage 50 via ODBC
conn = pyodbc.connect(
    'DSN=Sage50;'
    'UID=manager;'
    'PWD=password;'
)

cursor = conn.cursor()

# Get unpaid invoices
cursor.execute("""
    SELECT INVOICE_NO, CUSTOMER_ID, TOTAL, BALANCE, DUE_DATE
    FROM INVOICE
    WHERE BALANCE > 0
    ORDER BY DUE_DATE
""")

invoices = cursor.fetchall()
conn.close()
```

---

## Sage Intacct (Enterprise)

### Authentication
```
Method: Web Services (SOAP) or REST API
Session-based authentication
```

### REST API Base
```
https://api.intacct.com/ia/xml/xmlgw.phtml
```

### Credentials
```yaml
company_id: "YOUR_COMPANY_ID"
user_id: "YOUR_USER_ID"
user_password: "YOUR_PASSWORD"
sender_id: "YOUR_SENDER_ID"
sender_password: "YOUR_SENDER_PASSWORD"
```

### Common Queries
```xml
<!-- Get AR Aging Report -->
<readReport>
    <report>ARAGING</report>
    <arguments>
        <REPORTINGPERIOD>Current Year</REPORTINGPERIOD>
    </arguments>
</readReport>

<!-- Get Customers -->
<readByQuery>
    <object>CUSTOMER</object>
    <fields>*</fields>
    <query>STATUS = 'active'</query>
</readByQuery>

<!-- Get Invoices -->
<readByQuery>
    <object>ARINVOICE</object>
    <fields>*</fields>
    <query>STATE = 'Posted' AND TOTALDUE > 0</query>
</readByQuery>
```

---

## Natural Language Query Mapping

### User Query → Sage Action

| User Says | Sage Action |
|-----------|-------------|
| "Show unpaid invoices" | GET /sales_invoices?status_id=UNPAID |
| "Who owes me money?" | GET /aged_receivables_reports |
| "P&L for Q4" | GET /profit_and_loss with date params |
| "Balance sheet" | GET /balance_sheets |
| "List all customers" | GET /contacts?contact_type_id=CUSTOMER |
| "Bills due this week" | GET /purchase_invoices?status_id=UNPAID + filter |
| "How much did [customer] pay?" | GET /contact_payments?contact_id={id} |
| "What do I owe vendors?" | GET /aged_payables_reports |
| "Bank balance" | GET /bank_accounts |
| "Customer balance for [name]" | GET /contacts?search={name}&include_balance=true |

### Example Implementation

```python
import requests

class SageClient:
    def __init__(self, access_token, resource_owner_id):
        self.base_url = "https://api.accounting.sage.com/v3.1"
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Site": resource_owner_id,
            "Content-Type": "application/json"
        }
    
    def get_unpaid_invoices(self):
        """Get all unpaid sales invoices"""
        response = requests.get(
            f"{self.base_url}/sales_invoices",
            headers=self.headers,
            params={"status_id": "UNPAID"}
        )
        return response.json()
    
    def get_aged_receivables(self, report_date=None):
        """Get aged receivables report"""
        params = {}
        if report_date:
            params["report_date"] = report_date
        
        response = requests.get(
            f"{self.base_url}/aged_receivables_reports",
            headers=self.headers,
            params=params
        )
        return response.json()
    
    def get_profit_and_loss(self, from_date, to_date):
        """Get P&L report for date range"""
        response = requests.get(
            f"{self.base_url}/profit_and_loss",
            headers=self.headers,
            params={
                "from_date": from_date,
                "to_date": to_date
            }
        )
        return response.json()
    
    def get_customer_balance(self, customer_name):
        """Get balance for specific customer"""
        # First search for customer
        contacts = requests.get(
            f"{self.base_url}/contacts",
            headers=self.headers,
            params={
                "contact_type_id": "CUSTOMER",
                "search": customer_name
            }
        ).json()
        
        if contacts.get("$items"):
            contact_id = contacts["$items"][0]["id"]
            # Get with balance
            return requests.get(
                f"{self.base_url}/contacts/{contact_id}",
                headers=self.headers,
                params={"include_balance": "true"}
            ).json()
        
        return None


def process_sage_query(user_input: str, sage_client: SageClient):
    """Map natural language to Sage API calls"""
    
    user_input_lower = user_input.lower()
    
    if "unpaid invoices" in user_input_lower:
        return sage_client.get_unpaid_invoices()
    
    elif "aged receivables" in user_input_lower or "who owes" in user_input_lower:
        return sage_client.get_aged_receivables()
    
    elif "profit and loss" in user_input_lower or "p&l" in user_input_lower:
        from_date, to_date = extract_dates(user_input)
        return sage_client.get_profit_and_loss(from_date, to_date)
    
    elif "customer balance" in user_input_lower:
        customer_name = extract_customer_name(user_input)
        return sage_client.get_customer_balance(customer_name)
```

---

## n8n Workflow Integration

### Sage HTTP Request Node
```json
{
  "nodes": [
    {
      "name": "Sage API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "https://api.accounting.sage.com/v3.1/sales_invoices",
        "authentication": "oAuth2",
        "options": {
          "headers": {
            "X-Site": "={{ $credentials.resourceOwnerId }}"
          }
        },
        "queryParameters": {
          "status_id": "UNPAID"
        }
      },
      "credentials": {
        "oAuth2Api": "sage_oauth"
      }
    }
  ]
}
```

### OAuth2 Credential Setup
```json
{
  "name": "sage_oauth",
  "type": "oAuth2Api",
  "data": {
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET",
    "authUrl": "https://www.sageone.com/oauth2/auth/central",
    "accessTokenUrl": "https://oauth.accounting.sage.com/token",
    "scope": "full_access"
  }
}
```

---

## Error Handling

### Common HTTP Errors
```
400 - Bad Request → Check parameter format
401 - Unauthorized → Token expired, refresh needed
403 - Forbidden → Check scopes/permissions
404 - Not Found → Entity doesn't exist
422 - Validation Error → Check required fields
429 - Rate Limited → Wait and retry
500 - Server Error → Retry with backoff
```

### Rate Limits
- **Sage Business Cloud**: 3,600 requests/hour
- **Implement**: Exponential backoff for 429 errors

### Token Refresh
```python
def refresh_token(refresh_token, client_id, client_secret):
    response = requests.post(
        "https://oauth.accounting.sage.com/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": client_id,
            "client_secret": client_secret
        }
    )
    return response.json()
```

---

## Security Considerations

1. **Token storage** - Encrypt access/refresh tokens
2. **Refresh tokens** - Auto-refresh before expiry
3. **PII handling** - Customer data needs scrubbing before display
4. **Audit logging** - Log all API calls with timestamps
5. **Least privilege** - Request only needed scopes

---

## Sample Report Output

### Aged Receivables
```json
{
  "report_name": "AgedReceivables",
  "report_date": "2025-01-28",
  "generated_at": "2025-01-28T12:00:00Z",
  "currency": "CAD",
  "data": [
    {
      "contact_name": "ABC Company",
      "contact_id": "abc123",
      "current": 2500.00,
      "period_1": 1200.00,
      "period_2": 0.00,
      "period_3": 800.00,
      "older": 0.00,
      "total": 4500.00
    }
  ],
  "totals": {
    "current": 25000.00,
    "period_1": 12000.00,
    "period_2": 5000.00,
    "period_3": 3000.00,
    "older": 1000.00,
    "total": 46000.00
  },
  "audit_receipt": "AR-2025-0128-SAGE-001"
}
```

---

## Dependencies

```bash
# Python
pip install requests oauthlib pyodbc

# For Sage 50 SDK (Windows/.NET)
# Download from Sage Developer portal

# n8n
# Use HTTP Request node with OAuth2
```

---

## References
- Sage Accounting API: https://developer.sage.com/accounting/reference/
- OAuth Guide: https://developer.sage.com/accounting/guides/authenticating/
- Sage 50 SDK: https://developer.sage.com/sage50/
- Sage Intacct: https://developer.intacct.com/
