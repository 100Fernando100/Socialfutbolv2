# Ops-1 | AI Accounting Automation Platform

> Complete AI-powered accounting automation system by Multicomm.ai

## 🏗️ Project Structure

```
Ops1-Final/
├── src/                          # Next.js Frontend
│   ├── app/                      # App router pages
│   │   ├── dashboard/            # Main dashboard
│   │   │   ├── tasks/            # Task management
│   │   │   ├── audit/            # Audit receipts
│   │   │   ├── configuration/    # Rules config
│   │   │   └── settings/         # User settings
│   │   └── login/                # Authentication
│   ├── components/               # React components
│   │   └── layout/               # Sidebar, Header
│   └── lib/                      # Utilities
│       ├── api.ts                # API client
│       ├── auth.ts               # Authentication
│       ├── types.ts              # TypeScript types
│       └── utils.ts              # Helpers
│
├── n8n-workflows/                # n8n Workflow JSONs (14 total)
│   ├── execution-workflow-FIXED.json
│   ├── configuration-workflow-FIXED.json
│   ├── compliance-workflow-FIXED.json
│   ├── receipt-capture-workflow.json
│   ├── receptionist-router-workflow.json
│   ├── calendar-agent-workflow.json
│   ├── powerbi-agent-workflow.json
│   ├── report-generator-workflow.json
│   └── ops1-accounting-workflow.json
│
├── skills/                       # AI Agent Skills
│   ├── orchestrator/             # Master brain
│   ├── receipt-capture/          # OCR processing
│   ├── quickbooks/               # QuickBooks API
│   ├── sage/                     # Sage API
│   ├── compliance-auditor/       # Policy validation
│   ├── powerbi-agent/            # Dashboards
│   ├── word-pdf-reports/         # Document generation
│   ├── calendar-integration/     # Calendly
│   └── receptionist-router/      # Voice + routing
│
├── config/
│   └── company_policies.yaml     # Compliance rules
│
└── docs/
    ├── README-workflows.md
    ├── README-v2.1.md
    └── IMPLEMENTATION-GUIDE.md
```

## 🚀 Quick Start

### Frontend (Next.js)

```bash
cd Ops1-Final
npm install
npm run dev
```

Open http://localhost:3000

### n8n Workflows

1. Open n8n
2. Import workflows from `n8n-workflows/`
3. Configure credentials (see `.env.example`)
4. Activate workflows

## 📊 Features

| Feature | Description |
|---------|-------------|
| Receipt Capture | OCR with auto-categorization |
| QuickBooks/Sage | Full API integration |
| Compliance Auditor | Policy validation, PII detection |
| Power BI | Dashboard generation |
| Reports | PDF/Word document creation |
| Calendar | Calendly scheduling |
| Voice AI | Bilingual EN/ES support |

## 💰 Pricing Model

| Plan | Price | Features |
|------|-------|----------|
| Starter | $299/mo | Receipt, QB/Sage, 1 user |
| Professional | $499/mo | + Reports, Power BI, 5 users |
| Enterprise | $999/mo | + Voice, Multi-company, Unlimited |

## 🔒 Security

- SOC 2 compliant architecture
- PII detection and masking
- Full audit trail
- Role-based access control

## 📞 Support

**Multicomm.ai**
- Website: multicomm.ai
- Target: CPAs, Bookkeepers, SMBs
- Markets: USA, Canada (bilingual EN/ES)

---

Built with ❤️ by Fernando @ Multicomm.ai
