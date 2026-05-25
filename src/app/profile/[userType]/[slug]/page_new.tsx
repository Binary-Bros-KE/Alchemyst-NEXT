"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  FiArrowLeft,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiCopy,
  FiCheck,
  FiUser,
  FiHeart,
  FiCalendar,
  FiGlobe,
} from "react-icons/fi"
import { BsWhatsapp } from "react-icons/bs"
import toast from "react-hot-toast"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Thumbs, FreeMode, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/thumbs"
import "swiper/css/free-mode"
import "swiper/css/autoplay"
import ProfileCard from "@/components/ProfileCard"
import SpaCard from "@/components/SpaCard"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alchemyst-node-tjam.onrender.com"

interface PageProps {
  params: Promise<{
    userType: string
    slug: string
  }>
  searchParams: Promise<{
    id?: string
  }>
}

export default function ProfileDetailsPage({ params, searchParams }: PageProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [similarProfiles, setSimilarProfiles] = useState<any[]>([])
  const [similarSpas, setSimilarSpas] = useState<any[]>([])
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null)

  // Unwrap params and searchParams Promises (Next.js 15+ requirement)
  const { userType, slug } = use(params)
  const { id: profileId } = use(searchParams)

  useEffect(() => {
    if (profileId) {
      window.scrollTo(0, 0)
      fetchProfile()
      trackView()
    }
  }, [profileId])

  useEffect(() => {
    if (profile) {
      fetchSimilarProfiles()
    }
  }, [profile])

  const fetchProfile = async () => {
    if (!profileId) return

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/profiles/${userType}/${profileId}`)
      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
      } else {
        toast.error("Profile not found")
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilarProfiles = async () => {
    if (!profile) return

    try {
      const response = await fetch(
        `${API_URL}/profiles/similar/${profile._id}?userType=${profile.userType}&county=${profile.location?.county}&location=${profile.location?.location}`
      )
      const data = await response.json()

      if (data.success && data.data) {
        const nonSpas = data.data.filter((p: any) => p.userType !== "spa")
        const spas = data.data.filter((p: any) => p.userType === "spa")
        setSimilarProfiles(nonSpas)
        setSimilarSpas(spas)
      }
    } catch (error) {
      console.error("Failed to fetch similar profiles:", error)
    }
  }

  const trackView = async () => {
    try {
      await fetch(`${API_URL}/analytics/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      })
    } catch (error) {
      console.error("Failed to track view:", error)
    }
  }

  const trackInteraction = async (type: string) => {
    try {
      await fetch(`${API_URL}/analytics/interaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          interactionType: type,
        }),
      })
    } catch (error) {
      console.error("Failed to track interaction:", error)
    }
  }

  const handleCopyPhone = async () => {
    if (!profile?.contact?.phoneNumber) return

    try {
      await navigator.clipboard.writeText(profile.contact.phoneNumber)
      setCopied(true)
      toast.success("Phone number copied!")
      setTimeout(() => setCopied(false), 2000)
      trackInteraction("phone_copy")
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleCall = () => {
    if (!profile?.contact?.phoneNumber) {
      toast.error("Phone number not available")
      return
    }

    window.location.href = `tel:${profile.contact.phoneNumber}`
    trackInteraction("call")
  }

  const handleWhatsApp = () => {
    if (!profile?.contact?.phoneNumber) {
      toast.error("WhatsApp not available")
      return
    }

    window.open(`https://wa.me/${profile.contact.phoneNumber}`, "_blank")
    trackInteraction("whatsapp")
  }

  const Ribbon = ({ text, colorClass, icon, top }: { text: string; colorClass: string; icon?: React.ReactNode; top: string }) => (
    <div className={`absolute transform -rotate-45 text-center text-white text-[8px] font-bold shadow-lg ${colorClass} ${top} w-40`}>
      <span className="inline-flex items-center gap-1.5 py-1 text-[8px] uppercase tracking-wider">
        {icon}
        {text}
      </span>
    </div>
  )

  const renderBadges = () => {
    if (!profile) return null

    const packageType = profile.currentPackage?.packageType
    const isPackageActive = profile.currentPackage?.status === "active"
    const isVerified = profile.verification?.profileVerified

    const badgeList: Array<{ text: string; colorClass: string; icon?: React.ReactNode }> = []

    if (packageType && isPackageActive) {
      const packageOptions: Record<string, { text: string; colorClass: string }> = {
        elite: { text: "VIP", colorClass: "bg-gradient-to-r from-yellow-400 to-orange-500" },
        premium: { text: "Premium", colorClass: "bg-gradient-to-r from-purple-500 to-pink-500" },
        basic: { text: "Regular", colorClass: "bg-neutral-600" },
      }

      const packageInfo = packageOptions[packageType]

      if (packageInfo) {
        badgeList.push(packageInfo)
      }
    }

    if (isVerified) {
      badgeList.push({
        text: "Verified",
        colorClass: "bg-blue-500",
        icon: <FiCheckCircle size={12} />,
      })
    }

    if (badgeList.length === 0) return null

    return (
      <div className="absolute top-0 left-0 w-40 h-40 overflow-hidden z-10 pointer-events-none">
        {badgeList.map((badge, index) => (
          <Ribbon
            key={badge.text}
            text={badge.text}
            colorClass={badge.colorClass}
            icon={badge.icon}
            top={index === 0 ? "top-3 -left-15" : "top-8 -left-12"}
          />
        ))}
      </div>
    )
  }

  // SEO-optimized content generator
  const generateSEOCopy = () => {
    if (!profile) return ""

    const { username, userType, location, age, services, bio, verification, currentPackage, providesEroticServices } = profile
    const county = location?.county || "Nairobi"
    const area = location?.area?.[0] || location?.location || "the area"
    const locationString = `${area}, ${county}`

    const serviceTypes: Record<string, any> = {
      escort: {
        title: "Escort",
        keywords: ["escorts", "call girls", "companionship", "dating", "hookups"],
        description: "premium escort services",
        synonyms: ["companion", "call girl", "escort service"]
      },
      masseuse: {
        title: "Masseuse",
        keywords: providesEroticServices
          ? ["massage", "bodywork", "relaxation", "erotic massage", "sensual massage"]
          : ["massage", "bodywork", "relaxation", "therapeutic massage"],
        description: providesEroticServices
          ? "professional erotic and sensual massage services"
          : "professional therapeutic and wellness massage services",
        synonyms: providesEroticServices
          ? ["massage therapist", "bodywork specialist", "sensual masseuse"]
          : ["massage therapist", "wellness specialist"]
      },
      "of-model": {
        title: "OnlyFans Model",
        keywords: ["OnlyFans", "content creation", "premium content"],
        description: "exclusive OnlyFans content",
        synonyms: ["content creator", "online model"]
      },
      spa: {
        title: "Spa",
        keywords: ["spa services", "massage parlor", "wellness spa"],
        description: "luxurious spa and wellness experiences",
        synonyms: ["massage parlor", "wellness center"]
      }
    }

    const serviceInfo = serviceTypes[userType] || {
      title: "Entertainment",
      keywords: ["adult services", "entertainment"],
      description: "premium adult entertainment services",
      synonyms: ["service provider"]
    }

    const serviceList = services?.length ? services.map((s: any) => s.name).join(", ") : "customized services"

    const renderTrustIndicators = () => {
      const list = []

      if (verification?.profileVerified)
        list.push(`
        <li class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full ${profile.userType === "masseuse" ? "bg-blue-500" : profile.userType === "of-model" ? "bg-fuchsia-500" : "bg-primary"}"></span>
          <span>Verified profile with complete background check</span>
        </li>
      `)

      if (currentPackage?.status === "active")
        list.push(`
        <li class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full ${profile.userType === "masseuse" ? "bg-blue-500" : profile.userType === "of-model" ? "bg-fuchsia-500" : "bg-primary"}"></span>
          <span>Premium ${userType} offering top-rated services</span>
        </li>
      `)

      list.push(`
      <li class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full ${profile.userType === "masseuse" ? "bg-blue-500" : profile.userType === "of-model" ? "bg-fuchsia-500" : "bg-primary"}"></span>
        <span>Professional and discreet services in ${area}</span>
      </li>
    `)

      return list.join("")
    }

    const serviceParagraph =
      userType === "masseuse"
        ? providesEroticServices
          ? `<p class="text-lg"><strong>${username}</strong> provides both <strong>therapeutic and sensual massage</strong> experiences, combining relaxation with intimacy in a professional and safe environment.</p>`
          : `<p class="text-lg"><strong>${username}</strong> specializes in <strong>professional, non-erotic massage therapy</strong> focused on wellness, relaxation, and physical rejuvenation.</p>`
        : `<p class="text-lg">Offering services in <strong>${serviceList}</strong>, ${username} provides customized experiences tailored to your specific desires.</p>`

    return `
  <div class="seo-content space-y-6 text-gray-700 leading-relaxed text-left">
    <h1 class="text-2xl font-bold text-gray-900 mb-4 capitalize">
      ${username} – ${serviceInfo.title} in ${locationString} | Alchemyst ${serviceInfo.title}s
    </h1>

    <p class="text-lg">
      Meet <strong>${username}</strong>, a dedicated ${serviceInfo.title.toLowerCase()} based in 
      <strong>${area}, ${county}</strong>. 
      ${age ? `At ${age} years old,` : "This professional"} ${userType === "masseuse" && !providesEroticServices ? "offers therapeutic wellness sessions" : `provides ${serviceInfo.description}`} 
      for clients seeking high-quality, confidential, and professional service.
    </p>

    ${bio ? `<p>${bio}</p>` : ""}

    ${serviceParagraph}

    <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4 capitalize">
      Best ${serviceInfo.title} Services in ${county} – ${area} Area
    </h2>

    <p>
      Searching for <strong>${serviceInfo.keywords[0]} in ${area}</strong>? 
      ${username} stands out among local ${serviceInfo.title.toLowerCase()}s 
      for professionalism, reliability, and client satisfaction.
    </p>

    <h3 class="text-xl font-semibold text-gray-900 mt-8 mb-4">Why Choose ${username}?</h3>
    <ul class="space-y-3 ml-4">
      ${renderTrustIndicators()}
    </ul>
  </div>`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-neutral-600 mb-4">Profile not found</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isSpa = profile.userType === "spa"
  const allImages = [profile.profileImage, ...(profile.secondaryImages || [])].filter(Boolean)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-neutral-900 py-4 px-4 z-40">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors max-md:mr-2 cursor-pointer"
          >
            <FiArrowLeft size={20} className={`border rounded-full ml-4 h-8 w-8 p-1 ${profile.userType === "masseuse" ? "text-blue-500 bg-blue-500/10 border-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500" : "text-primary bg-primary/10 border-primary"}`} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-white font-medium text-lg truncate max-w-xs sm:max-w-md flex gap-2 max-md:gap-0 capitalize max-md:flex max-md:flex-col">
            <span className={`font-bold ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>Alchemyst {profile.userType}s </span>
            <span className="max-md:hidden capitalize">&gt;&gt;&nbsp;</span>
            <span className="flex items-center">
              {!isSpa && <span>Hook up with</span>}&nbsp;
              {profile.username}
            </span>
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Image Gallery */}
          {isSpa ? (
            <div className="col-span-2">
              <div className="aspect-[16/9] rounded-xl overflow-hidden shadow-2xl mb-4 relative">
                {renderBadges()}
                <img
                  src={profile.profileImage.url}
                  className="w-full h-full object-cover"
                  alt={profile.username}
                />
              </div>

              {/* Username and Location */}
              <div>
                <h2 className="text-5xl font-bold text-neutral-900 mb-1 capitalize max-md:text-4xl">{profile.username}</h2>
                <h4 className="capitalize max-w-fit px-4 font-bold border border-primary rounded-lg my-2">
                  {profile.userType}
                </h4>

                <div className="flex items-start gap-2 text-primary font-bold my-4">
                  <FiMapPin className="mt-1 flex-shrink-0 text-primary font-bold" size={20} />
                  <p className="text-base text-xl capitalize">
                    {profile.location?.area?.[0] && `${profile.location.area[0]}, `}
                    {profile.location?.location}, {profile.location?.county}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xl">
                  Service Type: <div className="h-3 w-3  bg-blue-500 rounded-full"></div>
                  <h4 className="text-xl text-blue-500 font-bold">{profile.serviceType === 'both' ? 'Incalls & Outcalls' : profile.serviceType === 'incall' ? 'Incalls Only' : 'Outcalls Only'}</h4>
                </div>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="">
              {/* Main Image Swiper */}
              <div
                className={`${isSpa ? "aspect-[16/9]" : "aspect-[3/4]"} rounded-xl overflow-hidden shadow-2xl mb-4 relative`}
              >
                {renderBadges()}
                <Swiper
                  modules={[Navigation, Pagination, Thumbs]}
                  navigation
                  pagination={{ clickable: true }}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  className="h-full"
                >
                  {allImages.map((img, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={img.url || "https://placehold.co/600x800/232323/FFF?text=Profile"}
                        alt={`${profile.username} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Thumbnail Swiper */}
              {allImages.length > 1 && (
                <Swiper
                  modules={[FreeMode, Thumbs]}
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  slidesPerView={5}
                  freeMode={true}
                  watchSlidesProgress={true}
                  className="thumbs-swiper"
                >
                  {allImages.map((img, index) => (
                    <SwiperSlide key={index}>
                      <div className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity border-2 border-transparent hover:border-primary">
                        <img
                          src={img.url || "https://placehold.co/100x100/232323/FFF?text=Thumb"}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </motion.div>
          )}

          {/* Right Column - Profile Info */}
          {!isSpa && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="">
              {/* Username and Location */}
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-1 capitalize">{profile.username}</h2>
                <h3 className={`font-bold ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.age} Years Old</h3>
                <h4 className={`capitalize max-w-fit px-4 font-bold border rounded-lg my-2 ${profile.userType === "masseuse" ? "text-blue-500 bg-blue-500/10 border-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500" : "text-primary bg-primary/10 border-primary"}`}>
                  {profile.userType}
                </h4>

                <div className="flex items-start gap-2 text-neutral-600 my-4">
                  <FiMapPin className="mt-1 flex-shrink-0 font-semibold" size={20} />
                  <p className="text-base capitalize text-xl font-semibold">
                    {profile.location?.area?.[0] && `${profile.location.area[0]}, `}
                    {profile.location?.location}, {profile.location?.county}
                  </p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {profile.age && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1 flex items-center gap-1">
                        <FiCalendar size={14} />
                        Age
                      </p>
                      <p className="font-semibold text-neutral-900">{profile.age} years</p>
                    </div>
                  )}
                  {profile.gender && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Gender</p>
                      <p className="font-semibold text-neutral-900 capitalize">{profile.gender}</p>
                    </div>
                  )}
                  {profile.sexualOrientation && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Sexual Orientation</p>
                      <p className="font-semibold text-neutral-900 capitalize">{profile.sexualOrientation}</p>
                    </div>
                  )}
                  {profile.ethnicity && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Ethnicity</p>
                      <p className="font-semibold text-neutral-900 capitalize">{profile.ethnicity}</p>
                    </div>
                  )}
                  {profile.bodyType && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Body Type</p>
                      <p className="font-semibold text-neutral-900 capitalize">{profile.bodyType}</p>
                    </div>
                  )}
                  {profile.breastSize && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Bust</p>
                      <p className="font-semibold text-neutral-900 uppercase">{profile.breastSize}</p>
                    </div>
                  )}
                  {profile.nationality && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1 flex items-center gap-1">
                        <FiGlobe size={14} />
                        Nationality
                      </p>
                      <p className="font-semibold text-neutral-900 capitalize">{profile.nationality}</p>
                    </div>
                  )}
                  {profile.serviceType && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Service Type</p>
                      <p className="font-semibold text-neutral-900 capitalize">
                        {profile.serviceType === 'both' ? 'Incalls & Outcalls' : profile.serviceType === 'incall' ? 'Incalls Only' : 'Outcalls Only'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Erotic Services Indicator */}
              {profile?.userType === "masseuse" && (
                <motion.div
                  className={`mt-4 p-3 rounded-lg border text-sm flex items-center gap-2 ${profile?.providesEroticServices
                    ? "border-rose-300 bg-rose-50 text-rose-700"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700"
                    }`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {profile?.providesEroticServices ? (
                    <>
                      <FiHeart className="text-rose-500" size={40} />
                      <span>
                        <strong>This masseuse provides erotic and sensual massage services as well.</strong>
                        &nbsp;Please communicate your preferences respectfully.
                      </span>
                    </>
                  ) : (
                    <>
                      <FiUser className="text-emerald-500" size={40} />
                      <span>
                        <strong>This masseuse offers professional, non-erotic massage services only.</strong>
                        &nbsp;Kindly keep all interactions respectful.
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col "
          >
            {profile.bio ? (
              isSpa ? (
                // --- SPA DESCRIPTION ---
                <div className="bg-blue-100 p-5 rounded-lg border border-blue-400">
                  <h3 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
                    <FiUser />
                    About Our Spa
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              ) : (
                // --- REGULAR PROFILE DESCRIPTION (has bio) ---
                <div className={`p-5 rounded-lg border ${profile.userType === "masseuse" ? "text-blue-500 bg-blue-500/10 border-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500" : "text-primary bg-primary/10 border-primary"}`}>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <FiUser />
                    About Me
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )
            ) : (
              // --- NO BIO AVAILABLE ---
              <div className={`p-5 rounded-lg border ${profile.userType === "masseuse" ? "text-blue-500 bg-blue-500/10 border-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500" : "text-primary bg-primary/10 border-primary"}`}>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <FiUser />
                  About Me
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  {isSpa ? (
                    <>
                      Welcome to <span className="text-primary font-bold capitalize">{profile.username}</span>, a luxurious&nbsp;
                      <span className="text-primary font-bold capitalize">{profile.userType}</span>&nbsp;
                      located in <span className="text-primary font-bold capitalize">{profile.location?.location}</span>.&nbsp;
                      Step in for an indulgent experience that relaxes your body and revives your soul.
                    </>
                  ) : (
                    <>
                      Hi, I'm <span className={`font-bold capitalize ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.username}</span>, a&nbsp;
                      <span className={`font-bold capitalize ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.userType}</span>&nbsp;
                      based in <span className={`font-bold capitalize ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.location?.location}</span>.&nbsp;
                      I'm here to provide you with an unforgettable experience — let's connect and make amazing memories together!
                    </>
                  )}
                </p>
              </div>
            )}

            {isSpa ?
              <p className="my-2">For More Info about <span className={`font-bold capitalize ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.username}</span> get in touch via the contact details below to arrange a meet-up.</p>
              :
              <p className="my-2">To hook up with <span className={`font-bold capitalize ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.username}</span> get in touch via the contact details below to arrange a meet-up.</p>
            }

            {/* Phone Number with Copy */}
            {profile.contact?.phoneNumber && (
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 my-2">
                <label className="text-sm font-medium text-neutral-600 mb-2 block">Phone Number</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={profile.contact.phoneNumber}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-900 font-medium"
                  />
                  <button
                    onClick={handleCopyPhone}
                    className={`p-3 text-white rounded-lg hover:bg-primary/90 transition-all cursor-pointer ${profile.userType === "masseuse" ? "text-blue-500 bg-blue-500 border-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500 bg-fuchsia-500 border-fuchsia-500" : "text-primary bg-primary border-primary"}`}
                  >
                    {copied ? <span className=" flex items-center gap-2">Copied <FiCheck size={20} /></span> : <span className=" flex items-center gap-2">Copy<FiCopy size={20} /></span>}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCall}
                className="flex-1 px-6 py-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <FiPhone size={20} />
                <span className="hidden sm:inline">Call Now</span>
                <span className="sm:hidden">Call</span>
              </button>

              {profile.contact?.hasWhatsApp && (
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 px-6 py-4 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <BsWhatsapp size={20} />
                  <span className="hidden sm:inline">WhatsApp</span>
                  <span className="sm:hidden">Chat</span>
                </button>
              )}
            </div>
          </motion.div>

        </div>

        {/* Services Section */}
        {profile.services && profile.services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-4xl font-bold text-neutral-900 mb-6 max-md:text-3xl">
              <span className={`${profile.userType === "masseuse" ? "bg-[url('/graphic/scratch-massuse.png')]" : profile.userType === "of-model" ? "bg-[url('/graphic/scratch-of.png')]" : "bg-[url('/graphic/scratch.png')]"} bg-contain bg-center bg-no-repeat text-white px-6 py-2`}>Services</span> Offered
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.services
                .filter((s: any) => s.isActive)
                .map((service: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-bold text-neutral-900 mb-2 text-lg">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{service.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className={`font-bold text-lg ${profile.userType === "masseuse" ? "text-blue-600" : profile.userType === "of-model" ? "text-fuchsia-600" : "text-primary"}`}>
                        {service.contactForPrice ? (
                          <span className="">Contact for price</span>
                        ) : (
                          <>
                            KSh {service.price}{" "}
                            <span className="text-sm font-normal text-neutral-500">/ {service.pricingUnit}</span>
                          </>
                        )}
                      </div>
                      {service.priceNegotiable && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Negotiable</span>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Meet Our Girls Section for Spas */}
        {profile.secondaryImages && isSpa && (
          <div className="mt-10">
            <h4 className="text-4xl font-bold">
              Meet Our <span className="bg-[url('/graphic/scratch.png')] bg-contain bg-center bg-no-repeat text-white px-10 py-2">Girls</span>
            </h4>

            <div className="grid grid-cols-5 my-6 gap-4 max-md:grid-cols-2">
              {profile.secondaryImages.map((image: any, index: number) => (
                <img key={index} src={image.url} className="aspect-[3/4] rounded-md" alt={`Girl ${index + 1}`} />
              ))}
            </div>
          </div>
        )}

        {/* SEO Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 py-8 px-4 max-md:px-2 max-md:mt-10"
        >
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: generateSEOCopy() }}
          />
        </motion.div>

        {/* Similar Spas Carousel */}
        {similarSpas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold text-neutral-900">
                Spas & Parlors in<span className={`${profile.userType === "masseuse" ? "bg-[url('/graphic/scratch-massuse.png')]" : profile.userType === "of-model" ? "bg-[url('/graphic/scratch-of.png')]" : "bg-[url('/graphic/scratch.png')]"} bg-contain bg-center bg-no-repeat text-white px-6 py-2`}>{profile.location?.area?.[0] || profile.location?.location}</span>
              </h2>
              <button
                onClick={() => router.push(`/${profile.location?.county}?type=spa`)}
                className="text-primary font-medium hover:underline"
              >
                View All →
              </button>
            </div>

            <Swiper
              modules={[Navigation, FreeMode, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={similarSpas.length > 4}
              freeMode={true}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 3 },
              }}
              className="similar-spas-swiper"
            >
              {similarSpas.map((spa) => (
                <SwiperSlide key={spa._id}>
                  <SpaCard profile={spa} />
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        )}

        {/* Similar Profiles Carousel */}
        {similarProfiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold text-neutral-900 max-md:text-2xl">
                Similar {profile.userType === 'spa' ? 'Profiles' : 'Profiles'} in <span className={`${profile.userType === "masseuse" ? "bg-[url('/graphic/scratch-massuse.png')]" : profile.userType === "of-model" ? "bg-[url('/graphic/scratch-of.png')]" : "bg-[url('/graphic/scratch.png')]"} bg-contain bg-center bg-no-repeat text-white px-6 py-2`}>{profile.location?.location}</span>
              </h2>
              <button
                onClick={() => router.push(`/${profile.location?.county}/${profile.location?.location}`)}
                className="text-primary font-medium hover:underline"
              >
                View All →
              </button>
            </div>

            <Swiper
              modules={[Navigation, FreeMode, Autoplay]}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={similarProfiles.length > 4}
              freeMode={true}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
              className="similar-profiles-swiper"
            >
              {similarProfiles.map((similarProfile) => (
                <SwiperSlide key={similarProfile._id}>
                  <ProfileCard profile={similarProfile} />
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        )}

        {/* Sign Up CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-center text-white"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              {profile.userType === 'spa' ? 'Own a Spa?' : 'Are you an Escort?'}
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join Alchemyst today and reach thousands of clients in {profile.location?.county || 'your area'}.
              {profile.userType === 'spa'
                ? ' List your spa business and get more customers.'
                : ' Create your profile and start earning more.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push('/register')}
                className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign Up Free
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary transition-all duration-300"
              >
                Learn More
              </button>
            </div>
            <p className="text-sm mt-4 opacity-80">
              ✓ Free profile creation ✓ Premium visibility options ✓ Secure messaging
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
