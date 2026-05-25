"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineMail } from "react-icons/ai"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alchemyst-node-tjam.onrender.com'

interface UserData {
  email?: string
  verification?: {
    isEmailVerified?: boolean
  }
  [key: string]: unknown
}

interface EmailVerificationCardProps {
  userData: UserData | null
  updateUserData: (data: Partial<UserData>) => void
}

export default function EmailVerificationCard({ userData, updateUserData }: EmailVerificationCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)

  useEffect(() => {
    const emailVerified = userData?.verification?.isEmailVerified
    setIsEmailVerified(!!emailVerified)
  }, [userData])

  const sendVerificationCode = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/send-verification-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email: userData?.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code")
      }

      toast.success("Verification code sent to your email!")
      setCodeSent(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ code: verificationCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify email")
      }

      toast.success("Email verified successfully!")
      updateUserData({
        verification: {
          isEmailVerified: true
        }
      })
      setShowModal(false)
      setVerificationCode("")
      setCodeSent(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-bg-secondary border ${isEmailVerified ? 'border-success/50' : 'border-border-light'} rounded-2xl p-6`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-1">Email Verification</h3>
            <p className="text-sm text-text-muted">Verify your email to activate your profile</p>
          </div>
          {isEmailVerified ? (
            <AiOutlineCheckCircle className="text-success text-3xl" />
          ) : (
            <AiOutlineCloseCircle className="text-error text-3xl" />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-text-secondary">
            <AiOutlineMail className="text-xl" />
            <span className="text-sm">{userData?.email}</span>
          </div>

          {isEmailVerified ? (
            <div className="bg-success/10 border border-success/30 rounded-lg p-3">
              <p className="text-success text-sm font-medium">Your email is verified!</p>
            </div>
          ) : (
            <>
              <div className="bg-error/10 border border-error/30 rounded-lg p-3">
                <p className="text-error text-sm font-medium">Email not verified</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full px-4 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all cursor-pointer"
              >
                Verify Email
              </button>
            </>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-bg-secondary border border-border-light rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-text-primary mb-4">Verify Your Email</h3>

              {!codeSent ? (
                <>
                  <p className="text-text-secondary mb-6">
                    Click the button below to send a verification code to {userData?.email}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={sendVerificationCode}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Code"
                      )}
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                      className="px-4 py-2.5 bg-bg-primary text-text-primary rounded-lg font-medium hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-text-secondary mb-4">Enter the verification code sent to your email</p>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full px-4 py-3 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
                    disabled={loading}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={verifyEmail}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Confirm"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false)
                        setCodeSent(false)
                        setVerificationCode("")
                      }}
                      disabled={loading}
                      className="px-4 py-2.5 bg-bg-primary text-text-primary rounded-lg font-medium hover:bg-neutral-800 transition-all cursor-pointer hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
