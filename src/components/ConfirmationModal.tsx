"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AiOutlineClose, AiOutlineInfoCircle, AiOutlineWarning } from "react-icons/ai"

type ConfirmationSeverity = "casual" | "danger" | "permanent"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  message: string
  severity?: ConfirmationSeverity
  title?: string
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  message,
  severity = "casual",
  title,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const isDangerous = severity === "danger" || severity === "permanent"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-bg-secondary border border-border-light rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {isDangerous ? (
                    <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                      <AiOutlineWarning className="text-2xl text-error" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <AiOutlineInfoCircle className="text-2xl text-primary" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-text-primary">{title || (isDangerous ? "Confirm Action" : "Are you sure?")}</h3>
                </div>
                <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                  <AiOutlineClose className="text-xl" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-text-secondary leading-relaxed">{message}</p>
                {isDangerous && (
                  <div className="mt-4 bg-error/10 border border-error/30 rounded-lg p-3">
                    <p className="text-sm text-error font-medium">
                      This action cannot be undone. Please confirm you want to proceed.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-bg-primary border border-border-light text-text-primary rounded-lg font-medium hover:bg-bg-primary/80 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                    isDangerous ? "bg-error text-white hover:bg-error/80" : "bg-primary text-text-inverse hover:bg-primary-hover"
                  }`}
                >
                  {isDangerous ? "Delete" : "Confirm"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
