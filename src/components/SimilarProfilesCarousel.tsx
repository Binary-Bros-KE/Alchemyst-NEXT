"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FiCheckCircle, FiMapPin, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { motion } from "framer-motion"
import { generateProfilePath } from "@/utils/urlHelpers"

interface Profile {
  _id: string
  username: string
  userType: string
  age?: number
  profileImage?: {
    url: string
  }
  location?: {
    county: string
    location: string
  }
  verification?: {
    profileVerified: boolean
  }
}

interface SimilarProfilesCarouselProps {
  profiles: Profile[]
  title?: string
}

export default function SimilarProfilesCarousel({ profiles, title = "Similar Profiles Nearby" }: SimilarProfilesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()

  if (!profiles || profiles.length === 0) return null

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, profiles.length))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + profiles.length) % Math.max(1, profiles.length))
  }

  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 4)
  if (visibleProfiles.length < 4 && profiles.length >= 4) {
    visibleProfiles.push(...profiles.slice(0, 4 - visibleProfiles.length))
  }

  const handleProfileClick = (profile: Profile) => {
    const path = generateProfilePath(profile)
    router.push(path)
  }

  return (
    <div className="mt-16 bg-gradient-to-b from-neutral-900 to-black py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <div className="w-1 h-8 bg-pink-500 rounded"></div>
          {title}
        </h2>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProfiles.map((profile, idx) => (
              <motion.div
                key={profile._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-neutral-800 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 group"
                onClick={() => handleProfileClick(profile)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={profile.profileImage?.url || "https://placehold.co/300x400/232323/FFF?text=Profile"}
                    alt={profile.username}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {profile.verification?.profileVerified && (
                    <div className="absolute top-3 right-3 bg-blue-500 p-1.5 rounded-full">
                      <FiCheckCircle className="text-white" size={16} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{profile.username}</h3>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <FiMapPin size={14} />
                    {profile.location?.location}, {profile.location?.county}
                  </p>
                  {profile.age && (
                    <p className="text-pink-400 text-sm mt-2">{profile.age} years old</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {profiles.length > 4 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-all z-10"
                aria-label="Previous profiles"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-all z-10"
                aria-label="Next profiles"
              >
                <FiChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
