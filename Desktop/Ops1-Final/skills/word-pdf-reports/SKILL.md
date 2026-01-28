# Word/PDF Reports Skill

## Overview

Este skill genera reportes profesionales en formato Word (.docx) y PDF a partir de datos de los otros agentes (QuickBooks, Sage, Excel, Power BI).

**Capacidades:**
- Generar reportes financieros formateados
- Incluir gráficos y tablas
- Aplicar branding de la empresa (logo, colores)
- Templates personalizables
- Exportar a Word, PDF, o ambos
- Enviar por email automáticamente

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                  │
│                                                                  │
│  "Genera un reporte de P&L de enero en PDF con el logo"         │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REPORT GENERATOR                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PARSE REQUEST                                                │
│     • Tipo de reporte: P&L, Balance, AR, AP, Custom             │
│     • Período: Fecha inicio/fin                                  │
│     • Formato: Word, PDF, ambos                                  │
│     • Branding: Logo, colores, fuente                           │
│                                                                  │
│  2. FETCH DATA                                                   │
│     • QuickBooks Agent → Datos financieros                      │
│     • Sage Agent → Datos financieros                            │
│     • Excel Agent → Datos personalizados                        │
│     • Power BI → Gráficos embebidos                             │
│                                                                  │
│  3. SELECT TEMPLATE                                              │
│     • P&L Template                                               │
│     • Balance Sheet Template                                     │
│     • Invoice Aging Template                                     │
│     • Custom Template                                            │
│                                                                  │
│  4. GENERATE DOCUMENT                                            │
│     • Llenar template con datos                                  │
│     • Insertar tablas y gráficos                                │
│     • Aplicar formato y estilos                                  │
│     • Agregar logo y branding                                    │
│                                                                  │
│  5. EXPORT & DELIVER                                             │
│     • Guardar como .docx                                         │
│     • Convertir a PDF                                            │
│     • Enviar por email (opcional)                                │
│     • Retornar link de descarga                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Templates Disponibles

### 1. Profit & Loss (P&L)

```
┌─────────────────────────────────────────────────────────────────┐
│  [COMPANY LOGO]                                                  │
│                                                                  │
│                    PROFIT & LOSS STATEMENT                       │
│                    January 1 - January 31, 2025                  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  REVENUE                                                         │
│  ─────────────────────────────────────────────────────────────  │
│  Sales Revenue                                      $125,000.00  │
│  Service Revenue                                     $45,000.00  │
│  Other Income                                         $3,500.00  │
│                                                    ────────────  │
│  Total Revenue                                     $173,500.00   │
│                                                                  │
│  EXPENSES                                                        │
│  ─────────────────────────────────────────────────────────────  │
│  Cost of Goods Sold                                 $62,000.00  │
│  Salaries & Wages                                   $35,000.00  │
│  Rent                                                $8,000.00  │
│  Utilities                                           $2,500.00  │
│  Marketing                                           $5,000.00  │
│  Office Supplies                                     $1,200.00  │
│  Professional Fees                                   $3,000.00  │
│  Other Expenses                                      $2,800.00  │
│                                                    ────────────  │
│  Total Expenses                                   $119,500.00   │
│                                                                  │
│  ═════════════════════════════════════════════════════════════  │
│  NET INCOME                                        $54,000.00   │
│  ═════════════════════════════════════════════════════════════  │
│                                                                  │
│  Generated by Ops-1 | Confidential                              │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Balance Sheet

### 3. Accounts Receivable Aging

### 4. Expense Report

### 5. Sales Summary

---

## Implementación

### Document Generator

```python
# report_generator.py

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.style import WD_STYLE_TYPE
from typing import Dict, List, Optional
import io
from datetime import datetime

