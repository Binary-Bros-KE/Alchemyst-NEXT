"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import toast from "react-hot-toast"
import {
  AiOutlineCalendar,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineCrown,
  AiOutlineDollarCircle,
  AiOutlineFire,
  AiOutlineReload,
  AiOutlineRocket,
  AiOutlineWarning,
} from "react-icons/ai"
import { IoWalletOutline } from "react-icons/io5"
import { PACKAGE_TIERS } from "@/data/packages"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alchemyst-node-tjam.onrender.com"

type DurationType = "weekly" | "monthly"
type ActionType = "subscribe" | "renew" | "upgrade"

interface DashboardPackage {
  id: string
  name: string
  weeklyPrice: number
  icon: any
  features: string[]
  priority: number
  popular?: boolean
}

interface PackageCardProps {
  userData: any
  updateUserData: (data: any) => void
}

export default function PackageCard({ userData, updateUserData }: PackageCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<DashboardPackage | null>(null)
  const [durationType, setDurationType] = useState<DurationType>("weekly")
  const [loading, setLoading] = useState(false)
  const [actionType, setActionType] = useState<ActionType>("subscribe")
  const [showAutoRenewModal, setShowAutoRenewModal] = useState(false)
  const [autoRenewDuration, setAutoRenewDuration] = useState<DurationType>("weekly")

  const userType = typeof userData?.userType === "string" ? userData.userType : "escort"
  const userPackages =
    userType in PACKAGE_TIERS
      ? PACKAGE_TIERS[userType as keyof typeof PACKAGE_TIERS]
      : PACKAGE_TIERS.escort
  const userPackagesMap = userPackages as unknown as Record<string, DashboardPackage>
  const walletBalance = userData?.wallet?.balance || 0
  const currentPackage = userData?.currentPackage

  const calculateRemainingDays = (expiryDate?: string) => {
    if (!expiryDate) return 0
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const isActive = currentPackage?.status === "active" && calculateRemainingDays(currentPackage?.expiryDate) > 0
  const needsRenewal = isActive && calculateRemainingDays(currentPackage?.expiryDate) <= 3
  const isExpired = currentPackage?.status === "expired" || userData?.packageHistory?.length !== 0
  const isCancelled = currentPackage?.status === "cancelled"

  const currentPackageDetails = currentPackage ? userPackagesMap[currentPackage.packageType] : null

  const calculatePrice = (weeklyPrice: number) => {
    if (durationType === "weekly") return weeklyPrice
    return Math.round(weeklyPrice * 4 * 0.875)
  }

  const calculateDays = () => (durationType === "weekly" ? 7 : 30)

  const canUpgrade = (pkg: DashboardPackage) => {
    if (!currentPackage || !isActive) return false
    const packagePriority: Record<string, number> = { basic: 1, premium: 2, elite: 3 }
    return packagePriority[pkg.id] > packagePriority[currentPackage.packageType]
  }

  const handleAction = (pkg: DashboardPackage, action: ActionType) => {
    const price = calculatePrice(pkg.weeklyPrice)

    if (walletBalance < price) {
      const shortfall = price - walletBalance
      toast.error(`Insufficient balance! You need KSh ${shortfall.toLocaleString()} more.`)
      return
    }

    setSelectedPackage(pkg)
    setActionType(action)
    setShowModal(true)
  }

  const confirmAction = async () => {
    if (!selectedPackage) return

    setLoading(true)
    try {
      const totalCost = calculatePrice(selectedPackage.weeklyPrice)

      let endpoint = "/user/subscribe"
      const body: Record<string, unknown> = {
        packageType: selectedPackage.id,
        durationType,
        totalCost,
        weeklyPrice: selectedPackage.weeklyPrice,
      }

      if (actionType === "upgrade") {
        endpoint = "/user/upgrade"
      } else if (actionType === "renew") {
        endpoint = "/user/renew"
        delete body.packageType
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Action failed")
      }

      const actionMessages: Record<ActionType, string> = {
        subscribe: `Subscription successful! ${calculateDays()} days added.`,
        renew: `Package renewed successfully! ${calculateDays()} days added.`,
        upgrade: `Upgrade successful! You now have the ${selectedPackage.name} package.`,
      }

      toast.success(actionMessages[actionType])

      updateUserData({
        currentPackage: data.data.currentPackage,
        wallet: { balance: data.data.newBalance },
      })

      setShowModal(false)
      setSelectedPackage(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed")
    } finally {
      setLoading(false)
    }
  }

  const handleAutoRenew = async (enabled: boolean) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/auto-renew`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          enabled,
          durationType: enabled ? autoRenewDuration : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update auto-renew")
      }

      toast.success(enabled ? "Auto-renew enabled" : "Auto-renew disabled")
      updateUserData({ currentPackage: data.data.currentPackage })
      setShowAutoRenewModal(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update auto-renew")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelPackage = async () => {
    if (!window.confirm("Are you sure you want to cancel? Your package will remain active until expiry.")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel package")
      }

      toast.success("Package cancelled successfully")
      updateUserData({ currentPackage: data.data.currentPackage })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel package")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className={`bg-bg-secondary border ${isActive ? "border-green-600/50" : "border-border-light"} rounded-2xl p-6`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-1">Subscription Package</h3>
            <p className="text-sm text-text-muted">Manage your profile visibility</p>
          </div>
          <AiOutlineCrown className="text-primary text-3xl" />
        </div>

        {isActive && currentPackageDetails ? (
          <div className="space-y-4">
            <div
              className={`border rounded-xl p-4 ${
                needsRenewal
                  ? "bg-warning/10 border-warning/30"
                  : isCancelled
                    ? "bg-error/10 border-error/30"
                    : "bg-success/10 border-success/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {currentPackageDetails.icon && <currentPackageDetails.icon className="text-primary text-2xl" />}
                  <div>
                    <h4 className="font-bold text-text-primary">{currentPackageDetails.name}</h4>
                    <p className="text-xs text-text-muted capitalize">{currentPackage.durationType} plan</p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isCancelled
                      ? "bg-error/20 text-error"
                      : needsRenewal
                        ? "bg-warning/20 text-warning"
                        : "bg-success/20 text-success"
                  }`}
                >
                  {isCancelled ? "CANCELLED" : needsRenewal ? "EXPIRING SOON" : "ACTIVE"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-bg-primary/50 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-text-muted text-xs mb-1">
                    <AiOutlineCalendar />
                    Days Remaining
                  </div>
                  <div className="text-xl font-bold text-primary">{calculateRemainingDays(currentPackage.expiryDate)}</div>
                </div>
                <div className="bg-bg-primary/50 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-text-muted text-xs mb-1">
                    <AiOutlineDollarCircle />
                    Total Spent
                  </div>
                  <div className="text-sm font-bold text-text-primary">KSh {currentPackage.totalCost?.toLocaleString() || 0}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-md font-bold text-gray-500">
                <span>
                  Expires On: &nbsp;
                  <span className="text-primary">{new Date(currentPackage.expiryDate).toLocaleDateString()}</span>
                </span>
                <div className="flex items-center gap-1">
                  {currentPackage.autoRenew ? (
                    <>
                      <AiOutlineCheckCircle className="text-success" />
                      <span className="text-success">Auto-renew is ON</span>
                    </>
                  ) : (
                    <>
                      <AiOutlineCloseCircle className="text-red-600" />
                      <span className="text-red-600">Auto-renew is OFF</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              {!isCancelled && (
                <button
                  onClick={() => setShowAutoRenewModal(true)}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 hover:text-white cursor-pointer ${
                    currentPackage.autoRenew
                      ? "bg-success/20 text-success border border-success/30"
                      : "bg-bg-primary text-text-primary border border-border-light hover:bg-neutral-800"
                  }`}
                >
                  <AiOutlineReload />
                  Auto-Renew
                </button>
              )}

              {needsRenewal && !isCancelled && (
                <button
                  onClick={() => handleAction(currentPackageDetails, "renew")}
                  className="px-4 py-2.5 bg-warning text-text-inverse rounded-lg font-medium hover:bg-warning/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AiOutlineReload />
                  Renew Now
                </button>
              )}

              {currentPackage.packageType !== "elite" && !isCancelled && (
                <button
                  onClick={() => {
                    const nextPackage = Object.values(userPackagesMap).find((pkg) => canUpgrade(pkg))
                    if (nextPackage) handleAction(nextPackage, "upgrade")
                  }}
                  className="px-4 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AiOutlineRocket />
                  Upgrade
                </button>
              )}

              {!isCancelled && (
                <button
                  onClick={handleCancelPackage}
                  disabled={loading}
                  className="px-4 py-2.5 bg-error/20 text-error border border-error/30 rounded-lg font-medium hover:bg-error/30 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="bg-bg-primary rounded-lg p-4">
              <h5 className="text-sm font-semibold text-text-primary mb-2">Your Benefits</h5>
              <ul className="space-y-1.5">
                {currentPackageDetails.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="text-primary mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AiOutlineWarning className="text-error text-xl" />
                <p className="text-error text-sm font-medium">Profile is Inactive - {isExpired ? "Expired!" : "Not Subscribed"}</p>
              </div>
              <p className="text-text-muted text-xs">
                {isExpired
                  ? "Your package has expired. Subscribe to reactivate your profile."
                  : "Your profile is not showing on the feed. Subscribe to a package to activate it."}
              </p>
            </div>

            {userData?.currentPackage?.status === "expired" && userData?.currentPackage?.autoRenew && (
              <div>
                <p className="flex gap-2 items-center text-error text-sm font-medium bg-error/10 border border-error/30 rounded-lg p-4 mb-4">
                  <IoWalletOutline />
                  Balance insufficient to renew package
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setActionType("subscribe")
                setShowModal(true)
              }}
              className="w-full px-4 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <AiOutlineFire />
              Choose Package
            </button>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-bg-secondary border border-border-light rounded-2xl p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                {actionType === "subscribe"
                  ? "Choose Your Package"
                  : actionType === "renew"
                    ? "Renew Your Package"
                    : "Upgrade Your Package"}
              </h3>
              <p className="text-text-muted mb-4">
                Wallet balance: <span className="text-primary font-bold">KSh {walletBalance.toLocaleString()}</span>
              </p>

              <div className="flex items-center justify-center gap-2 mb-6 bg-bg-primary rounded-lg p-1">
                <button
                  onClick={() => setDurationType("weekly")}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                    durationType === "weekly" ? "bg-primary text-text-inverse" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Weekly (7 days)
                </button>
                <button
                  onClick={() => setDurationType("monthly")}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                    durationType === "monthly"
                      ? "bg-primary text-text-inverse"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Monthly (30 days)
                  <span className="ml-1 text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">Save 12.5%</span>
                </button>
              </div>

              {actionType === "renew" && currentPackageDetails ? (
                <div className="mb-6">
                  <div
                    onClick={() => setSelectedPackage(currentPackageDetails)}
                    className={`bg-bg-primary border-2 rounded-xl p-6 transition-all cursor-pointer hover:scale-105 ${
                      selectedPackage?.id === currentPackageDetails.id ? "border-primary" : "border-border-light"
                    }`}
                  >
                    <div className="text-center">
                      <currentPackageDetails.icon className="text-primary text-4xl mx-auto mb-2" />
                      <h4 className="text-xl font-bold text-text-primary mb-1">Renew {currentPackageDetails.name}</h4>
                      <div className="text-3xl font-bold text-primary mb-1">
                        KSh {calculatePrice(currentPackageDetails.weeklyPrice).toLocaleString()}
                      </div>
                      <p className="text-text-muted text-sm">{durationType === "weekly" ? "for 7 days" : "for 30 days"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {Object.values(userPackagesMap)
                    .filter((pkg) => actionType !== "upgrade" || canUpgrade(pkg))
                    .map((pkg) => {
                      const Icon = pkg.icon
                      const price = calculatePrice(pkg.weeklyPrice)
                      const canAfford = walletBalance >= price
                      const shortfall = price - walletBalance

                      return (
                        <div
                          key={pkg.id}
                          className={`relative bg-bg-primary border-2 rounded-xl p-6 transition-all ${
                            canAfford ? "cursor-pointer hover:scale-105" : "opacity-60"
                          } ${selectedPackage?.id === pkg.id ? "border-primary" : "border-border-light"}`}
                          onClick={() => canAfford && setSelectedPackage(pkg)}
                        >
                          {pkg.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-text-inverse px-3 py-1 rounded-full text-xs font-bold">
                              POPULAR
                            </div>
                          )}

                          {!canAfford && (
                            <div className="absolute -top-3 right-4 bg-error text-text-inverse px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <AiOutlineWarning />
                              Insufficient
                            </div>
                          )}

                          <div className="text-center mb-4">
                            <Icon className="text-primary text-4xl mx-auto mb-2" />
                            <h4 className="text-xl font-bold text-text-primary mb-1">{pkg.name}</h4>
                            <div className="text-3xl font-bold text-primary mb-1">KSh {price.toLocaleString()}</div>
                            <p className="text-text-muted text-sm">{durationType === "weekly" ? "per week" : "per month"}</p>
                            {!canAfford && <p className="text-error text-xs mt-2">Need KSh {shortfall.toLocaleString()} more</p>}
                          </div>

                          <ul className="space-y-2">
                            {pkg.features.map((feature: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                                <span className="text-primary mt-0.5">✓</span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                </div>
              )}

              {selectedPackage && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-text-primary">
                        {actionType === "subscribe" ? "New Subscription" : actionType === "renew" ? "Renewal" : "Upgrade"}
                      </h4>
                      <p className="text-xs text-text-muted mt-1">
                        {selectedPackage.name} - {durationType} - {calculateDays()} days
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-text-muted">Total Cost</div>
                      <div className="text-2xl font-bold text-primary">KSh {calculatePrice(selectedPackage.weeklyPrice).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={confirmAction}
                  disabled={
                    !selectedPackage ||
                    loading ||
                    (selectedPackage && walletBalance < calculatePrice(selectedPackage.weeklyPrice))
                  }
                  className="flex-1 px-4 py-3 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Confirm ${actionType === "subscribe" ? "Subscription" : actionType === "renew" ? "Renewal" : "Upgrade"}${
                      selectedPackage ? ` - KSh ${calculatePrice(selectedPackage.weeklyPrice).toLocaleString()}` : ""
                    }`
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedPackage(null)
                  }}
                  disabled={loading}
                  className="px-4 py-3 bg-bg-primary text-text-primary rounded-lg font-medium hover:bg-neutral-800 transition-all cursor-pointer hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAutoRenewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-bg-secondary border border-border-light rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-text-primary mb-4">
                {currentPackage?.autoRenew ? "Disable Auto-Renew" : "Enable Auto-Renew"}
              </h3>

              {!currentPackage?.autoRenew ? (
                <>
                  <p className="text-text-muted text-sm mb-4">
                    Your package will automatically renew before expiry. Choose renewal duration:
                  </p>

                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setAutoRenewDuration("weekly")}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                        autoRenewDuration === "weekly"
                          ? "bg-primary text-text-inverse"
                          : "bg-bg-primary text-text-secondary border border-border-light"
                      }`}
                    >
                      Weekly
                      <div className="text-xs mt-1">7 days</div>
                    </button>
                    <button
                      onClick={() => setAutoRenewDuration("monthly")}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                        autoRenewDuration === "monthly"
                          ? "bg-primary text-text-inverse"
                          : "bg-bg-primary text-text-secondary border border-border-light"
                      }`}
                    >
                      Monthly
                      <div className="text-xs mt-1">30 days</div>
                    </button>
                  </div>

                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-text-muted">
                      <strong>Note:</strong> Ensure sufficient wallet balance before expiry. Auto-renew will fail if balance is
                      insufficient.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-text-muted text-sm mb-6">
                  Are you sure you want to disable auto-renew? Your package will expire on{" "}
                  {new Date(currentPackage.expiryDate).toLocaleDateString()}.
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleAutoRenew(!currentPackage?.autoRenew)}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    currentPackage?.autoRenew
                      ? "bg-error text-text-inverse hover:bg-error/80"
                      : "bg-success text-text-inverse hover:bg-success/80"
                  }`}
                >
                  {loading ? "Processing..." : currentPackage?.autoRenew ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => setShowAutoRenewModal(false)}
                  disabled={loading}
                  className="px-4 py-3 bg-bg-primary text-text-primary rounded-lg font-medium hover:bg-neutral-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
