"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { AiOutlineIdcard, AiOutlineCheckCircle, AiOutlineWhatsApp } from "react-icons/ai"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alchemyst-node-tjam.onrender.com"

interface ProfileVerificationCardProps {
  userData: any
  updateUserData: (data: any) => void
}

export default function ProfileVerificationCard({ userData, updateUserData }: ProfileVerificationCardProps) {
  const [loading, setLoading] = useState(false)

  const handleRequestVerification = async () => {
    const hasPremiumPackage =
      userData?.currentPackage?.packageType === "premium" || userData?.currentPackage?.packageType === "elite"

    if (!hasPremiumPackage) {
      toast.error("Profile verification is only available for Premium and Elite package holders")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/verification/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to request verification")
      }

      updateUserData({
        verification: {
          ...userData.verification,
          verificationRequested: true,
          verificationRequestedAt: new Date(),
          verificationStatus: "pending",
        },
      })
      toast.success("Verification request submitted successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to request verification")
    } finally {
      setLoading(false)
    }
  }

  const hasPremiumPackage =
    userData?.currentPackage?.packageType === "premium" || userData?.currentPackage?.packageType === "elite"

  const verificationRequested = userData?.verification?.verificationRequested
  const profileVerified = userData?.verification?.profileVerified
  const verificationStatus = userData?.verification?.verificationStatus

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`bg-bg-secondary border rounded-2xl p-6 ${
        verificationStatus === "pending"
          ? "border-yellow-400"
          : profileVerified
            ? "border-green-400"
            : "border-border-light"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary mb-1">Profile Verification</h3>
          <p className="text-sm text-text-muted">Verify your identity to build trust</p>
        </div>
        <AiOutlineIdcard className="text-primary text-3xl" />
      </div>

      <div className="space-y-4">
        {profileVerified ? (
          <div className="bg-success/10 border border-success/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <AiOutlineCheckCircle className="text-success text-2xl" />
              <p className="text-success font-semibold">Your profile is verified!</p>
            </div>
            <p className="text-text-muted text-sm">
              Your profile has been verified by our team. This badge helps build trust with clients.
            </p>
            {userData.verification?.verifiedAt && (
              <p className="text-text-muted text-xs mt-2">
                Verified on: {new Date(userData.verification.verifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : verificationRequested || verificationStatus === "pending" ? (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <AiOutlineWhatsApp className="text-warning text-2xl" />
              <p className="text-warning font-semibold">
                {verificationStatus === "rejected" ? "Verification Rejected" : "Verification Pending"}
              </p>
            </div>
            <p className="text-text-muted text-sm">
              {verificationStatus === "rejected"
                ? "Your verification request was rejected. Please contact support for more information."
                : "We've received your verification request. Our team will contact you on WhatsApp soon to complete the verification process."}
            </p>
            {userData.verification?.verificationRequestedAt && (
              <p className="text-text-muted text-xs mt-2">
                Requested on: {new Date(userData.verification.verificationRequestedAt).toLocaleDateString()}
              </p>
            )}
            {verificationStatus === "rejected" && (
              <button
                onClick={handleRequestVerification}
                className="mt-3 px-4 py-2 bg-primary text-text-inverse rounded-lg text-sm font-medium hover:bg-primary-hover transition-all cursor-pointer"
              >
                Request Again
              </button>
            )}
          </div>
        ) : (
          <>
            {!hasPremiumPackage && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4">
                <p className="text-warning font-semibold mb-1">Premium Feature</p>
                <p className="text-text-muted text-sm">
                  Profile verification is only available for Premium and Elite package holders. Upgrade your package to
                  unlock this feature.
                </p>
              </div>
            )}

            <div className="bg-bg-primary border border-border-light rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AiOutlineWhatsApp className="text-primary text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">How Verification Works</h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Click &quot;Request Verification&quot; below to start the process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Our team will contact you via WhatsApp at your preferred time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>We&apos;ll verify that you&apos;re a real person through a quick video call</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Once verified, your profile will display a verified badge</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mt-3">
                <p className="text-xs text-text-secondary">
                  <span className="font-semibold text-primary">Why verify?</span> Verified profiles build trust with
                  clients and get more visibility on our platform.
                </p>
              </div>
            </div>
            <button
              onClick={handleRequestVerification}
              disabled={loading || !hasPremiumPackage}
              className="w-full px-4 py-3 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <AiOutlineCheckCircle className="text-xl" />
                  Request Verification
                </>
              )}
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}
