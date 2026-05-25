"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { AiOutlinePhone, AiOutlineWhatsApp } from "react-icons/ai"
import { FaTelegramPlane } from "react-icons/fa"
import { SiOnlyfans } from "react-icons/si"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alchemyst-node-tjam.onrender.com"

interface ContactFormData {
  phoneNumber: string
  hasWhatsApp: boolean
  prefersCall: boolean
  telegramLink: string
  onlyFansLink: string
  secondaryPhone: string
}

interface ContactDetailsCardProps {
  userData: any
  updateUserData: (data: any) => void
}

export default function ContactDetailsCard({ userData, updateUserData }: ContactDetailsCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isContactComplete, setIsContactComplete] = useState(false)

  const [formData, setFormData] = useState<ContactFormData>({
    phoneNumber: userData?.contact?.phoneNumber || "",
    hasWhatsApp: userData?.contact?.hasWhatsApp || false,
    prefersCall: userData?.contact?.prefersCall || false,
    telegramLink: userData?.contact?.telegramLink || "",
    onlyFansLink: userData?.contact?.onlyFansLink || "",
    secondaryPhone: userData?.contact?.secondaryPhone || "",
  })

  useEffect(() => {
    const requiredFields = ["phoneNumber"]
    const allFieldsFilled = requiredFields.every((field) => Boolean(userData?.contact?.[field]))
    setIsContactComplete(allFieldsFilled)

    setFormData({
      phoneNumber: userData?.contact?.phoneNumber || "",
      hasWhatsApp: userData?.contact?.hasWhatsApp || false,
      prefersCall: userData?.contact?.prefersCall || false,
      telegramLink: userData?.contact?.telegramLink || "",
      onlyFansLink: userData?.contact?.onlyFansLink || "",
      secondaryPhone: userData?.contact?.secondaryPhone || "",
    })
  }, [userData])

  const handleSave = async () => {
    if (!formData.phoneNumber.trim()) {
      toast.error("Phone number is required")
      return
    }

    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        phoneNumber: formData.phoneNumber,
        hasWhatsApp: formData.hasWhatsApp,
        prefersCall: formData.prefersCall,
        telegramLink: formData.telegramLink?.trim() || null,
      }

      if (userData?.userType === "spa") {
        payload.secondaryPhone = formData.secondaryPhone?.trim() || null
      }

      if (userData?.userType === "of-model") {
        payload.onlyFansLink = formData.onlyFansLink?.trim() || null
      }

      const response = await fetch(`${API_URL}/user/contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to update contact details")

      toast.success("Contact details updated successfully!")
      updateUserData({
        contact: {
          phoneNumber: data.data.phoneNumber,
          hasWhatsApp: data.data.hasWhatsApp,
          prefersCall: data.data.prefersCall,
          telegramLink: data.data.telegramLink,
          onlyFansLink: data.data.onlyFansLink,
          secondaryPhone: data.data.secondaryPhone,
        },
      })
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update contact details")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`bg-bg-secondary border ${isContactComplete ? "border-green-500" : "border-border-light"} rounded-2xl p-6`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary mb-1">Contact Details</h3>
          <p className="text-sm text-text-muted">How clients can reach you</p>
        </div>
        <AiOutlinePhone className="text-primary text-3xl" />
      </div>

      <div className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+254 700 000 000"
                className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={loading}
              />
              <p className="text-xs text-text-muted mt-1">
                This number will be displayed on your profile for clients to contact you
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasWhatsApp}
                  onChange={(e) => setFormData({ ...formData, hasWhatsApp: e.target.checked })}
                  className="w-5 h-5 rounded border-border-light text-primary focus:ring-primary focus:ring-offset-0"
                  disabled={loading}
                />
                <div className="flex items-center gap-2">
                  <AiOutlineWhatsApp className="text-xl text-primary" />
                  <span className="text-sm text-text-primary">Available on WhatsApp</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.prefersCall}
                  onChange={(e) => setFormData({ ...formData, prefersCall: e.target.checked })}
                  className="w-5 h-5 rounded border-border-light text-primary focus:ring-primary focus:ring-offset-0"
                  disabled={loading}
                />
                <div className="flex items-center gap-2">
                  <AiOutlinePhone className="text-xl text-primary" />
                  <span className="text-sm text-text-primary">Available for Calls</span>
                </div>
              </label>
            </div>

            {userData?.userType === "spa" && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Secondary Phone (optional)</label>
                <input
                  type="tel"
                  value={formData.secondaryPhone}
                  onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                  placeholder="+254 711 000 000"
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Telegram Link (optional)</label>
              <input
                type="url"
                value={formData.telegramLink}
                onChange={(e) => setFormData({ ...formData, telegramLink: e.target.value })}
                placeholder="https://t.me/yourusername"
                className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={loading}
              />
            </div>

            {userData?.userType === "of-model" && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">OnlyFans Link</label>
                <input
                  type="url"
                  value={formData.onlyFansLink}
                  onChange={(e) => setFormData({ ...formData, onlyFansLink: e.target.value })}
                  placeholder="https://onlyfans.com/yourprofile"
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={loading}
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    phoneNumber: userData?.contact?.phoneNumber || "",
                    hasWhatsApp: userData?.contact?.hasWhatsApp || false,
                    prefersCall: userData?.contact?.prefersCall || false,
                    telegramLink: userData?.contact?.telegramLink || "",
                    onlyFansLink: userData?.contact?.onlyFansLink || "",
                    secondaryPhone: userData?.contact?.secondaryPhone || "",
                  })
                }}
                disabled={loading}
                className="px-4 py-2.5 bg-bg-primary text-text-primary rounded-lg font-medium hover:bg-neutral-800 transition-all cursor-pointer hover:text-white"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AiOutlinePhone className="text-primary" />
                <span className="text-text-primary">{formData.phoneNumber || "Not set"}</span>
              </div>

              {formData.hasWhatsApp && (
                <div className="flex items-center gap-2">
                  <AiOutlineWhatsApp className="text-primary" />
                  <span className="text-text-secondary text-sm">WhatsApp available</span>
                </div>
              )}

              {formData.prefersCall && (
                <div className="flex items-center gap-2">
                  <AiOutlinePhone className="text-primary" />
                  <span className="text-text-secondary text-sm">Accepts Calls</span>
                </div>
              )}

              {formData.telegramLink && (
                <div className="flex items-center gap-2">
                  <FaTelegramPlane className="text-primary" />
                  <a
                    href={formData.telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Telegram
                  </a>
                </div>
              )}

              {userData?.userType === "of-model" && formData.onlyFansLink && (
                <div className="flex items-center gap-2">
                  <SiOnlyfans className="text-primary" />
                  <a
                    href={formData.onlyFansLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    OnlyFans
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full px-4 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all cursor-pointer"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}