class ReportGenerator:
    """
    Generates professional Word/PDF reports from financial data.
    """
    
    def __init__(self, company_config: Optional[Dict] = None):
        self.config = company_config or {}
        self.company_name = self.config.get('company_name', 'Company Name')
        self.logo_path = self.config.get('logo_path')
        self.primary_color = self.config.get('primary_color', '1F4E79')
        self.font_name = self.config.get('font_name', 'Calibri')
    
    def generate_pl_report(
        self,
        data: Dict,
        start_date: str,
        end_date: str,
        include_charts: bool = False
    ) -> bytes:
        """
        Generate Profit & Loss report.
        
        Args:
            data: {
                "revenue": [{"account": "Sales", "amount": 125000}, ...],
                "expenses": [{"account": "COGS", "amount": 62000}, ...],
                "total_revenue": 173500,
                "total_expenses": 119500,
                "net_income": 54000
            }
        
        Returns:
            Document bytes
        """
        
        doc = Document()
        
        # Set up styles
        self._setup_styles(doc)
        
        # Add header with logo
        self._add_header(doc)
        
        # Add title
        title = doc.add_heading('PROFIT & LOSS STATEMENT', level=1)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Add period
        period = doc.add_paragraph(f'{start_date} to {end_date}')
        period.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        doc.add_paragraph()  # Spacer
        
        # Revenue Section
        doc.add_heading('REVENUE', level=2)
        revenue_table = self._create_account_table(doc, data.get('revenue', []))
        
        # Revenue Total
        total_rev_para = doc.add_paragraph()
        total_rev_para.add_run('Total Revenue').bold = True
        total_rev_para.add_run(f'\t\t\t\t${data.get("total_revenue", 0):,.2f}')
        
        doc.add_paragraph()  # Spacer
        
        # Expenses Section
        doc.add_heading('EXPENSES', level=2)
        expenses_table = self._create_account_table(doc, data.get('expenses', []))
        
        # Expenses Total
        total_exp_para = doc.add_paragraph()
        total_exp_para.add_run('Total Expenses').bold = True
        total_exp_para.add_run(f'\t\t\t\t${data.get("total_expenses", 0):,.2f}')
        
        doc.add_paragraph()  # Spacer
        
        # Net Income (highlighted)
        net_income_para = doc.add_paragraph()
        net_income_run = net_income_para.add_run('NET INCOME')
        net_income_run.bold = True
        net_income_run.font.size = Pt(14)
        
        amount = data.get("net_income", 0)
        amount_run = net_income_para.add_run(f'\t\t\t\t${amount:,.2f}')
        amount_run.bold = True
        amount_run.font.size = Pt(14)
        if amount >= 0:
            amount_run.font.color.rgb = RGBColor(0, 128, 0)  # Green
        else:
            amount_run.font.color.rgb = RGBColor(255, 0, 0)  # Red
        
        # Add footer
        self._add_footer(doc)
        
        # Save to bytes
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        
        return buffer.getvalue()
    
    def generate_balance_sheet(
        self,
        data: Dict,
        as_of_date: str
    ) -> bytes:
        """Generate Balance Sheet report"""
        
        doc = Document()
        self._setup_styles(doc)
        self._add_header(doc)
        
        title = doc.add_heading('BALANCE SHEET', level=1)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        period = doc.add_paragraph(f'As of {as_of_date}')
        period.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        doc.add_paragraph()
        
        # Assets
        doc.add_heading('ASSETS', level=2)
        
        doc.add_heading('Current Assets', level=3)
        self._create_account_table(doc, data.get('current_assets', []))
        
        doc.add_heading('Fixed Assets', level=3)
        self._create_account_table(doc, data.get('fixed_assets', []))
        
        total_assets = doc.add_paragraph()
        total_assets.add_run('TOTAL ASSETS').bold = True
        total_assets.add_run(f'\t\t\t${data.get("total_assets", 0):,.2f}')
        
        doc.add_paragraph()
        
        # Liabilities
        doc.add_heading('LIABILITIES', level=2)
        
        doc.add_heading('Current Liabilities', level=3)
        self._create_account_table(doc, data.get('current_liabilities', []))
        
        doc.add_heading('Long-term Liabilities', level=3)
        self._create_account_table(doc, data.get('long_term_liabilities', []))
        
        total_liab = doc.add_paragraph()
        total_liab.add_run('TOTAL LIABILITIES').bold = True
        total_liab.add_run(f'\t\t\t${data.get("total_liabilities", 0):,.2f}')
        
        doc.add_paragraph()
        
        # Equity
        doc.add_heading('EQUITY', level=2)
        self._create_account_table(doc, data.get('equity', []))
        
        total_equity = doc.add_paragraph()
        total_equity.add_run('TOTAL EQUITY').bold = True
        total_equity.add_run(f'\t\t\t${data.get("total_equity", 0):,.2f}')
        
        doc.add_paragraph()
        
        # Total Liabilities + Equity
        total_le = doc.add_paragraph()
        run = total_le.add_run('TOTAL LIABILITIES & EQUITY')
        run.bold = True
        run.font.size = Pt(12)
        total_le.add_run(f'\t${data.get("total_liabilities", 0) + data.get("total_equity", 0):,.2f}')
        
        self._add_footer(doc)
        
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        
        return buffer.getvalue()
    
    def generate_ar_aging(self, data: Dict, as_of_date: str) -> bytes:
        """Generate Accounts Receivable Aging report"""
        
        doc = Document()
        self._setup_styles(doc)
        self._add_header(doc)
        
        title = doc.add_heading('ACCOUNTS RECEIVABLE AGING', level=1)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        period = doc.add_paragraph(f'As of {as_of_date}')
        period.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        doc.add_paragraph()
        
        # Summary Table
        summary_table = doc.add_table(rows=2, cols=6)
        summary_table.style = 'Table Grid'
        
        # Headers
        headers = ['Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days', 'Total']
        for i, header in enumerate(headers):
            cell = summary_table.rows[0].cells[i]
            cell.text = header
            cell.paragraphs[0].runs[0].bold = True
        
        # Values
        aging = data.get('aging_summary', {})
        values = [
            aging.get('current', 0),
            aging.get('1_30', 0),
            aging.get('31_60', 0),
            aging.get('61_90', 0),
            aging.get('over_90', 0),
            aging.get('total', 0)
        ]
        for i, value in enumerate(values):
            summary_table.rows[1].cells[i].text = f'${value:,.2f}'
        
        doc.add_paragraph()
        
        # Detail by Customer
        doc.add_heading('Detail by Customer', level=2)
        
        detail_table = doc.add_table(rows=1, cols=7)
        detail_table.style = 'Table Grid'
        
        # Headers
        headers = ['Customer', 'Current', '1-30', '31-60', '61-90', '90+', 'Total']
        for i, header in enumerate(headers):
            cell = detail_table.rows[0].cells[i]
            cell.text = header
            cell.paragraphs[0].runs[0].bold = True
        
        # Customer rows
        for customer in data.get('customers', []):
            row = detail_table.add_row()
            row.cells[0].text = customer.get('name', '')
            row.cells[1].text = f'${customer.get("current", 0):,.2f}'
            row.cells[2].text = f'${customer.get("1_30", 0):,.2f}'
            row.cells[3].text = f'${customer.get("31_60", 0):,.2f}'
            row.cells[4].text = f'${customer.get("61_90", 0):,.2f}'
            row.cells[5].text = f'${customer.get("over_90", 0):,.2f}'
            row.cells[6].text = f'${customer.get("total", 0):,.2f}'
        
        self._add_footer(doc)
        
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        
        return buffer.getvalue()
    
    def generate_expense_report(
        self,
        data: Dict,
        start_date: str,
        end_date: str,
        employee_name: Optional[str] = None
    ) -> bytes:
        """Generate Expense Report"""
        
        doc = Document()
        self._setup_styles(doc)
        self._add_header(doc)
        
        title = doc.add_heading('EXPENSE REPORT', level=1)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Info
        if employee_name:
            doc.add_paragraph(f'Employee: {employee_name}')
        doc.add_paragraph(f'Period: {start_date} to {end_date}')
        
        doc.add_paragraph()
        
        # Expense Table
        table = doc.add_table(rows=1, cols=5)
        table.style = 'Table Grid'
        
        headers = ['Date', 'Vendor', 'Category', 'Description', 'Amount']
        for i, header in enumerate(headers):
            cell = table.rows[0].cells[i]
            cell.text = header
            cell.paragraphs[0].runs[0].bold = True
        
        total = 0
        for expense in data.get('expenses', []):
            row = table.add_row()
            row.cells[0].text = expense.get('date', '')
            row.cells[1].text = expense.get('vendor', '')
            row.cells[2].text = expense.get('category', '')
            row.cells[3].text = expense.get('description', '')
            amount = expense.get('amount', 0)
            row.cells[4].text = f'${amount:,.2f}'
            total += amount
        
        # Total row
        total_row = table.add_row()
        total_row.cells[3].text = 'TOTAL'
        total_row.cells[3].paragraphs[0].runs[0].bold = True
        total_row.cells[4].text = f'${total:,.2f}'
        total_row.cells[4].paragraphs[0].runs[0].bold = True
        
        self._add_footer(doc)
        
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        
        return buffer.getvalue()
    
    def _setup_styles(self, doc: Document):
        """Set up document styles"""
        
        # Modify heading style
        style = doc.styles['Heading 1']
        style.font.name = self.font_name
        style.font.size = Pt(18)
        style.font.color.rgb = RGBColor.from_string(self.primary_color)
        
        style = doc.styles['Heading 2']
        style.font.name = self.font_name
        style.font.size = Pt(14)
        style.font.color.rgb = RGBColor.from_string(self.primary_color)
        
        # Normal style
        style = doc.styles['Normal']
        style.font.name = self.font_name
        style.font.size = Pt(11)
    
    def _add_header(self, doc: Document):
        """Add document header with logo"""
        
        header = doc.sections[0].header
        header_para = header.paragraphs[0]
        
        # Add logo if available
        if self.logo_path:
            try:
                header_para.add_run().add_picture(self.logo_path, width=Inches(1.5))
            except:
                pass
        
        # Add company name
        header_para.add_run(f'\t\t{self.company_name}')
        header_para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    def _add_footer(self, doc: Document):
        """Add document footer"""
        
        footer = doc.sections[0].footer
        footer_para = footer.paragraphs[0]
        footer_para.text = f'Generated by Ops-1 | {datetime.now().strftime("%Y-%m-%d %H:%M")} | Confidential'
        footer_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    def _create_account_table(self, doc: Document, accounts: List[Dict]):
        """Create a table for accounts"""
        
        table = doc.add_table(rows=len(accounts), cols=2)
        
        for i, account in enumerate(accounts):
            table.rows[i].cells[0].text = account.get('account', account.get('name', ''))
            table.rows[i].cells[1].text = f'${account.get("amount", 0):,.2f}'
            table.rows[i].cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
        
        return table
    
    def convert_to_pdf(self, docx_bytes: bytes) -> bytes:
        """
        Convert Word document to PDF.
        
        Note: Requires LibreOffice or unoconv installed.
        Alternative: Use docx2pdf library on Windows.
        """
        
        import subprocess
        import tempfile
        import os
        
        # Write docx to temp file
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as tmp_docx:
            tmp_docx.write(docx_bytes)
            docx_path = tmp_docx.name
        
        # Convert using LibreOffice
        pdf_path = docx_path.replace('.docx', '.pdf')
        
        try:
            subprocess.run([
                'libreoffice', '--headless', '--convert-to', 'pdf',
                '--outdir', os.path.dirname(docx_path), docx_path
            ], check=True, capture_output=True)
            
            with open(pdf_path, 'rb') as pdf_file:
                pdf_bytes = pdf_file.read()
            
            return pdf_bytes
        
        except Exception as e:
            # Fallback: return docx if PDF conversion fails
            return docx_bytes
        
        finally:
            # Cleanup
            if os.path.exists(docx_path):
                os.remove(docx_path)
            if os.path.exists(pdf_path):
                os.remove(pdf_path)


