"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alchemyst-node-tjam.onrender.com"

const GENDER_OPTIONS = ["Female", "Male", "Trans", "Non-binary", "Other"]
const ORIENTATION_OPTIONS = ["Straight", "Gay", "Bisexual", "Heterosexual", "Pansexual", "Asexual", "Queer", "Other"]
const BREAST_SIZE_OPTIONS = ["Small Breasts", "Medium Natural Breast", "Big Natural", "Extra Large", "No Breasts"]
const BODY_TYPE_OPTIONS = ["Petite", "Average", "Curvy", "Thick", "BBW", "Muscular"]
const SERVES_WHO_OPTIONS = ["Men", "Women", "Both Men and Women", "Queer Only"]
const ETHNICITY_OPTIONS = ["Black", "White", "Mixed", "Somali", "Arabic", "Hindi", "Other"]

interface FormData {
  username: string
  gender: string
  sexualOrientation: string
  age: string | number
  nationality: string
  serviceType: string
  bio: string
  breastSize: string
  bodyType: string
  servesWho: string
  ethnicity: string
  providesEroticServices: boolean
}

interface PersonalInfoCardProps {
  userData: any
  updateUserData: (data: any) => void
}

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary text-3xl"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

export default function PersonalInfoCard({ userData, updateUserData }: PersonalInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const isSpa = userData?.userType === "spa"
  const isMassuse = userData?.userType === "masseuse"

  const [formData, setFormData] = useState<FormData>({
    username: userData?.username || "",
    gender: userData?.gender || "",
    sexualOrientation: userData?.sexualOrientation || "",
    age: userData?.age || "",
    nationality: userData?.nationality || "",
    serviceType: userData?.serviceType || "",
    bio: userData?.bio || "",
    breastSize: userData?.breastSize || "",
    bodyType: userData?.bodyType || "",
    servesWho: userData?.servesWho || "",
    ethnicity: userData?.ethnicity || "",
    providesEroticServices: userData?.providesEroticServices ?? false,
  })

  useEffect(() => {
    const requiredFields = isSpa
      ? ["username", "serviceType"]
      : ["username", "gender", "sexualOrientation", "age", "nationality"]
    const allFieldsFilled = requiredFields.every((field) => userData && userData[field])
    setIsProfileComplete(allFieldsFilled)

    setFormData({
      username: userData?.username || "",
      gender: userData?.gender || "",
      sexualOrientation: userData?.sexualOrientation || "",
      age: userData?.age || "",
      nationality: userData?.nationality || "",
      serviceType: userData?.serviceType || "",
      bio: userData?.bio || "",
      breastSize: userData?.breastSize || "",
      bodyType: userData?.bodyType || "",
      servesWho: userData?.servesWho || "",
      ethnicity: userData?.ethnicity || "",
      providesEroticServices: userData?.providesEroticServices || false,
    })
  }, [userData, isSpa])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      username: userData?.username || "",
      gender: userData?.gender || "",
      sexualOrientation: userData?.sexualOrientation || "",
      age: userData?.age || "",
      nationality: userData?.nationality || "",
      serviceType: userData?.serviceType || "",
      bio: userData?.bio || "",
      breastSize: userData?.breastSize || "",
      bodyType: userData?.bodyType || "",
      servesWho: userData?.servesWho || "",
      ethnicity: userData?.ethnicity || "",
      providesEroticServices: userData?.providesEroticServices || false,
    })
  }

  const getBioCharacterCount = () => (formData.bio ? formData.bio.length : 0)

  const getBioCharacterColor = () => {
    const count = getBioCharacterCount()
    if (count === 0) return "text-text-muted"
    if (count <= 150) return "text-success"
    if (count <= 180) return "text-warning"
    return "text-error"
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile")
      }

      toast.success("Profile updated successfully!")
      updateUserData(data.user)
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const renderField = (label: string, value: string | number | undefined | null, isBio = false) => (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
      {value ? (
        isBio ? (
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
        ) : (
          <p className="text-green-500 font-bold capitalize">{value}</p>
        )
      ) : (
        <p className="text-text-muted">{isBio ? "No bio added yet" : "Not set"}</p>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`bg-bg-secondary border rounded-2xl p-6 transition-colors duration-300 ${
        isProfileComplete ? "border-green-500" : "border-border-light"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary mb-1">{isSpa ? "Spa Information" : "Personal Information"}</h3>
          <p className="text-sm text-text-muted">
            {isSpa ? "Manage your spa details and service type" : "Manage your personal details and services"}
          </p>
        </div>
        <UserIcon />
      </div>

      <div className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">{isSpa ? "Spa Name" : "Username"}</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {isSpa ? "About the Spa" : "About Me (Bio)"}
                <span className="text-text-muted text-xs font-normal ml-1">- This will show on your profile.</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder={`${isSpa ? "A preview of your spa. Keep it short and sweet.💋🍭" : "A preview of who you are. Keep it short and sweet.💋🍭"}`}
                rows={isSpa ? 10 : 5}
                maxLength={isSpa ? 500 : 400}
                className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-text-muted">This helps clients get to know you better</p>
                <p className={`text-xs ${getBioCharacterColor()}`}>
                  {getBioCharacterCount()}/{isSpa ? 500 : 400}
                </p>
              </div>
            </div>

            {!isSpa && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Age</label>
                <input
                  type="number"
                  min={18}
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={loading}
                />
              </div>
            )}

            {!isSpa && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={loading}
                />
              </div>
            )}

            {!isSpa && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={loading}
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!isSpa && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Sexual Orientation</label>
                <select
                  name="sexualOrientation"
                  value={formData.sexualOrientation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={loading}
                >
                  <option value="">Select orientation</option>
                  {ORIENTATION_OPTIONS.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Service Type</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={loading}
              >
                <option value="">Select service type</option>
                <option value="incall">Incall (Client comes to you)</option>
                <option value="outcall">Outcall (You go to client)</option>
                <option value="both">Both Incall & Outcall</option>
                {userData?.userType === "of-model" && <option value="online">Online Services</option>}
              </select>
            </div>

            {!isSpa && !isMassuse && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Breast Size</label>
                <select
                  name="breastSize"
                  value={formData.breastSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={loading}
                >
                  <option value="">Select breast size</option>
                  {BREAST_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!isSpa && !isMassuse && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Body Type</label>
                <select
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={loading}
                >
                  <option value="">Select body type</option>
                  {BODY_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!isSpa && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">I Serve</label>
                <select
                  name="servesWho"
                  value={formData.servesWho}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={loading}
                >
                  <option value="">Select who you serve</option>
                  {SERVES_WHO_OPTIONS.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!isSpa && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Ethnicity</label>
                <select
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={loading}
                >
                  <option value="">Select ethnicity</option>
                  {ETHNICITY_OPTIONS.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(isMassuse || isSpa) && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Do you provide erotic services as well? (e.g., happy ending)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-text-primary">
                    <input
                      type="radio"
                      name="providesEroticServices"
                      value="true"
                      checked={formData.providesEroticServices === true}
                      onChange={() => setFormData((prev) => ({ ...prev, providesEroticServices: true }))}
                      disabled={loading}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-primary">
                    <input
                      type="radio"
                      name="providesEroticServices"
                      value="false"
                      checked={formData.providesEroticServices === false}
                      onChange={() => setFormData((prev) => ({ ...prev, providesEroticServices: false }))}
                      disabled={loading}
                    />
                    No
                  </label>
                </div>
              </div>
            )}
          </>
        ) : isSpa ? (
          <>
            {renderField("Username", formData.username)}
            {renderField("About (Bio)", formData.bio, true)}
            {renderField("Service Type", formData.serviceType)}
            {renderField("Provides Erotic Services", formData.providesEroticServices ? "Yes" : "No")}
          </>
        ) : isMassuse ? (
          <>
            {renderField("Username", formData.username)}
            {renderField("About Me", formData.bio, true)}
            {renderField("Age", formData.age)}
            {renderField("Nationality", formData.nationality)}
            {renderField("Gender", formData.gender)}
            {renderField("Sexual Orientation", formData.sexualOrientation)}
            {renderField("Service Type", formData.serviceType)}
            {renderField("I Serve", formData.servesWho)}
            {renderField("Ethnicity", formData.ethnicity)}
            {renderField("Service Type", formData.serviceType)}
            {renderField("Provides Erotic Services", formData.providesEroticServices ? "Yes" : "No")}
          </>
        ) : (
          <>
            {renderField("Username", formData.username)}
            {renderField("About Me", formData.bio, true)}
            {renderField("Age", formData.age)}
            {renderField("Nationality", formData.nationality)}
            {renderField("Gender", formData.gender)}
            {renderField("Sexual Orientation", formData.sexualOrientation)}
            {renderField("Service Type", formData.serviceType)}
            {renderField("Breast Size", formData.breastSize)}
            {renderField("Body Type", formData.bodyType)}
            {renderField("I Serve", formData.servesWho)}
            {renderField("Ethnicity", formData.ethnicity)}
            {renderField("Service Type", formData.serviceType)}
          </>
        )}

        {isEditing ? (
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
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2.5 bg-bg-primary text-text-primary rounded-lg font-medium hover:bg-neutral-800 transition-all cursor-pointer hover:text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full mt-2 px-4 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>
    </motion.div>
  )
}
