"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi"
import { motion } from "framer-motion"
import EmailVerificationCard from "./components/EmailVerificationCard"
import ProfileVerificationCard from "./components/ProfileVerificationCard"
import PersonalInfoCard from "./components/PersonalInfoCard"
import ServicesCard from "./components/ServicesCard"
import ContactDetailsCard from "./components/ContactDetailsCard"
import PhotoGalleryCard from "./components/PhotoGalleryCard"
import PackageCard from "./components/PackageCard"
import LocationCard from "./components/LocationCard"
import WalletBalanceCard from "./components/WalletBalanceCard"
import SettingsCard from "./components/SettingsCard"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alchemyst-node-tjam.onrender.com'

interface Verification {
  isEmailVerified?: boolean
  isProfileVerified?: boolean
}

interface CurrentPackage {
  packageType?: string
  status?: string
  expiryDate?: string
  durationType?: string
  totalCost?: number
  autoRenew?: boolean
}

interface Location {
  country?: string
  county?: string
  location?: string
  area?: string
}

interface Contact {
  phoneNumber?: string
}

interface Wallet {
  balance: number
}

interface UserData {
  id: string
  email: string
  username: string
  userType: string
  verification?: Verification
  currentPackage?: CurrentPackage
  gender?: string
  sexualOrientation?: string
  age?: number
  nationality?: string
  serviceType?: string
  location?: Location
  contact?: Contact
  profileImage?: string
  services?: string[]
  wallet?: Wallet
  packageHistory?: unknown[]
  [key: string]: unknown
}

export default function Dashboard() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const isSpa = userData?.userType === "spa"

  const fetchUserProfile = async () => {
    setBalanceLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data.data)
        localStorage.setItem("user", JSON.stringify(data.data))
      } else {
        throw new Error("Failed to fetch user profile")
      }
    } catch (error) {
      console.error("[v0] Error fetching user profile:", error)
    } finally {
      setBalanceLoading(false)
    }
  }

  useEffect(() => {
    let storedUserData: UserData | null = null

    try {
      const rawUser = localStorage.getItem("user")
      storedUserData = rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : null
    } catch (error) {
      console.error("Failed to parse user data:", error)
      storedUserData = null
    }

    const token = localStorage.getItem("token")

    console.log("storedUserData", storedUserData)
    console.log("token", token)
    console.log("redirect condition:", !storedUserData || !token)

    if (!storedUserData || !token) {
      localStorage.clear()
      router.push("/login")
      return
    }

    setUserData(storedUserData)
    setLoading(false)
    fetchUserProfile()
  }, [router])

  const updateUserData = (newData: Partial<UserData>) => {
    if (!userData) return
    const updatedUser = { ...userData, ...newData }
    setUserData(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  const getProfileStatus = () => {
    if (!userData) return { isActive: false, reasons: [] }

    const reasons: string[] = []

    if (!userData.verification?.isEmailVerified) {
      reasons.push("Email not verified")
    }

    if (
      !userData.currentPackage ||
      !userData.currentPackage.packageType ||
      userData.currentPackage.status !== 'active'
    ) {
      reasons.push("No active subscription package")
    }

    if (isSpa) {
      if (!userData.username || !userData.serviceType) {
        reasons.push("Spa information incomplete")
      }
    } else {
      if (!userData.gender || !userData.sexualOrientation || !userData.age || !userData.nationality || !userData.serviceType) {
        reasons.push("Personal information incomplete")
      }
    }

    if (!userData.location?.country || !userData.location?.county || !userData.location?.location || !userData.location?.area) {
      reasons.push("Location information incomplete")
    }

    if (!userData.contact?.phoneNumber) {
      reasons.push("Contact details not provided")
    }

    if (!userData.profileImage) {
      reasons.push("Profile photo not uploaded")
    }

    if (!userData.services || userData.services.length === 0) {
      reasons.push("Services not defined")
    }

    const isActive = reasons.length === 0

    return { isActive, reasons }
  }

  const { isActive, reasons } = getProfileStatus()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-secondary border-b border-border-light flex justify-center">
        <div className="container py-8  max-w-7xl px-4 ">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-text-inverse mb-2">
              Welcome back, {userData?.username}!
            </h1>
            <p className="text-text-inverse/70">Manage your profile and services</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            {isActive ? (
              <div className="bg-green-500/10 border-2 border-green-500 rounded-lg p-4 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <FiCheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-500 mb-1">Profile Active</h3>
                    <p className="text-text-inverse/80">
                      Your profile is live and showing on the feed. Clients can discover and contact you.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-4 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <FiXCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-500 mb-2">Profile Inactive</h3>
                    <p className="text-text-inverse/80 mb-4">
                      Your profile is not showing on the feed. Complete the following to activate your profile:
                    </p>
                    <div className="space-y-2">
                      {reasons.map((reason, index) => (
                        <div key={index} className="flex items-center gap-2 text-text-inverse/70">
                          <FiAlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <span className="text-sm">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container max-w-7xl px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <PhotoGalleryCard userData={userData} updateUserData={updateUserData} />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <WalletBalanceCard
              userData={userData}
              updateUserData={updateUserData}
              refreshBalance={fetchUserProfile}
              balanceLoading={balanceLoading}
            />

            <EmailVerificationCard userData={userData} updateUserData={updateUserData} />

            <PackageCard userData={userData} updateUserData={updateUserData} />

            <PersonalInfoCard userData={userData} updateUserData={updateUserData} />

            <LocationCard userData={userData} updateUserData={updateUserData} />

            <ContactDetailsCard userData={userData} updateUserData={updateUserData} />

            <ServicesCard userData={userData} updateUserData={updateUserData} />

            <ProfileVerificationCard userData={userData} updateUserData={updateUserData} />

            <SettingsCard userData={userData} updateUserData={updateUserData} />
          </div>
        </div>
      </div>
    </div>
  )
}
