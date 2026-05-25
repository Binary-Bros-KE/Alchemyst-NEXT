"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AiOutlineClose, AiOutlineLoading3Quarters, AiOutlineCheckCircle } from "react-icons/ai"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alchemyst-node-tjam.onrender.com'
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'wss://alchemyst-node-tjam.onrender.com'

const PENDING_PAYMENT_KEY = "pendingMpesaPayment"
const PAYMENT_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes

interface PaymentData {
  phone?: string
  amount: number
  transactionId?: string
  checkoutRequestId?: string
  timestamp?: number
}

interface MpesaPaymentProps {
  onClose: () => void
  amount: number
  onSuccess: (data?: PaymentData) => void
  userId?: string
}

interface WebSocketMessage {
  status: string
  message?: string
  data?: {
    transactionId?: string
    TransactionID?: string
  }
}

export default function MpesaPayment({ onClose, amount, onSuccess }: MpesaPaymentProps) {
  const [phone, setPhone] = useState("")
  const [checkoutRequestId, setCheckoutRequestId] = useState("")
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [status, setStatus] = useState(false)
  const [error, setError] = useState("")
  const [showStkSuccess, setShowStkSuccess] = useState(false)

  useEffect(() => {
    checkPendingPayment()
  }, [])

  const checkPendingPayment = async () => {
    try {
      const pendingPaymentStr = localStorage.getItem(PENDING_PAYMENT_KEY)
      if (!pendingPaymentStr) return

      const pendingPayment: PaymentData = JSON.parse(pendingPaymentStr)
      const now = Date.now()

      if (pendingPayment.timestamp && now - pendingPayment.timestamp > PAYMENT_EXPIRY_MS) {
        localStorage.removeItem(PENDING_PAYMENT_KEY)
        return
      }

      console.log("[v0] Found pending payment, retrying balance update...")
      await updateBalanceInDB(pendingPayment)
    } catch (error) {
      console.error("[v0] Error checking pending payment:", error)
    }
  }

  const updateBalanceInDB = async (paymentData: PaymentData) => {
    try {
      const response = await fetch(`${API_URL}/mpesa/update-balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          transactionId: paymentData.transactionId,
          checkoutRequestId: paymentData.checkoutRequestId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Balance updated successfully:", data)
        localStorage.removeItem(PENDING_PAYMENT_KEY)
        return data
      } else {
        throw new Error("Failed to update balance")
      }
    } catch (error) {
      console.error("[v0] Error updating balance in DB:", error)
      throw error
    }
  }

  const storePendingPayment = (paymentData: PaymentData) => {
    const pendingPayment = {
      ...paymentData,
      timestamp: Date.now(),
    }
    localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(pendingPayment))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/mpesa/stk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ phone, amount }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowStkSuccess(true)
        setLoading(false)
        setCheckoutRequestId(data.CheckoutRequestID)
        setError("Do not click resend immediately. Give it a couple of seconds")

        if (!data.CheckoutRequestID) {
          throw new Error("Missing CheckoutRequestID in response")
        }

        const ws = new WebSocket(SOCKET_URL)

        ws.onopen = () => {
          console.log("[v0] WebSocket connected")
          ws.send(JSON.stringify({ action: "register", checkoutRequestId: data.CheckoutRequestID }))
        }

        ws.onmessage = (event) => {
          const result: WebSocketMessage = JSON.parse(event.data)
          console.log("[v0] WebSocket message received:", result)
          handleWebSocketResponse(result, ws)
        }

        ws.onerror = (error) => {
          console.error("[v0] WebSocket error:", error)
        }

        ws.onclose = () => {
          console.log("[v0] WebSocket connection closed")
        }
      } else {
        throw new Error(data.message || "Failed to initiate payment")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  const handleWebSocketResponse = async (result: WebSocketMessage, ws: WebSocket) => {
    if (result.status === "success") {
      setStatus(true)
      toast.success("Payment Successful!")

      const paymentData: PaymentData = {
        amount,
        transactionId: result.data?.transactionId || result.data?.TransactionID,
        checkoutRequestId: checkoutRequestId,
        phone,
      }

      storePendingPayment(paymentData)

      try {
        await updateBalanceInDB(paymentData)
        localStorage.removeItem(PENDING_PAYMENT_KEY)

        setTimeout(() => {
          onSuccess(paymentData)
          onClose()
        }, 2000)
      } catch (error) {
        console.error("[v0] Failed to update balance in DB:", error)
        toast.error("Payment received but balance update failed. Will retry automatically.")

        setTimeout(() => {
          onClose()
        }, 3000)
      } finally {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }
    } else {
      toast.error(result.message || "Payment failed")
      setError(result.message || "Payment failed")
    }
  }

  const handleCheckPaymentStatus = async () => {
    if (!checkoutRequestId) {
      setError("Missing CheckoutRequestID. Please Initiate STK Again.")
      return
    }
    setPaymentLoading(true)

    try {
      const response = await fetch(`${API_URL}/mpesa/paymentStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ CheckoutRequestId: checkoutRequestId }),
      })

      const data = await response.json()
      setPaymentLoading(false)

      if (response.ok) {
        if (data.ResultCode === "0") {
          setStatus(true)
          toast.success("Payment Successful!")

          const paymentData: PaymentData = {
            phone,
            amount,
            transactionId: data.TransactionID,
            checkoutRequestId: checkoutRequestId,
          }

          storePendingPayment(paymentData)

          try {
            await updateBalanceInDB(paymentData)
            localStorage.removeItem(PENDING_PAYMENT_KEY)

            setTimeout(() => {
              onSuccess(paymentData)
              onClose()
            }, 2000)
          } catch (error) {
            console.error("[v0] Failed to update balance in DB:", error)
            toast.error("Payment received but balance update failed. Will retry automatically.")

            setTimeout(() => {
              onClose()
            }, 3000)
          }
        } else if (data.ResultCode === "2001") {
          setError("The initiator information was invalid. Please check your PIN and try again")
        } else if (data.ResultCode === "1037") {
          setError("DS Timeout. Please initiate again and respond Quicker")
        } else {
          setError(data.ResultDesc || "Failed to check payment status")
        }
      } else {
        setError(data.message || "Failed to check payment status")
      }
    } catch (err) {
      setPaymentLoading(false)
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-bg-secondary border border-border-light rounded-2xl p-6 max-w-md w-full relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <AiOutlineClose className="text-2xl" />
          </button>

          <h2 className="text-2xl font-bold text-text-primary mb-6">LIPA NA M-PESA</h2>

          {!status ? (
            <>
              {!showStkSuccess ? (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-6 text-center">
                  <img src="/payment/mpesa-circular.png" alt="M-Pesa" className="w-20 h-20 mx-auto mb-4 rounded-full" />
                  <p className="text-text-secondary mb-2">Amount to Pay:</p>
                  <p className="text-3xl font-bold text-primary">KSh {amount.toLocaleString()}</p>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <img src="/payment/loading-colors.gif" className="h-20" alt="Loading" />
                  </div>
                  <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
                    <AiOutlineCheckCircle className="text-success text-4xl mx-auto mb-2" />
                    <p className="text-text-primary font-medium">
                      An STK has been sent to your phone. Please Enter your PIN to complete the payment
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!showStkSuccess && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">M-Pesa Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07XX... or 01XX..."
                      pattern="^0[17][0-9]{8}$"
                      title="Please enter a valid Safaricom number starting with 07 or 01"
                      required
                      className="w-full px-4 py-3 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    `${!showStkSuccess ? "Pay Now" : "Resend STK"}`
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 bg-error/10 border border-error/30 rounded-lg p-3">
                  <p className="text-error text-center text-sm">{error}</p>
                </div>
              )}

              {showStkSuccess && (
                <button
                  onClick={handleCheckPaymentStatus}
                  disabled={paymentLoading}
                  className="w-full mt-4 px-4 py-3 bg-bg-primary border border-border-light text-text-primary rounded-lg font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer hover:text-white"
                >
                  {paymentLoading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    "Check Payment Status"
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }}>
                <AiOutlineCheckCircle className="text-success text-6xl mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-success mb-2">Payment Successful!</h3>
              <p className="text-text-secondary">Your wallet has been updated</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
