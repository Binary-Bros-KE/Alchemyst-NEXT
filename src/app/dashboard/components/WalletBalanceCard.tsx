"use client"

import { useState } from "react"
import { AiOutlineWallet, AiOutlinePlus, AiOutlineReload } from "react-icons/ai"
import { motion } from "framer-motion"
import MpesaPayment from "./MpesaPayment"

interface UserData {
  id?: string
  wallet?: {
    balance: number
  }
  [key: string]: unknown
}

interface WalletBalanceCardProps {
  userData: UserData | null
  refreshBalance: () => Promise<void>
  balanceLoading: boolean
  updateUserData: (data: Partial<UserData>) => void
}

export default function WalletBalanceCard({ userData, refreshBalance, balanceLoading }: WalletBalanceCardProps) {
  const [showMpesaPopup, setShowMpesaPopup] = useState(false)
  const [customAmount, setCustomAmount] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const balance = userData?.wallet?.balance || 0

  const quickAmounts = [100, 200, 500, 1000]

  const handleAddFunds = (amount: number) => {
    setCustomAmount(amount.toString())
    setShowMpesaPopup(true)
  }

  const handleCustomAmount = () => {
    if (customAmount && Number.parseInt(customAmount) >= 100) {
      setShowMpesaPopup(true)
    }
  }

  const handlePaymentSuccess = async () => {
    await refreshBalance()
    setCustomAmount("")
    setShowCustomInput(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-1">Your Wallet Balance</h3>
            <p className="text-sm text-text-muted">Add funds to subscribe to packages</p>
          </div>
          <div className="flex items-center gap-2">
            <AiOutlineWallet className="text-primary text-3xl" />
            <button
              onClick={refreshBalance}
              disabled={balanceLoading}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh Balance"
            >
              <AiOutlineReload className={`text-primary text-xl ${balanceLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="bg-bg-secondary/50 rounded-xl p-6 mb-6 text-center">
          <p className="text-text-muted text-sm mb-2">Available Balance</p>
          {balanceLoading ? (
            <div className="flex justify-center items-center h-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <p className="text-4xl font-bold text-primary">KSh {balance.toLocaleString()}</p>
          )}
        </div>

        {!showCustomInput ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAddFunds(amount)}
                  className="px-4 py-3 bg-bg-secondary border border-border-light rounded-lg text-text-primary font-medium hover:border-primary hover:bg-primary/10 transition-all cursor-pointer"
                >
                  + KSh {amount.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full px-4 py-3 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <AiOutlinePlus />
              Custom Amount
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Enter Amount (Min: KSh 100)</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                min="100"
                className="w-full px-4 py-3 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCustomAmount}
                disabled={!customAmount || Number.parseInt(customAmount) < 100}
                className="flex-1 px-4 py-3 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Add Funds
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false)
                  setCustomAmount("")
                }}
                className="px-4 py-3 bg-bg-primary border border-border-light text-text-primary rounded-lg font-medium hover:bg-neutral-800 transition-all cursor-pointer hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {showMpesaPopup && (
        <MpesaPayment
          onClose={() => setShowMpesaPopup(false)}
          amount={Number.parseInt(customAmount)}
          onSuccess={handlePaymentSuccess}
          userId={userData?.id}
        />
      )}
    </>
  )
}