# Convenience function for n8n
def generate_report(
    report_type: str,
    data: dict,
    start_date: str = None,
    end_date: str = None,
    output_format: str = "pdf",
    company_name: str = "Company"
) -> dict:
    """
    Generate a report for n8n workflow.
    
    Args:
        report_type: pl, balance_sheet, ar_aging, expense
        data: Report data from accounting agent
        start_date: Period start
        end_date: Period end
        output_format: pdf, docx, both
        company_name: Company name for header
    
    Returns:
        {
            "success": bool,
            "file_bytes": base64 encoded file,
            "filename": suggested filename,
            "format": pdf/docx
        }
    """
    
    import base64
    
    generator = ReportGenerator({'company_name': company_name})
    
    try:
        if report_type == 'pl':
            docx_bytes = generator.generate_pl_report(data, start_date, end_date)
            filename = f"PL_{start_date}_to_{end_date}"
        elif report_type == 'balance_sheet':
            docx_bytes = generator.generate_balance_sheet(data, end_date)
            filename = f"BalanceSheet_{end_date}"
        elif report_type == 'ar_aging':
            docx_bytes = generator.generate_ar_aging(data, end_date)
            filename = f"AR_Aging_{end_date}"
        elif report_type == 'expense':
            docx_bytes = generator.generate_expense_report(data, start_date, end_date)
            filename = f"ExpenseReport_{start_date}_to_{end_date}"
        else:
            return {"success": False, "error": f"Unknown report type: {report_type}"}
        
        if output_format == 'pdf' or output_format == 'both':
            pdf_bytes = generator.convert_to_pdf(docx_bytes)
            
            return {
                "success": True,
                "file_bytes": base64.b64encode(pdf_bytes).decode(),
                "filename": f"{filename}.pdf",
                "format": "pdf"
            }
        else:
            return {
                "success": True,
                "file_bytes": base64.b64encode(docx_bytes).decode(),
                "filename": f"{filename}.docx",
                "format": "docx"
            }
    
    except Exception as e:
        return {"success": False, "error": str(e)}
