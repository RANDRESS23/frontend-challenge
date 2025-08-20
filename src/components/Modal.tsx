import React from 'react'
import './Modal.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal = ({ open, onClose, children }: ModalProps) => {
  if (!open) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export default Modal
