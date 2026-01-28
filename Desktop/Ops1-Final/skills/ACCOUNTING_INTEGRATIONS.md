# Ops-1 Accounting Integrations

## Overview

Ops-1 supports direct integration with major accounting platforms. Users can query their financial data using natural language without knowing SQL or API details.

## Supported Platforms

| Platform | Type | Status |
|----------|------|--------|
| QuickBooks Online | Cloud | ✅ Supported |
| QuickBooks Desktop | Desktop | ✅ Supported |
| Sage Business Cloud | Cloud | ✅ Supported |
| Sage 50 (Peachtree) | Desktop | ✅ Supported |
| Sage Intacct | Enterprise | ✅ Supported |

---

## Quick Start

### 1. Connect Your Account

**QuickBooks Online:**
```
1. Go to Ops-1 Settings → Integrations
2. Click "Connect QuickBooks"
3. Sign in with your Intuit account
4. Authorize Ops-1 to read your data
```

**Sage Business Cloud:**
```
1. Go to Ops-1 Settings → Integrations
2. Click "Connect Sage"
3. Sign in with your Sage account
4. Select your business
5. Authorize Ops-1
```

**Desktop Versions:**
```
1. Download the Ops-1 Connector for Windows
2. Run the installer
3. Select QuickBooks Desktop or Sage 50
4. Enter your Ops-1 API key
5. Sync will run every 30 minutes
```

### 2. Start Querying

Once connected, just ask in plain English:

```
"Show me all unpaid invoices"
"Who owes me the most money?"
"P&L for last quarter"
"What bills are due this week?"
"Customer balance for Acme Corp"
```

---

## Supported Queries

### Invoices & Receivables
| Natural Language | What It Does |
|------------------|--------------|
| "Show unpaid invoices" | Lists all invoices with balance > 0 |
| "Overdue invoices" | Invoices past due date |
| "Invoices over 30 days" | AR aging > 30 days |
| "Who owes me money?" | Aged receivables summary |
| "Invoices for [customer]" | Filter by customer name |
| "How much does [customer] owe?" | Customer balance |

### Bills & Payables
| Natural Language | What It Does |
|------------------|--------------|
| "Show unpaid bills" | Lists bills with balance > 0 |
| "Bills due this week" | Filtered by due date |
| "What do I owe vendors?" | Aged payables summary |
| "Bills from [vendor]" | Filter by vendor name |

### Financial Reports
| Natural Language | What It Does |
|------------------|--------------|
| "Profit and loss" or "P&L" | Income statement |
| "P&L for Q4 2025" | With date range |
| "Balance sheet" | Assets, liabilities, equity |
| "Cash flow" | Cash flow statement |
| "Trial balance" | All account balances |

### Customers & Vendors
| Natural Language | What It Does |
|------------------|--------------|
| "List all customers" | Customer directory |
| "Customer balance for [name]" | Single customer balance |
| "Sales by customer" | Revenue per customer |
| "Top 10 customers" | Ranked by sales |
| "List vendors" | Vendor directory |

### Banking
| Natural Language | What It Does |
|------------------|--------------|
| "Bank balances" | All bank account balances |
| "Bank transactions this month" | Recent transactions |
| "Payments received" | Customer payments |

---

## Example Workflows

### Daily AR Check
```
User: "Show me overdue invoices over $1,000"

Ops-1 Response:
┌─────────────────────────────────────────────────────────────┐
│ OVERDUE INVOICES > $1,000                                   │
├─────────────┬──────────┬──────────┬─────────┬──────────────┤
│ Customer    │ Invoice  │ Amount   │ Due     │ Days Overdue │
├─────────────┼──────────┼──────────┼─────────┼──────────────┤
│ Acme Corp   │ INV-1042 │ $3,500   │ Jan 15  │ 13 days      │
│ Beta Inc    │ INV-1038 │ $2,200   │ Jan 10  │ 18 days      │
│ Gamma LLC   │ INV-1029 │ $5,100   │ Dec 28  │ 31 days      │
└─────────────┴──────────┴──────────┴─────────┴──────────────┘
Total Overdue: $10,800

✓ Audit Receipt: AR-2025-0128-001
```

