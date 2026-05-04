"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete, AiOutlineHeart, AiOutlineCamera } from "react-icons/ai"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alchemyst-node-tjam.onrender.com"

const COMMON_SERVICES = [
  "Massage",
  "Dinner Dates",
  "Travel Companion",
  "GFE (Girlfriend Experience)",
  "PSE (Pornstar Experience)",
  "Couples",
  "Sleepovers",
  "Threesomes",
  "Role Play",
  "Lesbian Shows",
  "Anal",
  "BDSM",
  "BJ",
  "Raw BJ",
  "Rimming",
  "Raw Sex",
  "Golden Shower",
  "Sex Toys",
]

const MASSAGE_SERVICES = [
  "Swedish Massage",
  "Deep Tissue Massage",
  "Aromatherapy Massage",
  "Thai Massage",
  "Hot Stone Massage",
  "Reflexology",
  "Sports Massage",
  "Prenatal Massage",
  "Couples Massage",
  "Head and Neck Massage",
  "Body to Body Massage",
]

const PRICING_UNITS = ["Per Hour", "Per Service", "Per Night", "Per Day", "Per Session", "Per Week", "Per Month", "Per Video"]

const MAX_DESCRIPTION_LENGTH = 200

interface Service {
  _id: string
  name: string
  description: string
  isActive: boolean
  price: string
  pricingUnit: string
  contactForPrice: boolean
  priceNegotiable: boolean
  image?: {
    url: string
  }
}

interface ServiceFormData {
  name: string
  description: string
  isActive: boolean
  price: string
  pricingUnit: string
  contactForPrice: boolean
  priceNegotiable: boolean
}

interface ServicesCardProps {
  userData: any
  updateUserData: (data: any) => void
}

