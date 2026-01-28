# QuickBooks Integration Skill

## Overview
This skill enables Ops-1 to connect to QuickBooks (Online and Desktop) to generate financial reports, query transactions, and extract accounting data using natural language.

## Supported Versions
- **QuickBooks Online (QBO)** - Cloud-based, REST API
- **QuickBooks Desktop (QBD)** - Windows application, Web Connector SDK

---

## QuickBooks Online Integration

### Authentication
```
Method: OAuth 2.0
Authorization URL: https://appcenter.intuit.com/connect/oauth2
Token URL: https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer
Scopes: com.intuit.quickbooks.accounting
```

### Environment URLs
```
Sandbox: https://sandbox-quickbooks.api.intuit.com
Production: https://quickbooks.api.intuit.com
Base Path: /v3/company/{realmId}/
```

### Required Credentials
```yaml
client_id: "YOUR_CLIENT_ID"
client_secret: "YOUR_CLIENT_SECRET"
redirect_uri: "https://your-app.com/callback"
realm_id: "COMPANY_ID"  # Retrieved after OAuth
access_token: "TOKEN"   # Retrieved after OAuth
refresh_token: "TOKEN"  # Valid 100 days
```

### Core API Endpoints

#### Reports
```
GET /v3/company/{realmId}/reports/ProfitAndLoss
GET /v3/company/{realmId}/reports/BalanceSheet
GET /v3/company/{realmId}/reports/CashFlow
GET /v3/company/{realmId}/reports/AgedReceivables
GET /v3/company/{realmId}/reports/AgedPayables
GET /v3/company/{realmId}/reports/CustomerSales
GET /v3/company/{realmId}/reports/VendorExpenses
GET /v3/company/{realmId}/reports/TrialBalance
GET /v3/company/{realmId}/reports/GeneralLedger
```

#### Query Parameters for Reports
```
?start_date=2025-01-01
&end_date=2025-12-31
&accounting_method=Accrual|Cash
&summarize_column_by=Month|Week|Quarter|Year
```

#### Entities (CRUD Operations)
```
# Customers
GET /v3/company/{realmId}/query?query=SELECT * FROM Customer
GET /v3/company/{realmId}/customer/{customerId}

# Invoices
GET /v3/company/{realmId}/query?query=SELECT * FROM Invoice WHERE DueDate < '2025-01-01'
GET /v3/company/{realmId}/invoice/{invoiceId}

# Payments
GET /v3/company/{realmId}/query?query=SELECT * FROM Payment

# Bills
GET /v3/company/{realmId}/query?query=SELECT * FROM Bill

# Accounts
GET /v3/company/{realmId}/query?query=SELECT * FROM Account

# Vendors
GET /v3/company/{realmId}/query?query=SELECT * FROM Vendor

# Items/Products
GET /v3/company/{realmId}/query?query=SELECT * FROM Item
```

### QuickBooks Query Language Examples
```sql
-- Unpaid invoices over 30 days
SELECT * FROM Invoice 
WHERE Balance > '0' 
AND DueDate < '2025-01-01'

-- Customer balances
SELECT * FROM Customer 
WHERE Balance > '0'

-- Recent transactions
SELECT * FROM Purchase 
WHERE TxnDate > '2025-01-01'
ORDER BY TxnDate DESC

-- Invoices by customer
SELECT * FROM Invoice 
WHERE CustomerRef = '123'

-- Bills due this week
SELECT * FROM Bill 
WHERE DueDate >= '2025-01-27' 
AND DueDate <= '2025-02-03'
```

---

## QuickBooks Desktop Integration

### Connection Method
QuickBooks Desktop requires the **Web Connector** - a Windows application that syncs with external services.

### Architecture
```
Ops-1 Agent
     ↓
SOAP Web Service (your server)
     ↓
QB Web Connector (Windows)
     ↓
QuickBooks Desktop File (.QBW)
```

### Web Connector Setup
```xml
<!-- QWC File - Give to user to install -->
<?xml version="1.0"?>
<QBWCXML>
    <AppName>Ops-1 QuickBooks Connector</AppName>
    <AppID></AppID>
    <AppURL>https://your-server.com/qb-soap</AppURL>
    <AppDescription>Ops-1 Report Generator</AppDescription>
    <AppSupport>https://ops1.ai/support</AppSupport>
    <UserName>ops1user</UserName>
    <OwnerID>{YOUR-GUID-HERE}</OwnerID>
    <FileID>{YOUR-FILE-GUID}</FileID>
    <QBType>QBFS</QBType>
    <Scheduler>
        <RunEveryNMinutes>30</RunEveryNMinutes>
    </Scheduler>
</QBWCXML>
```

### QBXML Request Examples

#### Get All Customers
```xml
<?xml version="1.0" encoding="utf-8"?>
<?qbxml version="13.0"?>
<QBXML>
    <QBXMLMsgsRq onError="stopOnError">
        <CustomerQueryRq>
            <MaxReturned>100</MaxReturned>
            <ActiveStatus>ActiveOnly</ActiveStatus>
        </CustomerQueryRq>
    </QBXMLMsgsRq>
</QBXML>
```

#### Get Unpaid Invoices
```xml
<?xml version="1.0" encoding="utf-8"?>
<?qbxml version="13.0"?>
<QBXML>
    <QBXMLMsgsRq onError="stopOnError">
        <InvoiceQueryRq>
            <PaidStatus>NotPaidOnly</PaidStatus>
            <ModifiedDateRangeFilter>
                <FromModifiedDate>2025-01-01</FromModifiedDate>
            </ModifiedDateRangeFilter>
        </InvoiceQueryRq>
    </QBXMLMsgsRq>
</QBXML>
```

