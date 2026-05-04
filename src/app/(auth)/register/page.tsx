"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaHeart, FaSpa, FaHandSparkles, FaCamera } from "react-icons/fa"
import { useEffect } from "react"

interface Role {
  type: string
  icon: React.ReactNode
  title: string
  description: string
  image: string
}

export default function Register() {
  const router = useRouter()

  const handleSelection = (type: string) => {
    router.push(`/sign-up?type=${type}`)
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (token && user) {
      router.push("/dashboard")
    }
  }, [router])

  const roles: Role[] = [
    {
      type: "escort",
      icon: <FaHeart className="text-5xl text-primary" />,
      title: "Escort",
      description: "Offer companionship and escort services to clients",
      image: '/auth/escort.png',
    },
    {
      type: "masseuse",
      icon: <FaHandSparkles className="text-5xl text-primary" />,
      title: "Masseuse",
      description: "Provide professional massage and wellness services",
      image: '/auth/masseuse.jpg',
    },
    {
      type: "of-model",
      icon: <FaCamera className="text-5xl text-primary" />,
      title: "OF Model",
      description: "Advertise your online content and digital services",
      image: '/auth/of.jpg',
    },
    {
      type: "spa",
      icon: <FaSpa className="text-5xl text-primary" />,
      title: "Spa / Wellness",
      description: "Register your spa or wellness business",
      image: '/auth/spa.png',
    },
  ]

  return (
    <>
      <div className="min-h-screen bg-bg-primary">
        <main className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">Join Alchemyst</h1>
              <p className="text-lg text-text-secondary">
                Home of independent service providers, a platform by us, for us
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {roles.map((role, index) => (
                <motion.div
                  key={role.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative border border-border-light rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                  onClick={() => handleSelection(role.type)}
                >
                  <img
                    src={role.image}
                    alt={role.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-white/70"></div>

                  <div className="relative z-10 text-center space-y-6 p-8 flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      {role.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">{role.title}</h2>
                    <p className="text-text-secondary">{role.description}</p>
                    <button className="w-full px-6 py-3 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all hover:scale-105 cursor-pointer">
                      Continue as {role.title}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}
