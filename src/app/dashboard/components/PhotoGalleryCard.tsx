"use client"

import { useEffect, useState, type ChangeEvent, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import toast from "react-hot-toast"
import { AiOutlineCamera, AiOutlineCloudUpload, AiOutlineDelete } from "react-icons/ai"
import { FiCheckCircle, FiX } from "react-icons/fi"
import ConfirmationModal from "../../../components/ConfirmationModal"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alchemyst-node-tjam.onrender.com"
const MAX_FILE_SIZE = 5 * 1024 * 1024

type ConfirmationSeverity = "casual" | "danger" | "permanent"

interface UploadedImage {
  url?: string
  publicId?: string
  profilePicPublicId?: string
  [key: string]: unknown
}

interface PhotoGalleryCardProps {
  userData: any
  updateUserData: (data: any) => void
}

interface ConfirmModalState {
  isOpen: boolean
  message: string
  severity: ConfirmationSeverity
  onConfirm: () => void
}

interface UploadImageResponse {
  data?: UploadedImage
  message?: string
}

interface DeleteImageResponse {
  message?: string
}

const asUploadedImage = (value: unknown): UploadedImage | null => {
  if (!value) return null
  if (typeof value === "string") return { url: value }
  if (typeof value === "object") return value as UploadedImage
  return null
}

export default function PhotoGalleryCard({ userData, updateUserData }: PhotoGalleryCardProps) {
  const [profilePhoto, setProfilePhoto] = useState<UploadedImage | null>(asUploadedImage(userData?.profileImage))
  const [secondaryImages, setSecondaryImages] = useState<UploadedImage[]>(userData?.secondaryImages || [])

  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [selectedSecondaryFiles, setSelectedSecondaryFiles] = useState<File[]>([])
  const [secondaryPreviews, setSecondaryPreviews] = useState<string[]>([])

  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const views = userData?.analytics?.views
  const interactions = userData?.analytics?.interactions

  const pkg = userData?.currentPackage ?? null
  const pkgType = pkg?.packageType ?? null
  const pkgStatus = pkg?.status ?? null
  const hasActivePackage = !!(pkg && pkgType && pkgStatus === "active")

  const DEFAULT_SPA = 5
  const PREMIUM_SPA = 10
  const DEFAULT_NON_SPA = 2
  const PREMIUM_NON_SPA = 5
  const BASIC_NON_SPA = 4

  let MAX_SECONDARY_IMAGES = DEFAULT_NON_SPA

  const Ribbon = ({
    text,
    colorClass,
    icon,
    top,
  }: {
    text: string
    colorClass: string
    icon?: ReactNode
    top: string
  }) => (
    <div
      className={`absolute transform -rotate-45 text-center text-white text-[8px] font-bold shadow-lg ${colorClass} ${top} w-40`}
    >
      <span className="inline-flex items-center gap-1.5 py-1 text-[8px] uppercase tracking-wider">
        {icon}
        {text}
      </span>
    </div>
  )

  if (userData?.userType === "spa") {
    if (!hasActivePackage) {
      MAX_SECONDARY_IMAGES = DEFAULT_SPA
    } else if (pkgType === "premium" || pkgType === "elite") {
      MAX_SECONDARY_IMAGES = PREMIUM_SPA
    } else {
      MAX_SECONDARY_IMAGES = DEFAULT_SPA
    }
  } else {
    if (!hasActivePackage) {
      MAX_SECONDARY_IMAGES = DEFAULT_NON_SPA
    } else if (pkgType === "premium" || pkgType === "elite") {
      MAX_SECONDARY_IMAGES = PREMIUM_NON_SPA
    } else if (pkgType === "basic") {
      MAX_SECONDARY_IMAGES = BASIC_NON_SPA
    } else {
      MAX_SECONDARY_IMAGES = DEFAULT_NON_SPA
    }
  }

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    message: "",
    severity: "casual",
    onConfirm: () => {},
  })

  useEffect(() => {
    if (!userData) return
    setProfilePhoto(asUploadedImage(userData.profileImage))
    setSecondaryImages(userData.secondaryImages || [])
  }, [userData])

  const isSpa = userData?.userType === "spa"
  const photoLabel = isSpa ? "Cover Photo" : "Profile Photo"
  const photoNote = isSpa ? "Upload your cover photo" : "Upload your sexiest photo"
  const isPortrait = !isSpa

  useEffect(() => {
    if (!selectedProfileFile) {
      setProfilePreview(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedProfileFile)
    setProfilePreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedProfileFile])

  useEffect(() => {
    if (selectedSecondaryFiles.length === 0) {
      setSecondaryPreviews([])
      return
    }

    const previews = selectedSecondaryFiles.map((file) => URL.createObjectURL(file))
    setSecondaryPreviews(previews)

    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [selectedSecondaryFiles])

  const handleProfilePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Max size is 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    setSelectedProfileFile(file)
  }

  const resetProfileSelection = () => {
    setSelectedProfileFile(null)
    setProfilePreview(null)
  }

  const uploadProfilePhoto = async () => {
    if (!selectedProfileFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", selectedProfileFile)
      formData.append("type", "profile")

      const response = await fetch(`${API_URL}/user/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      const data = (await response.json()) as UploadImageResponse

      if (!response.ok || !data.data) {
        throw new Error(data.message || "Failed to upload image")
      }

      setProfilePhoto(data.data)
      updateUserData({ profileImage: data.data })
      setSelectedProfileFile(null)
      setProfilePreview(null)
      toast.success("Profile photo uploaded successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleSecondaryFilesSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (secondaryImages.length + selectedSecondaryFiles.length + files.length > MAX_SECONDARY_IMAGES) {
      toast.error(`You can only upload up to ${MAX_SECONDARY_IMAGES} secondary images total`)
      return
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max size is 5MB`)
        return
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`)
        return
      }
    }

    setSelectedSecondaryFiles((prev) => [...prev, ...files])
  }

  const uploadAllSecondaryImages = async () => {
    if (selectedSecondaryFiles.length === 0) return

    setUploading(true)
    const uploadedImages: UploadedImage[] = []

    try {
      for (const file of selectedSecondaryFiles) {
        const formData = new FormData()
        formData.append("image", file)
        formData.append("type", "secondary")

        const response = await fetch(`${API_URL}/user/upload-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        })

        const data = (await response.json()) as UploadImageResponse

        if (!response.ok || !data.data) {
          throw new Error(data.message || "Failed to upload image")
        }

        uploadedImages.push(data.data)
      }

      const newImages = [...secondaryImages, ...uploadedImages]
      setSecondaryImages(newImages)
      updateUserData({ secondaryImages: newImages })
      setSelectedSecondaryFiles([])
      setSecondaryPreviews([])
      toast.success(`${uploadedImages.length} image(s) uploaded successfully!`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = (image: UploadedImage, isProfile = false) => {
    setConfirmModal({
      isOpen: true,
      message: isProfile
        ? `Are you sure you want to delete your ${photoLabel.toLowerCase()}? This will remove it from your profile.`
        : "Are you sure you want to delete this image? This action cannot be undone.",
      severity: "casual",
      onConfirm: () => {
        void deleteImage(image, isProfile)
      },
    })
  }

  const deleteImage = async (image: UploadedImage, isProfile = false) => {
    setDeleting(image.profilePicPublicId || image.publicId || null)
    try {
      const response = await fetch(`${API_URL}/user/delete-image`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          publicId: image.profilePicPublicId || image.publicId,
          type: isProfile ? "profile" : "secondary",
        }),
      })

      const data = (await response.json()) as DeleteImageResponse

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete image")
      }

      if (isProfile) {
        setProfilePhoto(null)
        updateUserData({ profileImage: null })
      } else {
        const newImages = secondaryImages.filter(
          (img) => (img.publicId || img.profilePicPublicId) !== (image.publicId || image.profilePicPublicId),
        )
        setSecondaryImages(newImages)
        updateUserData({ secondaryImages: newImages })
      }

      toast.success("Image deleted successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete image")
    } finally {
      setDeleting(null)
    }
  }

  const renderBadges = () => {
    const packageType = userData?.currentPackage?.packageType
    const isPackageActive = userData?.currentPackage?.status === "active"
    const isVerified = userData?.verification?.profileVerified

    const badgeList: Array<{ text: string; colorClass: string; icon?: ReactNode }> = []

    if (packageType && isPackageActive) {
      const packageInfo = {
        elite: { text: "VIP", colorClass: "bg-gradient-to-r from-yellow-400 to-orange-500" },
        premium: { text: "Premium", colorClass: "bg-gradient-to-r from-purple-500 to-pink-500" },
        basic: { text: "Regular", colorClass: "bg-neutral-600" },
      }[packageType as "elite" | "premium" | "basic"]

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative bg-bg-secondary border border-border-light rounded-2xl p-6"
      >
        {renderBadges()}
        <div className="flex my-6 gap-4">
          <div className="flex flex-col justify-center bg-blue-500/10 border border-blue-500 text-center rounded-md px-4 py-1 w-full">
            <span className="text-lg">Profile Views</span>
            <span className="font-bold text-4xl text-blue-500">{views}</span>
          </div>
          <div className="flex flex-col justify-center bg-fuchsia-500/10 border border-fuchsia-500 text-center rounded-md px-4 py-1 w-full">
            <span className="text-lg">Interactions</span>
            <span className="font-bold text-4xl text-fuchsia-500">{interactions}</span>
          </div>
        </div>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-1">Photo Gallery</h3>
            <p className="text-sm text-text-muted">Upload your photos to attract clients</p>
          </div>
          <AiOutlineCamera className="text-primary text-3xl" />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold text-text-primary">{photoLabel}</h4>
            <span className="text-xs text-primary font-medium">"{photoNote}"</span>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
            <p className="text-xs text-text-muted mb-2">
              Recommended dimensions: {isPortrait ? "1080 x 1350px (Portrait)" : "1200 x 630px (Landscape)"}
            </p>
            <div className="flex items-center gap-4">
              <div
                className={`bg-bg-primary border-2 border-dashed border-border-light rounded-lg flex items-center justify-center ${isPortrait ? "w-24 h-32" : "w-32 h-20"}`}
              >
                <span className="text-xs text-text-muted text-center px-2">
                  {isPortrait ? "Portrait\nOrientation" : "Landscape\nOrientation"}
                </span>
              </div>
              <p className="text-xs text-text-secondary flex-1">
                {isPortrait
                  ? "Upload a vertical photo with height longer than width for best results in the feed."
                  : "Upload a horizontal photo for best display as your business cover."}
              </p>
            </div>
          </div>

          <div className="relative">
            {profilePreview || profilePhoto?.url ? (
              <div className="relative group">
                <img
                  src={profilePreview || profilePhoto?.url || "/placeholder.svg"}
                  alt={photoLabel}
                  className={`w-full rounded-lg object-cover border-2 border-border-light ${isPortrait ? "aspect-[3/4]" : "aspect-[16/9]"}`}
                />

                {profilePreview ? (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <label
                      className="bg-primary text-text-inverse rounded-full p-2 shadow-lg hover:bg-primary-hover transition-all cursor-pointer"
                      title="Change selected image"
                    >
                      <AiOutlineCamera className="text-xl" />
                      <input type="file" accept="image/*" onChange={handleProfilePhotoSelect} className="hidden" />
                    </label>
                    <button
                      onClick={resetProfileSelection}
                      className="bg-error text-white rounded-full p-2 shadow-lg hover:bg-error/80 transition-all cursor-pointer"
                      title="Remove selected image"
                    >
                      <FiX className="text-xl" />
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                    <label className="px-4 py-2 bg-primary text-text-inverse rounded-lg font-medium cursor-pointer hover:bg-primary-hover transition-all">
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleProfilePhotoSelect} className="hidden" />
                    </label>
                    <button
                      onClick={() => {
                        if (profilePhoto) {
                          handleDeleteImage(profilePhoto, true)
                        }
                      }}
                      disabled={deleting === profilePhoto?.profilePicPublicId}
                      className="px-4 py-2 bg-error text-white rounded-lg font-medium hover:bg-error/80 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {deleting === profilePhoto?.profilePicPublicId ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <AiOutlineDelete />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <label
                className={`w-full border-2 border-dashed border-border-light hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 bg-bg-primary/50 rounded-lg ${isPortrait ? "aspect-[3/4]" : "aspect-[16/9]"}`}
              >
                <input type="file" accept="image/*" onChange={handleProfilePhotoSelect} className="hidden" />
                <AiOutlineCamera className="text-5xl text-text-muted" />
                <div className="text-center">
                  <p className="text-text-primary font-medium mb-1">Upload {photoLabel}</p>
                  <p className="text-xs text-text-muted">{photoNote}</p>
                </div>
              </label>
            )}

            {selectedProfileFile && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={uploadProfilePhoto}
                disabled={uploading}
                className="mt-4 w-full px-4 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <AiOutlineCloudUpload className="text-xl" />
                    Upload {photoLabel}
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-text-primary mb-4">Secondary Photos {isSpa ? "(Your Girls)" : ""}</h4>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4">
            {isSpa ? (
              <p className="text-primary text-sm">
                Upload up to {MAX_SECONDARY_IMAGES} additional photos (max 5MB each) of your sexiest girls/boys <br />
                <span className="font-bold text-xs capitalize">premium packages get upto 10 images</span>
              </p>
            ) : (
              <p className="text-primary text-sm">Upload up to {MAX_SECONDARY_IMAGES} additional photos (max 5MB each)</p>
            )}
          </div>

          {secondaryPreviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-bg-primary border border-border-light rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-text-primary">{selectedSecondaryFiles.length} file(s) selected</p>
                <button
                  onClick={() => {
                    setSelectedSecondaryFiles([])
                    setSecondaryPreviews([])
                  }}
                  className="text-xs text-error hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {secondaryPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border-light">
                    <img src={preview || "/placeholder.svg"} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <label className="flex-1 px-4 py-2 bg-bg-secondary text-text-primary border border-border-light rounded-lg font-medium hover:bg-bg-primary transition-all cursor-pointer flex items-center justify-center gap-2">
                  <AiOutlineCamera className="text-lg" />
                  Add More Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSecondaryFilesSelect}
                    className="hidden"
                    disabled={uploading || secondaryImages.length + selectedSecondaryFiles.length >= MAX_SECONDARY_IMAGES}
                  />
                </label>
              </div>

              <button
                onClick={uploadAllSecondaryImages}
                disabled={uploading}
                className="w-full px-4 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <AiOutlineCloudUpload className="text-xl" />
                    Upload All ({selectedSecondaryFiles.length})
                  </>
                )}
              </button>
            </motion.div>
          )}

          <div className="space-y-3">
            <AnimatePresence>
              {secondaryImages.map((image, index) => (
                <motion.div
                  key={image.publicId || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-border-light group"
                >
                  <img src={image.url || "/placeholder.svg"} alt={`Secondary ${index + 1}`} className="w-full h-full object-cover" />

                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteImage(image, false)}
                      disabled={deleting === (image.publicId || image.profilePicPublicId)}
                      className="px-4 py-2 bg-error text-white rounded-lg font-medium hover:bg-error/80 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {deleting === (image.publicId || image.profilePicPublicId) ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <AiOutlineDelete />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {secondaryImages.length + selectedSecondaryFiles.length < MAX_SECONDARY_IMAGES && (
              <label className="block aspect-[3/4] rounded-lg border-2 border-dashed border-border-light hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-bg-primary/50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSecondaryFilesSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <AiOutlineCamera className="text-4xl text-text-muted" />
                <span className="text-sm text-text-muted font-medium">Add Photos</span>
                <span className="text-xs text-text-muted">
                  {secondaryImages.length + selectedSecondaryFiles.length} / {MAX_SECONDARY_IMAGES}
                </span>
              </label>
            )}
          </div>
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        severity={confirmModal.severity}
      />
    </>
  )
}