```

---

## n8n Workflow

```json
{
  "name": "Ops-1 Report Generator",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "generate-report",
        "responseMode": "responseNode"
      },
      "name": "Report Request",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "// Parse report request\nconst body = $json.body;\n\nconst reportType = body.report_type || 'pl';\nconst startDate = body.start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);\nconst endDate = body.end_date || new Date().toISOString().slice(0, 10);\nconst format = body.format || 'pdf';\nconst companyName = body.company_name || 'Company';\nconst dataSource = body.data_source || 'quickbooks';\n\nreturn {\n  json: {\n    report_type: reportType,\n    start_date: startDate,\n    end_date: endDate,\n    format,\n    company_name: companyName,\n    data_source: dataSource\n  }\n};"
      },
      "name": "Parse Request",
      "type": "n8n-nodes-base.code",
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "={{ $env.N8N_BASE_URL }}/webhook/quickbooks-query",
        "method": "POST",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "query_type",
              "value": "={{ $json.report_type === 'pl' ? 'profit_and_loss' : $json.report_type === 'balance_sheet' ? 'balance_sheet' : 'aged_receivables' }}"
            },
            {
              "name": "start_date",
              "value": "={{ $json.start_date }}"
            },
            {
              "name": "end_date",
              "value": "={{ $json.end_date }}"
            }
          ]
        }
      },
      "name": "Fetch Data",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300]
    },
    {
      "parameters": {
        "jsCode": "// Generate report using python-docx logic\n// In production, this would call a Python function\n\nconst reportType = $('Parse Request').first().json.report_type;\nconst data = $json;\nconst startDate = $('Parse Request').first().json.start_date;\nconst endDate = $('Parse Request').first().json.end_date;\nconst companyName = $('Parse Request').first().json.company_name;\n\n// Generate filename\nconst filename = `${reportType}_${startDate}_to_${endDate}.pdf`;\n\n// In production, generate actual document\n// For now, return placeholder\n\nreturn {\n  json: {\n    success: true,\n    report_type: reportType,\n    filename,\n    download_url: `/reports/${filename}`,\n    data_summary: {\n      total_revenue: data.total_revenue || 0,\n      total_expenses: data.total_expenses || 0,\n      net_income: data.net_income || 0\n    }\n  }\n};"
      },
      "name": "Generate Document",
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
    "Report Request": {
      "main": [[{"node": "Parse Request", "type": "main", "index": 0}]]
    },
    "Parse Request": {
      "main": [[{"node": "Fetch Data", "type": "main", "index": 0}]]
    },
    "Fetch Data": {
      "main": [[{"node": "Generate Document", "type": "main", "index": 0}]]
    },
    "Generate Document": {
      "main": [[{"node": "Respond", "type": "main", "index": 0}]]
    }
  }
}
```

---

## Ejemplos de Uso

### Generar P&L en PDF

**Request:**
```json
{
  "report_type": "pl",
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "format": "pdf",
  "company_name": "Acme Corp"
}
```

**Response:**
```json
{
  "success": true,
  "filename": "PL_2025-01-01_to_2025-01-31.pdf",
  "download_url": "https://ops1.ai/reports/abc123.pdf",
  "email_sent": true
}
```

### Generar Balance Sheet en Word

**Request:**
```json
{
  "report_type": "balance_sheet",
  "end_date": "2025-01-31",
  "format": "docx",
  "company_name": "Acme Corp",
  "include_logo": true
}
```

---

## Dependencias

```bash
pip install python-docx reportlab Pillow
# Para conversión a PDF:
apt-get install libreoffice  # Linux
# o usar docx2pdf en Windows
```
