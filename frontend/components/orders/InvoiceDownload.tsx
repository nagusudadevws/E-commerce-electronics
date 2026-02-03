'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { OrderWithItems } from '@/types/database'

interface InvoiceDownloadProps {
  order: OrderWithItems
}

export default function InvoiceDownload({ order }: InvoiceDownloadProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      // Prepare order data for invoice generation
      const orderData = {
        order_number: order.order_number,
        created_at: order.created_at,
        status: order.status,
        total_amount: Number(order.total_amount),
        shipping_cost: Number(order.shipping_cost),
        items: order.items?.map(item => ({
          product_id: item.product_id,
          product_name: `Product #${item.product_id?.slice(0, 8) || 'N/A'}`,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          subtotal: Number(item.subtotal),
        })) || [],
      }

      const response = await fetch(`${apiUrl}/api/invoices/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate invoice')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice_${order.order_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Failed to download invoice. Please ensure the backend server is running.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      isLoading={downloading}
    >
      {downloading ? 'Generating...' : 'Download Invoice'}
    </Button>
  )
}



