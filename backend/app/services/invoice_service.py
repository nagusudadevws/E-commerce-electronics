from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from typing import Dict
import io
from datetime import datetime

class InvoiceService:
    @staticmethod
    def generate_invoice_pdf(order_data: Dict) -> bytes:
        """Generate a PDF invoice for an order"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        elements.append(Paragraph("INVOICE", title_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Order Information
        created_at = order_data.get('created_at', '')
        try:
            if isinstance(created_at, str):
                date_obj = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                formatted_date = date_obj.strftime('%B %d, %Y')
            else:
                formatted_date = str(created_at)
        except:
            formatted_date = str(created_at)
        
        order_info = [
            ['Order Number:', order_data.get('order_number', 'N/A')],
            ['Date:', formatted_date],
            ['Status:', order_data.get('status', 'N/A').upper()],
        ]
        
        order_table = Table(order_info, colWidths=[2*inch, 4*inch])
        order_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(order_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Order Items
        items_data = [['Product', 'Quantity', 'Unit Price', 'Subtotal']]
        for item in order_data.get('items', []):
            product_name = item.get('product_name', f"Product #{item.get('product_id', 'N/A')[:8] if item.get('product_id') else 'N/A'}")
            items_data.append([
                product_name,
                str(item.get('quantity', 0)),
                f"${float(item.get('unit_price', 0)):.2f}",
                f"${float(item.get('subtotal', 0)):.2f}"
            ])
        
        items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Total
        total_amount = float(order_data.get('total_amount', 0))
        shipping_cost = float(order_data.get('shipping_cost', 0))
        subtotal = total_amount - shipping_cost
        
        total_data = [
            ['Subtotal:', f"${subtotal:.2f}"],
            ['Shipping:', f"${shipping_cost:.2f}"],
            ['Total:', f"${total_amount:.2f}"],
        ]
        
        total_table = Table(total_data, colWidths=[4*inch, 2*inch])
        total_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (-1, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (-1, -1), (-1, -1), 12),
        ]))
        elements.append(total_table)
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.read()