#### Get P&L Report
```xml
<?xml version="1.0" encoding="utf-8"?>
<?qbxml version="13.0"?>
<QBXML>
    <QBXMLMsgsRq onError="stopOnError">
        <GeneralSummaryReportQueryRq>
            <GeneralSummaryReportType>ProfitAndLossStandard</GeneralSummaryReportType>
            <ReportPeriod>
                <FromReportDate>2025-01-01</FromReportDate>
                <ToReportDate>2025-12-31</ToReportDate>
            </ReportPeriod>
        </GeneralSummaryReportQueryRq>
    </QBXMLMsgsRq>
</QBXML>
```

#### Get Aged Receivables
```xml
<?xml version="1.0" encoding="utf-8"?>
<?qbxml version="13.0"?>
<QBXML>
    <QBXMLMsgsRq onError="stopOnError">
        <AgingReportQueryRq>
            <AgingReportType>APAgingDetail</AgingReportType>
            <ReportAsOfDate>2025-01-28</ReportAsOfDate>
        </AgingReportQueryRq>
    </QBXMLMsgsRq>
</QBXML>
```

---

## Natural Language Query Mapping

### User Query → API Action

| User Says | QuickBooks Action |
|-----------|-------------------|
| "Show unpaid invoices" | Invoice query with PaidStatus=NotPaidOnly |
| "Who owes me money?" | AgedReceivables report |
| "P&L for Q4" | ProfitAndLoss report with date range |
| "Cash flow this year" | CashFlow report |
| "List all customers" | Customer query |
| "Bills due this week" | Bill query with date filter |
| "How much did [customer] pay?" | Payment query filtered by customer |
| "Sales by customer" | CustomerSales report |
| "What do I owe vendors?" | AgedPayables report |
| "Bank account balance" | Account query type=Bank |

### Example Implementations

```python
# Natural language to QuickBooks Online API
def process_query(user_input: str, qb_client):
    
    if "unpaid invoices" in user_input.lower():
        # Get unpaid invoices
        query = "SELECT * FROM Invoice WHERE Balance > '0'"
        return qb_client.query(query)
    
    elif "aged receivables" in user_input.lower() or "who owes" in user_input.lower():
        # Get aged receivables report
        return qb_client.get_report(
            report_type="AgedReceivables",
            params={"aging_method": "Report_Date"}
        )
    
    elif "profit and loss" in user_input.lower() or "p&l" in user_input.lower():
        # Extract date range from query
        start_date, end_date = extract_dates(user_input)
        return qb_client.get_report(
            report_type="ProfitAndLoss",
            params={
                "start_date": start_date,
                "end_date": end_date
            }
        )
    
    elif "cash flow" in user_input.lower():
        start_date, end_date = extract_dates(user_input)
        return qb_client.get_report(
            report_type="CashFlow",
            params={
                "start_date": start_date,
                "end_date": end_date
            }
        )
```

---

## n8n Workflow Integration

### QuickBooks Online Node Setup
```json
{
  "nodes": [
    {
      "name": "QuickBooks OAuth",
      "type": "n8n-nodes-base.quickbooks",
      "credentials": {
        "quickBooksOAuth2Api": "quickbooks_credentials"
      },
      "parameters": {
        "operation": "getReport",
        "reportType": "ProfitAndLoss",
        "startDate": "={{ $json.start_date }}",
        "endDate": "={{ $json.end_date }}"
      }
    }
  ]
}
```

### Webhook to QuickBooks Flow
```
1. Webhook receives natural language query
2. Claude parses intent and extracts parameters
3. QuickBooks node executes appropriate API call
4. Results formatted and returned with audit receipt
```

---

## Error Handling

### Common Errors
```
401 - Token expired → Refresh using refresh_token
403 - Insufficient permissions → Check OAuth scopes
404 - Entity not found → Validate ID
429 - Rate limited → Wait and retry (500 calls/minute limit)
500 - QB server error → Retry with exponential backoff
```

### Rate Limits
- **QuickBooks Online**: 500 requests/minute per realm
- **Throttle**: Implement queue for batch operations

---

## Security Considerations

1. **Never store raw credentials** - Use encrypted vault
2. **Refresh tokens** expire in 100 days - implement auto-refresh
3. **PII in responses** - Customer names, addresses need scrubbing
4. **Audit logging** - Log all API calls for compliance
5. **Sandbox testing** - Always test in sandbox first

---

## Sample Reports Output

### Aged Receivables Format
```json
{
  "report_name": "AgedReceivables",
  "generated_at": "2025-01-28T12:00:00Z",
  "data": [
    {
      "customer": "Acme Corp",
      "current": 1500.00,
      "1_30_days": 2300.00,
      "31_60_days": 0,
      "61_90_days": 500.00,
      "over_90_days": 0,
      "total": 4300.00
    }
  ],
  "audit_receipt": "AR-2025-0128-QBO-001"
}
```

---

## Dependencies

```
# Python
pip install intuit-oauth quickbooks-python

# Node.js  
npm install intuit-oauth node-quickbooks

# n8n
# Built-in QuickBooks node available
```

---

## References
- QuickBooks API Docs: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/account
- OAuth Guide: https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization
- QBXML Reference: https://developer.intuit.com/app/developer/qbdesktop/docs/api-reference
- Web Connector: https://developer.intuit.com/app/developer/qbdesktop/docs/get-started