export default function ServicesCard({ userData, updateUserData }: ServicesCardProps) {
  const [services, setServices] = useState<Service[]>(userData?.services || [])
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)

  const [selectedServices, setSelectedServices] = useState<ServiceFormData[]>([])
  const [serviceImages, setServiceImages] = useState<Record<string, File>>({})
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({})
  const [customServiceName, setCustomServiceName] = useState("")

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    isActive: true,
    price: "",
    pricingUnit: "Per Hour",
    contactForPrice: false,
    priceNegotiable: false,
  })

  const serviceOptions = (() => {
    const type = userData?.userType
    const providesErotic = Boolean(userData?.providesEroticServices)

    if (type === "masseuse" || type === "spa") {
      return providesErotic ? COMMON_SERVICES : MASSAGE_SERVICES
    }

    return COMMON_SERVICES
  })()

  const openModal = (service: Service | null = null) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        description: service.description,
        isActive: service.isActive,
        price: service.price || "",
        pricingUnit: service.pricingUnit || "Per Hour",
        contactForPrice: service.contactForPrice || false,
        priceNegotiable: service.priceNegotiable || false,
      })
    } else {
      setEditingService(null)
      setFormData({
        name: "",
        description: "",
        isActive: true,
        price: "",
        pricingUnit: "Per Hour",
        contactForPrice: false,
        priceNegotiable: false,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingService(null)
    setFormData({
      name: "",
      description: "",
      isActive: true,
      price: "",
      pricingUnit: "Per Hour",
      contactForPrice: false,
      priceNegotiable: false,
    })
    setSelectedServices([])
    setServiceImages({})
    setImagePreviews({})
    setCustomServiceName("")
  }

  const toggleServiceSelection = (serviceName: string) => {
    setSelectedServices((prev) => {
      if (prev.some((s) => s.name === serviceName)) {
        const newImages = { ...serviceImages }
        const newPreviews = { ...imagePreviews }
        delete newImages[serviceName]
        delete newPreviews[serviceName]
        setServiceImages(newImages)
        setImagePreviews(newPreviews)
        return prev.filter((s) => s.name !== serviceName)
      } else {
        return [
          ...prev,
          {
            name: serviceName,
            description: "",
            isActive: true,
            price: "",
            pricingUnit: "Per Hour",
            contactForPrice: false,
            priceNegotiable: false,
          },
        ]
      }
    })
  }

  const updateServiceNegotiable = (serviceName: string, isNegotiable: boolean) => {
    setSelectedServices((prev) =>
      prev.map((s) => (s.name === serviceName ? { ...s, priceNegotiable: isNegotiable } : s))
    )
  }

  const addCustomService = () => {
    if (!customServiceName.trim()) {
      toast.error("Please enter a service name")
      return
    }

    if (selectedServices.some((s) => s.name.toLowerCase() === customServiceName.toLowerCase())) {
      toast.error("This service is already added")
      return
    }

    toggleServiceSelection(customServiceName.trim())
    setCustomServiceName("")
  }

  const handleServiceImageSelect = (serviceName: string, file: File | null) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setServiceImages((prev) => ({ ...prev, [serviceName]: file }))

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreviews((prev) => ({ ...prev, [serviceName]: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const updateServiceDescription = (serviceName: string, description: string) => {
    if (description.length > MAX_DESCRIPTION_LENGTH) return

    setSelectedServices((prev) => prev.map((s) => (s.name === serviceName ? { ...s, description } : s)))
  }

  const updateServicePricing = (serviceName: string, field: keyof ServiceFormData, value: string | boolean) => {
    setSelectedServices((prev) => prev.map((s) => (s.name === serviceName ? { ...s, [field]: value } : s)))
  }

  const handleBatchSave = async () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service")
      return
    }

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("services", JSON.stringify(selectedServices))

      if (userData?.userType === "spa") {
        Object.entries(serviceImages).forEach(([serviceName, file]) => {
          formDataToSend.append(`image_${serviceName}`, file)
        })
      }

      const response = await fetch(`${API_URL}/user/services/batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to save services")
      }

      const newServices = [...services, ...data.data]
      setServices(newServices)
      updateUserData({ services: newServices })

      setSelectedServices([])
      setServiceImages({})
      setImagePreviews({})

      toast.success(`${data.data.length} service(s) added successfully!`)
      closeModal()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save services")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Service name is required")
      return
    }

    if (!formData.contactForPrice && !formData.price) {
      toast.error("Please enter a price or select 'Contact for Price'")
      return
    }

    setLoading(true)
    try {
      const url = `${API_URL}/user/services/${editingService!._id}`

      const requestFormData = new FormData()
      requestFormData.append("name", formData.name)
      requestFormData.append("description", formData.description)
      requestFormData.append("isActive", formData.isActive.toString())
      requestFormData.append("price", formData.price)
      requestFormData.append("pricingUnit", formData.pricingUnit)
      requestFormData.append("contactForPrice", formData.contactForPrice.toString())
      requestFormData.append("priceNegotiable", formData.priceNegotiable.toString())

      if (userData?.userType === "spa" && serviceImages[formData.name]) {
        requestFormData.append("image", serviceImages[formData.name])
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: requestFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to save service")
      }

      const newServices = services.map((s) => (s._id === editingService!._id ? data.data : s))
      setServices(newServices)
      updateUserData({ services: newServices })
      toast.success("Service updated successfully!")
      closeModal()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save service")
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const response = await fetch(`${API_URL}/user/services/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete service")
      }

      const newServices = services.filter((s) => s._id !== serviceId)
      setServices(newServices)
      updateUserData({ services: newServices })
      toast.success("Service deleted successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete service")
    }
  }

  const toggleServiceStatus = async (service: Service) => {
    try {
      const response = await fetch(`${API_URL}/user/services/${service._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...service, isActive: !service.isActive }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update service")
      }

      const newServices = services.map((s) => (s._id === service._id ? data.data : s))
      setServices(newServices)
      updateUserData({ services: newServices })
      toast.success(`Service ${!service.isActive ? "activated" : "deactivated"}!`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update service")
    }
  }

  const isServicesSet = userData.services && userData.services.length > 0

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className={`bg-bg-secondary border ${isServicesSet ? "border-green-500" : "border-border-light"} rounded-2xl p-6`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-1">Services Offered</h3>
            <p className="text-sm text-text-muted">Manage the services you provide</p>
          </div>
          <AiOutlineHeart className="text-primary text-3xl" />
        </div>

        <div className="space-y-3 mb-6">
          {services.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <p>No services added yet</p>
              <p className="text-sm">Click the button below to add your first service</p>
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service._id}
                className="bg-bg-primary border border-border-light rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-text-primary">{service.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive ? "bg-success/20 text-success" : "bg-neutral-700 text-text-muted"
                      }`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mb-2">
                    {service.contactForPrice ? (
                      <span className="text-text-muted font-medium">Contact for Price</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">
                          KSh {service.price}{" "}
                          <span className="text-text-muted text-sm font-medium">/ {service.pricingUnit}</span>
                        </span>
                        {service.priceNegotiable && (
                          <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full font-medium">
                            Negotiable
                          </span>
                        )}
                        {!service.priceNegotiable && parseFloat(service.price) > 0 && (
                          <span className="px-2 py-0.5 bg-success/20 text-success text-xs rounded-full font-medium">
                            Fixed
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {service.description && <p className="text-sm text-text-secondary">{service.description}</p>}
                  {userData?.userType === "spa" && service.image && (
                    <img
                      src={service.image.url || "/placeholder.svg"}
                      alt={service.name}
                      className="mt-2 w-full h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 max-md:flex-col">
                  <button
                    onClick={() => toggleServiceStatus(service)}
                    className="p-2 hover:bg-bg-secondary rounded-lg transition-colors cursor-pointer"
                    title={service.isActive ? "Deactivate" : "Activate"}
                  >
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        service.isActive ? "bg-primary" : "bg-neutral-700"
                      } relative`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          service.isActive ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </button>
                  <button
                    onClick={() => openModal(service)}
                    className="p-2 hover:bg-bg-secondary rounded-lg transition-colors text-text-primary cursor-pointer"
                  >
                    <AiOutlineEdit className="text-xl" />
                  </button>
                  <button
                    onClick={() => deleteService(service._id)}
                    className="p-2 hover:bg-bg-secondary rounded-lg transition-colors text-error cursor-pointer"
                  >
                    <AiOutlineDelete className="text-xl" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => openModal()}
          className="w-full px-4 py-3 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <AiOutlinePlus className="text-xl" />
          Add Services
        </button>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-bg-secondary border border-border-light rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-text-primary mb-6">
                {editingService ? "Edit Service" : "Add Services"}
              </h3>

              {editingService ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Service Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter service name"
                      className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Description (optional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                          setFormData({ ...formData, description: e.target.value })
                        }
                      }}
                      placeholder="Write a short but enticing description. You can include emojis as well!"
                      rows={4}
                      className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      disabled={loading}
                    />
                    <p className="text-xs text-text-muted mt-1">
                      {formData.description.length} / {MAX_DESCRIPTION_LENGTH} characters
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 rounded border-border-light text-primary focus:ring-primary focus:ring-offset-0"
                        disabled={loading}
                      />
                      <span className="text-sm text-text-primary">Service is active</span>
                    </label>
                  </div>

                  <div className="border-t border-border-light pt-4 space-y-4">
                    <h4 className="font-semibold text-text-primary">Pricing</h4>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={formData.contactForPrice}
                          onChange={(e) => setFormData({ ...formData, contactForPrice: e.target.checked })}
                          className="w-5 h-5 rounded border-border-light text-primary focus:ring-primary focus:ring-offset-0"
                          disabled={loading}
                        />
                        <span className="text-sm text-text-primary">Contact for Price</span>
                      </label>
                    </div>

                    {!formData.contactForPrice && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Price (KSh)</label>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="Enter price"
                            min="0"
                            className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Pricing Unit</label>
                          <select
                            value={formData.pricingUnit}
                            onChange={(e) => setFormData({ ...formData, pricingUnit: e.target.value })}
                            className="w-full px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                            disabled={loading}
                          >
                            {PRICING_UNITS.map((unit: string) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>

                        {!formData.contactForPrice && formData.price && (
                          <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.priceNegotiable}
                                onChange={(e) => setFormData({ ...formData, priceNegotiable: e.target.checked })}
                                className="w-5 h-5 rounded border-border-light text-primary focus:ring-primary focus:ring-offset-0"
                                disabled={loading}
                              />
                              <span className="text-sm text-text-primary">Price is negotiable</span>
                            </label>
                            <p className="text-xs text-text-muted ml-8">
                              {formData.priceNegotiable
                                ? "Clients can negotiate this price"
                                : "Fixed price - no negotiations"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
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
                        "Save Service"
                      )}
                    </button>
                    <button
                      onClick={closeModal}
                      disabled={loading}
                      className="px-4 py-2.5 bg-bg-primary text-text-primary rounded-lg font-medium hover:bg-neutral-800 transition-all cursor-pointer hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-3">
                      Select services to add (you can select multiple)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {serviceOptions.map((service: string) => {
                        const isSelected = selectedServices.some((s) => s.name === service)
                        return (
                          <button
                            key={service}
                            onClick={() => toggleServiceSelection(service)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 cursor-pointer ${
                              isSelected
                                ? "bg-primary border-primary text-text-inverse"
                                : "bg-bg-primary border-border-light text-text-primary hover:border-primary/50"
                            }`}
                          >
                            {service}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="border-t border-border-light pt-4">
                    <label className="block text-sm font-medium text-text-primary mb-3">Or add a custom service</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customServiceName}
                        onChange={(e) => setCustomServiceName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addCustomService()
                          }
                        }}
                        placeholder="Enter custom service name"
                        className="flex-1 px-4 py-2.5 bg-bg-primary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        onClick={addCustomService}
                        className="px-6 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <AiOutlinePlus />
                        Add
                      </button>
                    </div>
                    <p className="text-xs text-text-muted mt-2">Can&apos;t find your service? Add a custom one here.</p>
                  </div>

                  {selectedServices.length > 0 && (
                    <div className="space-y-4 border-t border-border-light pt-6">
                      <h4 className="font-semibold text-text-primary">Configure Selected Services</h4>
                      {selectedServices.map((service) => (
                        <div
                          key={service.name}
                          className="bg-bg-primary border border-border-light rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-text-primary">{service.name}</h5>
                            <button
                              onClick={() => toggleServiceSelection(service.name)}
                              className="text-error hover:text-error/80"
                            >
                              <AiOutlineDelete className="text-lg" />
                            </button>
                          </div>

                          <textarea
                            value={service.description}
                            onChange={(e) => updateServiceDescription(service.name, e.target.value)}
                            placeholder="Write a short but enticing description (optional)"
                            rows={2}
                            className="w-full px-3 py-2 bg-bg-secondary border border-border-light rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                          />
                          <p className="text-xs text-text-muted">
                            {service.description.length} / {MAX_DESCRIPTION_LENGTH} characters
                          </p>

                          <div className="space-y-3 border-t border-border-light pt-3">
                            <div>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={service.contactForPrice}
                                  onChange={(e) =>
                                    updateServicePricing(service.name, "contactForPrice", e.target.checked)
                                  }
                                  className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-sm text-text-primary">Contact for Price</span>
                              </label>
                            </div>

                            {!service.contactForPrice && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-text-muted mb-1">Price (KSh)</label>
                                  <input
                                    type="number"
                                    value={service.price}
                                    onChange={(e) => updateServicePricing(service.name, "price", e.target.value)}
                                    placeholder="Enter price"
                                    min="0"
                                    className="w-full px-3 py-2 bg-bg-secondary border border-border-light rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-text-muted mb-1">Unit</label>
                                  <select
                                    value={service.pricingUnit}
                                    onChange={(e) => updateServicePricing(service.name, "pricingUnit", e.target.value)}
                                    className="w-full px-3 py-2 bg-bg-secondary border border-border-light rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  >
                                    {PRICING_UNITS.map((unit: string) => (
                                      <option key={unit} value={unit}>
                                        {unit}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {!service.contactForPrice && service.price && (
                                  <div className="mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={service.priceNegotiable}
                                        onChange={(e) => updateServiceNegotiable(service.name, e.target.checked)}
                                        className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary focus:ring-offset-0"
                                      />
                                      <span className="text-sm text-text-primary">Price is negotiable</span>
                                    </label>
                                    <p className="text-xs text-text-muted ml-6">
                                      {service.priceNegotiable
                                        ? "Clients can negotiate this price"
                                        : "Fixed price - no negotiations"}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-border-light">
                    <button
                      onClick={handleBatchSave}
                      disabled={loading || selectedServices.length === 0}
                      className="flex-1 px-4 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        `Add ${selectedServices.length} Service${selectedServices.length !== 1 ? "s" : ""}`
                      )}
                    </button>
                    <button
                      onClick={closeModal}
                      disabled={loading}
                      className="px-4 py-2.5 bg-bg-primary text-text-primary rounded-lg font-medium hover:bg-neutral-800 transition-all cursor-pointer hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
