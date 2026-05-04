"use client"

import { useState } from "react"
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { IoCloseCircleOutline } from "react-icons/io5"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alchemyst-node-tjam.onrender.com"

interface EmailData {
  currentEmail: string
  newEmail: string
  password: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  showCurrentPassword: boolean
  showNewPassword: boolean
}

interface ValidationErrors {
  [key: string]: string
}

interface SettingsCardProps {
  userData: any
  updateUserData: (data: any) => void
}

export default function SettingsCard({ userData, updateUserData }: SettingsCardProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"email" | "password">("email")

  const [emailData, setEmailData] = useState<EmailData>({
    currentEmail: userData?.email || "",
    newEmail: "",
    password: "",
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
  })

  const [emailErrors, setEmailErrors] = useState<ValidationErrors>({})
  const [passwordErrors, setPasswordErrors] = useState<ValidationErrors>({})

  const validateEmail = () => {
    const errors: ValidationErrors = {}

    if (!emailData.newEmail) {
      errors.newEmail = "New email is required"
    } else if (!/\S+@\S+\.\S+/.test(emailData.newEmail)) {
      errors.newEmail = "Please enter a valid email address"
    } else if (emailData.newEmail === emailData.currentEmail) {
      errors.newEmail = "New email must be different from current email"
    }

    if (!emailData.password) {
      errors.password = "Current password is required to change email"
    }

    setEmailErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePassword = () => {
    const errors: ValidationErrors = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required"
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required"
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters long"
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = "New password must be different from current password"
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail()) return

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/change-email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          newEmail: emailData.newEmail.toLowerCase().trim(),
          password: emailData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to change email")
      }

      updateUserData({
        email: emailData.newEmail,
        verification: {
          ...userData.verification,
          isEmailVerified: false,
        },
      })

      setEmailData({
        currentEmail: emailData.newEmail,
        newEmail: "",
        password: "",
      })

      setEmailErrors({})

      toast.success("Email changed successfully! Please check your new email for verification.")
    } catch (error) {
      console.error("Email change error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to change email")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePassword()) return

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password")
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        showCurrentPassword: false,
        showNewPassword: false,
      })

      setPasswordErrors({})

      toast.success("Password changed successfully!")
    } catch (error) {
      console.error("Password change error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field: "showCurrentPassword" | "showNewPassword") => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-bg-secondary border border-border-light rounded-2xl p-6"
      id="settings"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-text-primary mb-1">Account Settings</h3>
          <p className="text-sm text-text-muted">Manage your email and password</p>
        </div>
        <div className="flex items-center gap-1">
          <FiMail className="text-primary text-2xl" />
          <FiLock className="text-primary text-2xl" />
        </div>
      </div>

      <div className="flex border-b border-border-light mb-6">
        <button
          onClick={() => setActiveTab("email")}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${
            activeTab === "email" ? "text-primary" : "text-text-muted hover:text-text-primary"
          }`}
        >
          Change Email
          {activeTab === "email" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${
            activeTab === "password" ? "text-primary" : "text-text-muted hover:text-text-primary"
          }`}
        >
          Change Password
          {activeTab === "password" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
        </button>
      </div>

      {activeTab === "email" && (
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Current Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={emailData.currentEmail}
                readOnly
                className="w-full px-4 py-3 bg-bg-primary border border-border-light rounded-lg text-text-primary cursor-not-allowed opacity-70"
              />
              {userData?.verification?.isEmailVerified ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-success text-sm">
                  <FiCheck size={16} />
                  <span>Verified</span>
                </div>
              ) : (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-red-400 text-sm">
                  <IoCloseCircleOutline size={16} />
                  <span>Not Verified</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">New Email Address</label>
            <input
              type="email"
              value={emailData.newEmail}
              onChange={(e) => setEmailData((prev) => ({ ...prev, newEmail: e.target.value }))}
              className={`w-full px-4 py-3 bg-bg-primary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                emailErrors.newEmail ? "border-error" : "border-border-light"
              }`}
              placeholder="Enter your new email address"
            />
            {emailErrors.newEmail && (
              <p className="text-error text-sm mt-1 flex items-center gap-1">
                <FiX size={14} />
                {emailErrors.newEmail}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Current Password</label>
            <input
              type="password"
              value={emailData.password}
              onChange={(e) => setEmailData((prev) => ({ ...prev, password: e.target.value }))}
              className={`w-full px-4 py-3 bg-bg-primary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                emailErrors.password ? "border-error" : "border-border-light"
              }`}
              placeholder="Enter your current password"
            />
            {emailErrors.password && (
              <p className="text-error text-sm mt-1 flex items-center gap-1">
                <FiX size={14} />
                {emailErrors.password}
              </p>
            )}
          </div>

          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
            <p className="text-warning font-semibold mb-1">Important</p>
            <p className="text-text-muted text-sm">
              After changing your email, you will need to verify your new email address. You will be logged out and
              will need to verify your new email before you can log in again.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Changing Email...
              </>
            ) : (
              <>
                <FiMail className="text-lg" />
                Change Email Address
              </>
            )}
          </button>
        </form>
      )}

      {activeTab === "password" && (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Current Password</label>
            <div className="relative">
              <input
                type={passwordData.showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className={`w-full px-4 py-3 bg-bg-primary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary pr-12 ${
                  passwordErrors.currentPassword ? "border-error" : "border-border-light"
                }`}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("showCurrentPassword")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {passwordData.showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-error text-sm mt-1 flex items-center gap-1">
                <FiX size={14} />
                {passwordErrors.currentPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">New Password</label>
            <div className="relative">
              <input
                type={passwordData.showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                className={`w-full px-4 py-3 bg-bg-primary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary pr-12 ${
                  passwordErrors.newPassword ? "border-error" : "border-border-light"
                }`}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("showNewPassword")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {passwordData.showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-error text-sm mt-1 flex items-center gap-1">
                <FiX size={14} />
                {passwordErrors.newPassword}
              </p>
            )}
            <p className="text-text-muted text-xs mt-1">Password must be at least 6 characters long</p>
          </div>

          {passwordData.newPassword && (
            <div className="bg-bg-primary border border-border-light rounded-lg p-3">
              <p className="text-sm font-medium text-text-primary mb-2">Password Strength</p>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 h-1 rounded-full ${
                      passwordData.newPassword.length >= level * 2
                        ? level <= 2
                          ? "bg-error"
                          : level === 3
                            ? "bg-warning"
                            : "bg-success"
                        : "bg-border-light"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-text-muted">
                {passwordData.newPassword.length < 6
                  ? "Too short"
                  : passwordData.newPassword.length < 8
                    ? "Weak"
                    : passwordData.newPassword.length < 12
                      ? "Good"
                      : "Strong"}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Changing Password...
              </>
            ) : (
              <>
                <FiLock className="text-lg" />
                Change Password
              </>
            )}
          </button>
        </form>
      )}
    </motion.div>
  )
}
