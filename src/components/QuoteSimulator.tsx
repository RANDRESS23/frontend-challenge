import React, { useState } from 'react'
import Modal from './Modal'
import { useCart } from '../context/CartContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import './QuoteSimulator.css'
import { Product } from '../types/Product'

interface CompanyData {
  companyName: string
  contactName: string
  email: string
  phone: string
  rut: string
  address: string
}

const initialCompanyData: CompanyData = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  rut: '',
  address: ''
}

const QuoteSimulator = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { items } = useCart()
  const [company, setCompany] = useState<CompanyData>(initialCompanyData)
  const [showPreview, setShowPreview] = useState(false)

  // Validación: todos los campos requeridos
  const isFormValid = Object.values(company).every(v => v.trim() !== '')

  const subtotal = items.reduce((sum, i) => sum + i.product.basePrice * i.quantity, 0)
  const discount = 0 // Aquí podrías calcular descuentos según reglas
  const total = subtotal - discount

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompany({ ...company, [e.target.name]: e.target.value })
  }

  const handlePreview = () => {
    if (!isFormValid) return
    setShowPreview(true)
  }

  const onCloseModal = () => {
    setCompany(initialCompanyData)
    onClose()
  }

  // Calculate best pricing for quantity
  const calculatePrice = (product: Product, qty: number) => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return product.basePrice * qty
    }

    // Sort from highest to lowest minQty
    const sortedBreaks = [...product.priceBreaks].sort((a, b) => b.minQty - a.minQty)

    // Find the best applicable break price
    const applicable = sortedBreaks.find(pb => qty >= pb.minQty) || { price: product.basePrice }

    return applicable.price * qty
  }

  // Calculate discount amount
  const getDiscount = (product: Product, qty: number) => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return 0
    }

    const baseTotal = product.basePrice * qty
    const discountedTotal = calculatePrice(product, qty)
    
    // Calculate savings percentage
    return ((baseTotal - discountedTotal) / baseTotal) * 100
  }

  // Format price display
  const formatPrice = (price: number) => {
      return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleDownload = () => {
    if (!isFormValid) return
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Cotización', 14, 18)
    doc.setFontSize(12)
    doc.text(`Empresa: ${company.companyName}`, 14, 30)
    doc.text(`Contacto: ${company.contactName}`, 14, 38)
    doc.text(`Email: ${company.email}`, 14, 46)
    doc.text(`Teléfono: ${company.phone}`, 14, 54)
    doc.text(`RUT: ${company.rut}`, 14, 62)
    doc.text(`Dirección: ${company.address}`, 14, 70)
    autoTable(doc, {
      startY: 80,
      head: [['Producto', 'Cantidad', 'Precio unitario', '% descuento', 'Subtotal']],
      body: items.map(i => {
        const discountPercent = getDiscount(i.product, i.quantity)
        return [i.product.name, i.quantity, `${formatPrice(i.product.basePrice)}`, `${discountPercent.toFixed(1)}%`, `${formatPrice(i.product.basePrice * i.quantity)}`]
      })
    })
    // @ts-ignore
    const finalY = (doc as any).lastAutoTable?.finalY || 80
    doc.text(`Subtotal: ${formatPrice(subtotal)}`, 14, finalY + 10)
    doc.text(`Total: ${formatPrice(total)}`, 14, finalY + 18)
    doc.save('cotizacion.pdf')
  }

  return (
    <Modal open={open} onClose={onCloseModal}>
      <div className="quote-simulator-modal">
        <div className="modal-title-sticky">
          <h2 className="modal-title">Simulador de Cotización</h2>
          <button className="modal-close sticky-close" onClick={onCloseModal}>&times;</button>
        </div>
        <form className="company-form" onSubmit={e => e.preventDefault()}>
          <input name="companyName" value={company.companyName} onChange={handleChange} placeholder="Nombre empresa" required />
          <input name="contactName" value={company.contactName} onChange={handleChange} placeholder="Nombre contacto" required />
          <input name="email" value={company.email} onChange={handleChange} placeholder="Email" type="email" required />
          <input name="phone" value={company.phone} onChange={handleChange} placeholder="Teléfono" required />
          <input name="rut" value={company.rut} onChange={handleChange} placeholder="RUT" required />
          <input name="address" value={company.address} onChange={handleChange} placeholder="Dirección" required />
        </form>
        <div className="quote-summary">
          <h3>Resumen</h3>
          <table className="quote-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>% descuento</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => {
                const discountPercent = getDiscount(i.product, i.quantity)

                return (
                  <tr key={i.product.id}>
                    <td>{i.product.name}</td>
                    <td>{i.quantity}</td>
                    <td>{formatPrice(i.product.basePrice)}</td>
                    <td>${discountPercent.toFixed(1)}%</td>
                    <td>{formatPrice(i.product.basePrice * i.quantity)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="quote-totals">
            <div>Subtotal: <b>{formatPrice(subtotal)}</b></div>
            <div>Total: <b>{formatPrice(total)}</b></div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={handlePreview} type="button" disabled={!isFormValid}>Previsualizar cotización</button>
          <button className="btn btn-primary" onClick={handleDownload} type="button" disabled={!isFormValid}>Descargar PDF</button>
        </div>
        {showPreview && (
          <div className="quote-preview-modal">
            <h3>Previsualización</h3>
            <div className="quote-preview-receipt">
              <div className="receipt-header">
                <div className="receipt-title">Cotización</div>
                <div className="receipt-company">{company.companyName}</div>
                <div className="receipt-contact">{company.contactName} - {company.email}</div>
              </div>
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Unitario</th>
                    <th>% descuento</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(i => {
                    const discountPercent = getDiscount(i.product, i.quantity)

                    return (
                      <tr key={i.product.id}>
                        <td>{i.product.name}</td>
                        <td>{i.quantity}</td>
                        <td>{formatPrice(i.product.basePrice)}</td>
                        <td>${discountPercent.toFixed(1)}%</td>
                        <td>{formatPrice(i.product.basePrice * i.quantity)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="receipt-totals">
                <div>Subtotal: <b>{formatPrice(subtotal)}</b></div>
                <div>Total: <b>{formatPrice(total)}</b></div>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => setShowPreview(false)}>Cerrar previsualización</button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default QuoteSimulator