### Monthly P&L
```
User: "P&L for January 2025"

Ops-1 Response:
┌─────────────────────────────────────────────────────────────┐
│ PROFIT & LOSS - January 2025                                │
├─────────────────────────────────────────────────────────────┤
│ INCOME                                                      │
│   Sales Revenue                          $45,230.00         │
│   Service Revenue                        $12,500.00         │
│   Other Income                              $350.00         │
│                                         ───────────         │
│   Total Income                           $58,080.00         │
├─────────────────────────────────────────────────────────────┤
│ EXPENSES                                                    │
│   Cost of Goods Sold                     $18,200.00         │
│   Payroll                                $15,000.00         │
│   Rent                                    $3,500.00         │
│   Utilities                                 $420.00         │
│   Software & Tools                        $1,200.00         │
│   Other Expenses                            $890.00         │
│                                         ───────────         │
│   Total Expenses                         $39,210.00         │
├─────────────────────────────────────────────────────────────┤
│ NET INCOME                               $18,870.00         │
└─────────────────────────────────────────────────────────────┘

✓ Source: QuickBooks Online
✓ Audit Receipt: AR-2025-0128-002
```

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         USER                                  │
│            "Show unpaid invoices over $500"                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                      OPS-1 AGENT                              │
│                                                              │
│  1. Parse natural language query                             │
│  2. Identify intent: "unpaid invoices"                       │
│  3. Extract filters: amount > $500                           │
│  4. Select data source: QuickBooks/Sage                      │
└──────────────────────────┬───────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌─────────────────────┐         ┌─────────────────────┐
│  QUICKBOOKS SKILL   │         │     SAGE SKILL      │
│                     │         │                     │
│  - OAuth auth       │         │  - OAuth auth       │
│  - API call         │         │  - API call         │
│  - Parse response   │         │  - Parse response   │
└─────────┬───────────┘         └─────────┬───────────┘
          │                                 │
          ▼                                 ▼
┌─────────────────────┐         ┌─────────────────────┐
│  QuickBooks API     │         │  Sage API           │
│  (Online/Desktop)   │         │  (Cloud/Desktop)    │
└─────────┬───────────┘         └─────────┬───────────┘
          │                                 │
          └────────────────┬────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   COMPLIANCE LAYER                            │
│                                                              │
│  ✓ PII Scan (names, SSN, banking info)                       │
│  ✓ Generate audit receipt                                    │
│  ✓ Log access                                                │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    FORMATTED RESPONSE                         │
│                                                              │
│  - Table/report format                                       │
│  - Audit receipt ID                                          │
│  - Source attribution                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Security & Compliance

### Data Protection
- **No data storage**: Ops-1 queries in real-time, doesn't store financial data
- **Encryption**: All API calls use TLS 1.3
- **Token security**: OAuth tokens encrypted at rest

### Audit Trail
Every query generates an audit receipt containing:
- Timestamp
- User ID
- Query text
- Data source
- Records accessed
- IP address

### Compliance Ready
- **PIPEDA** (Canada) ✓
- **CCPA** (California) ✓
- **SOC 2** architecture ✓
- **GDPR** (for EU data) ✓

---

## Troubleshooting

### "Connection expired"
Your OAuth token has expired. Go to Settings → Integrations and click "Reconnect".

### "No data returned"
- Check date range in your query
- Verify the account has data for that period
- Ensure you have permission to access that data

### "Rate limit exceeded"
Wait 1 minute and try again. Ops-1 queues requests to prevent this.

### Desktop version not syncing
- Ensure the Ops-1 Connector is running
- Check that QuickBooks/Sage is open
- Verify your firewall allows the connection

---

## API Reference

See detailed API documentation:
- [QuickBooks Skill](/skills/quickbooks/SKILL.md)
- [Sage Skill](/skills/sage/SKILL.md)

---

## Support

- **Email**: support@ops1.ai
- **Docs**: https://docs.ops1.ai
- **Status**: https://status.ops1.ai
