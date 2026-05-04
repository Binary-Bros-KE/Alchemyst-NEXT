"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { AiOutlineEnvironment } from "react-icons/ai"
import countiesData from "@/data/counties.json"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alchemyst-node-tjam.onrender.com"
const COUNTRIES = ["Kenya"]

interface County {
  code: number
  name: string
  sub_counties: string[]
}

interface LocationData {
  country: string
  county: string
  location: string
  area: string[]
}

interface LocationCardProps {
  userData: any
  updateUserData: (data: any) => void
}

export default function LocationCard({ userData, updateUserData }: LocationCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLocationComplete, setIsLocationComplete] = useState(false)
  const activePackage = userData?.currentPackage
  const isActive = activePackage && activePackage.status === "active"

  const MAX_AREAS =
    isActive && (activePackage.packageType === "premium" || activePackage.packageType === "elite") ? 5 : 3

  const [formData, setFormData] = useState<LocationData>({
    country: userData?.location?.country || "Kenya",
    county: userData?.location?.county || "",
    location: userData?.location?.location || "",
    area: Array.isArray(userData?.location?.area) ? userData.location.area : [],
  })

  useEffect(() => {
    const requiredFields = ["country", "county", "location", "area"]
    const allFieldsFilled = requiredFields.every((field) => Boolean(userData?.location?.[field]))
    setIsLocationComplete(allFieldsFilled)

    setFormData({
      country: userData?.location?.country || "Kenya",
      county: userData?.location?.county || "",
      location: userData?.location?.location || "",
      area: Array.isArray(userData?.location?.area) ? userData.location.area : [],
    })
  }, [userData])

  const [subCounties, setSubCounties] = useState<string[]>([])
  const [newAreaInput, setNewAreaInput] = useState("")

  useEffect(() => {
    if (formData.county) {
      const selectedCounty = (countiesData as County[]).find(
        (c) => c.code.toString() === formData.county.toString() || c.name === formData.county,
      )
      if (selectedCounty) {
        setSubCounties(selectedCounty.sub_counties)
      } else {
        setSubCounties([])
      }
    } else {
      setSubCounties([])
    }
  }, [formData.county])

  const handleSave = async () => {
    if (!formData.country || !formData.county || !formData.location || formData.area.length === 0) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/location`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to update location")

      toast.success("Location updated successfully!")
      updateUserData(data.data)
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update location")
    } finally {
      setLoading(false)
    }
  }

  const handleAddArea = () => {
    const trimmed = newAreaInput.trim()

    if (!trimmed) return
    if (formData.area.includes(trimmed)) {
      toast.error("Area already added.")
      return
    }

    if (formData.area.length >= MAX_AREAS) {
      toast.error(`You can only select up to ${MAX_AREAS} areas for your current package.`)
      return
    }

    setFormData({ ...formData, area: [...formData.area, trimmed] })
    setNewAreaInput("")
  }

  const handleRemoveArea = (index: number) => {
    const updated = [...formData.area]
    updated.splice(index, 1)
    setFormData({ ...formData, area: updated })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`bg-bg-secondary border rounded-2xl p-6 ${isLocationComplete ? "border-green-500" : "border-border-light"}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary mb-1">Service Location</h3>
          <p className="text-sm text-text-muted">Where you provide your services</p>
        </div>
        <AiOutlineEnvironment className="text-primary text-3xl" />
      </div>

      <div className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Country</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={loading}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">County</label>
              <select
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value, location: "" })}
                className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={loading}
              >
                <option value="">Select county</option>
                {(countiesData as County[]).map((county) => (
                  <option key={county.code} value={county.name}>
                    {county.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={loading || !formData.county}
              >
                <option value="">Select Location</option>
                {subCounties.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Area (List areas you want to appear in)
                <span className="text-xs text-text-muted ml-2">
                  ({formData.area.length}/{MAX_AREAS} selected)
                </span>
              </label>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAreaInput}
                  onChange={(e) => setNewAreaInput(e.target.value)}
                  placeholder="e.g. Lang'ata, South C"
                  className="flex-1 px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddArea}
                  disabled={!newAreaInput.trim() || loading}
                  className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition cursor-pointer"
                >
                  Add
                </button>
              </div>
              {formData.area.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {formData.area.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 bg-bg-primary border border-border-light rounded-full px-3 py-1 text-sm"
                    >
                      {item}
                      <button type="button" onClick={() => handleRemoveArea(idx)} className="text-red-500 hover:text-red-700">
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-3">
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
                    country: userData?.location?.country || "Kenya",
                    county: userData?.location?.county || "",
                    location: userData?.location?.location || "",
                    area: Array.isArray(userData?.location?.area) ? userData.location.area : [],
                  })
                  setNewAreaInput("")
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
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted text-sm">Country:</span>
                <span className="text-text-primary text-sm">
                  {formData.country ? (
                    <span className="font-bold text-green-600">{formData.country}</span>
                  ) : (
                    <span>Not set</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted text-sm">County:</span>
                <span className="text-text-primary text-sm">
                  {formData.county ? <span className="font-bold text-green-600">{formData.county}</span> : <span>Not set</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted text-sm">Location:</span>
                <span className="text-text-primary text-sm">
                  {formData.location ? (
                    <span className="font-bold text-green-600">{formData.location}</span>
                  ) : (
                    <span>Not set</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted text-sm">Area(s):</span>
                <span className="text-text-primary text-sm">
                  {formData.area.length > 0 ? (
                    <span className="font-bold text-green-600">{formData.area.join(", ")}</span>
                  ) : (
                    <span>Not set</span>
                  )}
                </span>
              </div>
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
