"use client"
import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Sparkles,
  Rocket,
  Volume2,
  Bomb,
  Disc,
  CloudSun,
  Heart,
  SmilePlus,
  Clock,
  ArrowRight,
  Gift,
  Copy,
  ShoppingCart,
  X,
} from "lucide-react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { FaInfoCircle, FaArrowLeft, FaArrowRight } from "react-icons/fa"
import Navbar from "../Component/Navbar"
import "../App.css"
import { API_BASE_URL } from "../../Config"
import about from  '../../public/cont.png'

const categories = [
  { name: "Sparklers", icon: Sparkles, description: "Beautiful sparkling lights for celebrations" },
  { name: "Rockets", icon: Rocket, description: "High-flying rockets with spectacular displays" },
  { name: "Single Sound Crackers", icon: Volume2, description: "Traditional sound crackers for festivities" },
  { name: "Atom Bombs", icon: Bomb, description: "Powerful crackers with loud sound effects" },
  { name: "Ground Chakkars", icon: Disc, description: "Spinning ground fireworks with colorful effects" },
  { name: "Sky Shots", icon: CloudSun, description: "Aerial fireworks lighting up the sky" },
]

const statsData = [
  { label: "Customer Satisfaction", value: 100, icon: Heart, suffix: "%" },
  { label: "Products Available", value: 200, icon: Sparkles, suffix: "+" },
  { label: "Happy Clients", value: 500, icon: SmilePlus, suffix: "+" },
  { label: "Years of Experience", value: 15, icon: Clock, suffix: "+" },
]

const navLinks = ["Home", "About Us", "Price List", "Safety Tips", "Contact Us"]

// Flower Pot Fountain Animation Component - Shows all promocodes at once with close button
const FlowerPotFountainAnimation = ({ isActive, onComplete, promocodes, onCopyPromo, copiedPromos }) => {
  const [showingPromo, setShowingPromo] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showCloseButton, setShowCloseButton] = useState(false)
  const sparkles = Array.from({ length: 80 }, (_, i) => i)
  const fireParticles = Array.from({ length: 60 }, (_, i) => i)

  // Show all promocodes at once
  const promosToShow = promocodes.length > 1 ? promocodes.slice(0, -1) : []
  const lastPromo = promocodes.length > 0 ? promocodes[promocodes.length - 1] : null

  useEffect(() => {
    if (isActive && promosToShow.length > 0) {
      const promoTimer = setTimeout(() => {
        setShowingPromo(true)
        setShowCloseButton(true)
      }, 800)

      const completeTimer = setTimeout(() => {
        setAnimationComplete(true)
        onComplete()
      }, 3000)

      return () => {
        clearTimeout(promoTimer)
        clearTimeout(completeTimer)
      }
    } else if (isActive && promosToShow.length === 0) {
      // If no promos to show in air, just complete animation
      setTimeout(() => {
        setAnimationComplete(true)
        onComplete()
      }, 3000)
    }
  }, [isActive, promosToShow.length, onComplete])

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
    onCopyPromo(code)
  }

  const handleCloseAll = () => {
    setShowingPromo(false)
    setShowCloseButton(false)
    // Hide all promocodes by marking them as copied
    promosToShow.forEach((promo) => {
      if (!copiedPromos.includes(promo.code)) {
        onCopyPromo(promo.code)
      }
    })
    if (lastPromo && !copiedPromos.includes(lastPromo.code)) {
      onCopyPromo(lastPromo.code)
    }
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-40 hundred:-translate-y-40 mobile:-translate-y-44"
        >
          {/* Close Button */}
          {showCloseButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCloseAll}
              className="fixed top-8 right-8 z-50 pointer-events-auto w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300"
              style={{
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
              }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          )}

          {/* Fire particles shooting upward from bottom */}
          {fireParticles.map((i) => (
            <motion.div
              key={`fire-${i}`}
              initial={{
                x: "50vw",
                y: "100vh",
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * (window.innerWidth < 768 ? 60 : 80)}vw`,
                y: `${window.innerWidth < 768 ? 30 : 20 + Math.random() * 60}vh`,
                scale: [0, window.innerWidth < 768 ? 1.2 : 1.5, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: i * 0.02,
                ease: "easeOut",
              }}
              className="absolute w-4 h-4 rounded-full"
              style={{
                background: `radial-gradient(circle, ${
                  Math.random() > 0.5 ? "#ff6b35" : Math.random() > 0.5 ? "#fbbf24" : "#ef4444"
                }, transparent)`,
                boxShadow: `0 0 20px ${Math.random() > 0.5 ? "#ff6b35" : Math.random() > 0.5 ? "#fbbf24" : "#ef4444"}`,
              }}
            />
          ))}

          {/* Golden sparkles shooting upward */}
          {sparkles.map((i) => (
            <motion.div
              key={`sparkle-${i}`}
              initial={{
                x: "50vw",
                y: "100vh",
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * (window.innerWidth < 768 ? 70 : 100)}vw`,
                y: `${Math.random() * (window.innerWidth < 768 ? 50 : 40)}vh`,
                scale: [0, window.innerWidth < 768 ? 0.8 : 1, window.innerWidth < 768 ? 0.6 : 0.8, 0],
                rotate: 360 + Math.random() * 360,
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                delay: i * 0.03,
                ease: "easeOut",
              }}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-lg"
              style={{
                boxShadow: "0 0 15px #fbbf24, 0 0 25px #fbbf24, 0 0 35px #fbbf24",
              }}
            />
          ))}

          {/* All Promocodes popping up at once (n-1 promos) */}
          {showingPromo &&
            promosToShow.map((promo, index) => {
              if (copiedPromos.includes(promo.code)) return null // Hide copied promos

              return (
                <motion.div
                  key={promo.id}
                  initial={{
                    x: "50vw",
                    y: "100vh",
                    scale: 0,
                    rotate: -20,
                    opacity: 0,
                  }}
                  animate={{
                    x: `${window.innerWidth < 768 ? 10 + index * 25 : 30 + index * 15 + Math.random() * 20}vw`,
                    y: `${window.innerWidth < 768 ? 25 + index * 18 : 20 + index * 12 + Math.random() * 15}vh`,
                    scale: window.innerWidth < 768 ? 1 : 1.2,
                    rotate: Math.random() * 20 - 10,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                    y: "10vh",
                  }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.1, // Small stagger for visual effect
                    ease: "backOut",
                  }}
                  className="absolute hundred:translate-y-20 mobile:translate-y-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white mobile:px-3 mobile:py-2 px-6 py-4 rounded-3xl shadow-2xl font-bold mobile:text-sm text-lg border-4 border-white transform-gpu pointer-events-auto"
                  style={{
                    boxShadow: "0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4)",
                  }}
                >
                  <div className="flex items-center mobile:gap-2 gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Gift className="mobile:w-4 mobile:h-4 w-6 h-6" />
                    </motion.div>
                    <div className="text-center">
                      <div className="font-black mobile:text-lg text-xl">{promo.code}</div>
                      <div className="bg-white text-orange-600 mobile:px-2 mobile:py-0.5 px-3 py-1 rounded-full mobile:text-xs text-sm font-bold mt-1">
                        {promo.discount}% OFF
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(promo.code)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full mobile:p-1.5 p-2 transition-all duration-300"
                    >
                      <Copy className="mobile:w-3 mobile:h-3 w-4 h-4" />
                    </motion.button>
                  </div>
                  {/* Sparkle effects around promocode */}
                  {Array.from({ length: 8 }, (_, sparkleIndex) => (
                    <motion.div
                      key={sparkleIndex}
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 360],
                        x: [0, Math.cos(sparkleIndex * 45) * 30, 0],
                        y: [0, Math.sin(sparkleIndex * 45) * 30, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: sparkleIndex * 0.2,
                      }}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full pointer-events-none"
                      style={{
                        boxShadow: "0 0 10px #fde047",
                      }}
                    />
                  ))}
                </motion.div>
              )
            })}

          {/* Last promocode stays in/near the pot */}
          {animationComplete && lastPromo && !copiedPromos.includes(lastPromo.code) && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed hundred:translate-y-20 mobile:translate-y-20 mobile:bottom-28 bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white mobile:px-3 mobile:py-2 px-6 py-4 rounded-3xl shadow-2xl font-bold mobile:text-sm text-lg border-4 border-white"
                style={{
                  boxShadow: "0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4)",
                }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Gift className="w-6 h-6" />
                  </motion.div>
                  <div className="text-center">
                    <div className="font-black text-xl">{lastPromo.code}</div>
                    <div className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-bold mt-1">
                      {lastPromo.discount}% OFF
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(lastPromo.code)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>
                </div>
                {/* Special sparkles for last promo */}
                {Array.from({ length: 12 }, (_, sparkleIndex) => (
                  <motion.div
                    key={sparkleIndex}
                    animate={{
                      scale: [0, 1, 0],
                      rotate: [0, 360],
                      x: [0, Math.cos(sparkleIndex * 30) * 40, 0],
                      y: [0, Math.sin(sparkleIndex * 30) * 40, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: sparkleIndex * 0.15,
                    }}
                    className="absolute w-2 h-2 bg-purple-300 rounded-full pointer-events-none"
                    style={{
                      boxShadow: "0 0 10px #d8b4fe",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Shop Now Button - appears after animation */}
          {animationComplete && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="fixed mobile:bottom-4 mobile:right-4 bottom-8 right-8 z-50 pointer-events-auto"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = "/price-list")}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold mobile:px-4 mobile:py-2 px-8 py-4 rounded-2xl shadow-2xl hover:shadow-green-500/25 flex items-center mobile:gap-2 gap-3 mobile:text-sm text-lg"
              >
                <ShoppingCart className="mobile:w-4 mobile:h-4 w-6 h-6" />
                <span className="mobile:hidden">Shop Now</span>
                <span className="mobile:inline hidden">Shop</span>
                <ArrowRight className="mobile:w-4 mobile:h-4 w-6 h-6" />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ModernCarousel = ({ media }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef(null)

  const mediaItems = useMemo(() => {
    const items = media && typeof media === "string" ? JSON.parse(media) : Array.isArray(media) ? media : []
    return items.sort((a, b) => {
      const aStr = typeof a === "string" ? a : ""
      const bStr = typeof b === "string" ? b : ""
      const isAVideo = aStr.startsWith("data:video/")
      const isBVideo = bStr.startsWith("data:video/")
      const isAGif = aStr.startsWith("data:image/gif") || aStr.toLowerCase().endsWith(".gif")
      const isBGif = bStr.startsWith("data:image/gif") || bStr.toLowerCase().endsWith(".gif")
      const isAImage = aStr.startsWith("data:image/") && !isAGif
      const isBImage = bStr.startsWith("data:image/") && !isBGif

      const getPriority = (isImage, isGif, isVideo) => {
        if (isImage) return 0
        if (isGif) return 1
        if (isVideo) return 2
        return 3
      }

      return getPriority(isAImage, isAGif, isAVideo) - getPriority(isBImage, isBGif, isBVideo)
    })
  }, [media])

  const isVideo = (item) => typeof item === "string" && item.startsWith("data:video/")

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return
    const touchEndX = e.touches[0].clientX
    const diffX = touchStartX.current - touchEndX
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) handleNext()
      else handlePrev()
      touchStartX.current = null
    }
  }

  const handleTouchEnd = () => {
    touchStartX.current = null
  }

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="w-full h-64 rounded-3xl mb-6 overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center border border-orange-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-orange-600 font-medium">No media available</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-64 rounded-3xl mb-6 overflow-hidden group mobile:touch-pan-x"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200" />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {isVideo(mediaItems[currentIndex]) ? (
            <video
              src={mediaItems[currentIndex]}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover rounded-3xl"
            />
          ) : (
            <img
              src={mediaItems[currentIndex] || "/placeholder.svg"}
              alt="Product"
              className="w-full h-full object-cover rounded-3xl"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {mediaItems.length > 1 && (
        <>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
          >
            <FaArrowLeft className="text-orange-600 text-lg" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
          >
            <FaArrowRight className="text-orange-600 text-lg" />
          </motion.button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {mediaItems.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white shadow-lg" : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ModernStatCard({ icon: Icon, value, label, suffix, delay }) {
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 })

  useEffect(() => {
    if (inView && count === 0) {
      let start = 0
      const duration = 2000
      const stepTime = Math.max(Math.floor(duration / value), 20)
      const timer = setInterval(() => {
        start += Math.ceil(value / 100)
        if (start >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(start)
        }
      }, stepTime)
    }
  }, [inView, value, count])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-orange-100 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className="mb-2"
        >
          <span className="text-4xl font-bold text-gray-800 tabular-nums">{count}</span>
          <span className="text-2xl font-bold text-orange-500">{suffix}</span>
        </motion.div>
        <p className="text-gray-600 font-medium text-sm leading-relaxed">{label}</p>
      </div>
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
    </motion.div>
  )
}

export default function Home() {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [fastRunningProducts, setFastRunningProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [promocodes, setPromocodes] = useState([])
  const [showFountain, setShowFountain] = useState(false)
  const [copiedPromos, setCopiedPromos] = useState([])
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const navigate = useNavigate()

  const handleShowDetails = (product) => {
    setSelectedProduct(product)
    setShowDetailsModal(true)
  }

  const handleCloseDetails = () => {
    setSelectedProduct(null)
    setShowDetailsModal(false)
  }

  const handleFountainClick = () => {
    setShowFountain(true)
  }

  const handleFountainComplete = () => {
    // Don't auto-redirect, just complete the animation
  }

  const handleCopyPromo = (code) => {
    setCopiedPromos((prev) => [...prev, code])
    // Show success feedback
    setTimeout(() => {
      // Could add toast notification here
    }, 100)
  }

  // Fetch banners
  useEffect(() => {
    const fetchBanners = () => {
      fetch(`${API_BASE_URL}/api/banners`)
        .then((res) => res.json())
        .then((data) => setBanners(data.filter((b) => b.is_active)))
        .catch((err) => console.error("Error loading banners:", err))
    }
    fetchBanners()
    const interval = setInterval(fetchBanners, 1200 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch fast running products
  useEffect(() => {
    const fetchFastProducts = () => {
      fetch(`${API_BASE_URL}/api/products`)
        .then((res) => res.json())
        .then((data) => setFastRunningProducts(data.filter((p) => p.fast_running === true)))
        .catch((err) => console.error("Error loading fast running products:", err))
    }
    fetchFastProducts()
    const interval = setInterval(fetchFastProducts, 5 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch promocodes
  useEffect(() => {
    const fetchPromocodes = () => {
      fetch(`${API_BASE_URL}/api/promocodes`)
        .then((res) => res.json())
        .then((data) => {
          const activePromocodes = data.filter((promo) => promo.is_active !== false)
          setPromocodes(activePromocodes)
        })
        .catch((err) => console.error("Error loading promocodes:", err))
    }
    fetchPromocodes()
    const interval = setInterval(fetchPromocodes, 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Banner auto-slide
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % banners.length), 5000)
      return () => clearInterval(interval)
    }
  }, [banners])

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 text-gray-800 overflow-x-hidden"
    >
      <Navbar />

      {/* Flower Pot Fountain Cracker - Now at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="fixed mobile:bottom-4 bottom-8 left-1/2 -translate-x-1/2 z-30"
      >
        <motion.div
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Flower Pot Fountain Cracker */}
          <motion.button
            whileHover={{ scale: 1.15, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFountainClick}
            className="relative mobile:-translate-y-16 bg-gradient-to-b from-orange-600 via-orange-700 to-orange-900 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 overflow-hidden"
            style={{
              width: window.innerWidth < 768 ? "60px" : "80px",
              height: window.innerWidth < 768 ? "75px" : "100px",
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              border: window.innerWidth < 768 ? "3px solid #ea580c" : "4px solid #ea580c",
            }}
          >
            {/* Pot Base */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-orange-800 to-orange-950 border-t-2 border-orange-600"
              style={{ clipPath: "polygon(20% 0%, 0% 100%, 100% 100%, 80% 0%)" }}
            />
            {/* Fountain Opening */}
            <div className="absolute ml-5 mobile:ml-3 mobile:w-4 mobile:h-4 mobile:-translate-y-5 hundred:-translate-y-10 hundred:ml-7 w-8 h-8 bg-gradient-to-t from-yellow-600 via-yellow-400 to-yellow-200 rounded-full border-2 border-yellow-700 overflow-hidden">
              {/* Inner glow */}
              <div className="absolute inset-1 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full animate-pulse" />
            </div>
            {/* Continuous Fire Sparkles */}
            {Array.from({ length: 12 }, (_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -25, -15],
                  x: [0, (i - 6) * 3, (i - 6) * 2],
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.15,
                  ease: "easeOut",
                }}
                className="absolute top-4 left-1/2 w-2 h-2 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${
                    i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#f59e0b" : "#ef4444"
                  }, transparent)`,
                  boxShadow: `0 0 12px ${i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#f59e0b" : "#ef4444"}`,
                }}
              />
            ))}
            {/* Pot Decorations */}
            <div className="absolute top-1/3 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full opacity-60" />
            <div className="absolute top-2/3 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-orange-300 to-transparent rounded-full opacity-40" />
            {/* Glow Effect */}
            <motion.div
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-0 -translate-y-50 bg-gradient-to-t from-transparent via-yellow-400/30 to-yellow-200/50 rounded-full"
            />
            {/* Label */}
            <div className="absolute mobile:-bottom-10 -bottom-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white mobile:px-2 mobile:py-1 px-4 py-2 rounded-full mobile:text-xs text-sm font-bold whitespace-nowrap shadow-xl border-2 border-white">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                }}
                className="inline-block mr-2"
              >
                🎆
              </motion.div>
              Click for Offers!
              <motion.div
                animate={{
                  rotate: -360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 },
                }}
                className="inline-block ml-2"
              >
                🎇
              </motion.div>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Fountain Animation */}
      <FlowerPotFountainAnimation
        isActive={showFountain}
        onComplete={handleFountainComplete}
        promocodes={promocodes}
        onCopyPromo={handleCopyPromo}
        copiedPromos={copiedPromos}
      />

      <AnimatePresence>
        {showDetailsModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedProduct.productname}</h2>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {selectedProduct.discount}% OFF
                      </span>
                      <span className="text-orange-600 font-semibold">
                        ₹{((selectedProduct.price * (100 - selectedProduct.discount)) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCloseDetails}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <span className="text-gray-600 text-xl">×</span>
                  </motion.button>
                </div>
                <ModernCarousel media={selectedProduct.image} />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedProduct.description ||
                        "Experience the magic of celebrations with our premium quality fireworks."}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/price-list")}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Enquire Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 mt-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="relative mobile:h-[180px] hundred:mt-10 onefifty:mt-5 onefifty:h-[400px] tab:h-[250px] mobile:-mt-25 hundred:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              {banners.map(
                (banner, idx) =>
                  currentSlide === idx && (
                    <motion.div
                      key={banner.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0"
                    >
                      <img
                        src={
                          banner.image_url.startsWith("http") ? banner.image_url : `${API_BASE_URL}${banner.image_url}`
                        }
                        alt={`Banner ${banner.id}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
            {banners.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                {banners.map((_, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? "bg-white shadow-lg" : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Fast Running Products */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 mobile:-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Fast Running Products</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto mb-6" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover our most popular fireworks that bring joy and excitement to every celebration
            </p>
          </motion.div>
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100">
              {fastRunningProducts.map((product, index) => {
                const originalPrice = Number.parseFloat(product.price)
                const discount = originalPrice * (product.discount / 100)
                const finalPrice = (originalPrice - discount).toFixed(2)
                return (
                  <motion.div
                    key={product.serial_number}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-orange-100 min-w-[300px] max-w-[300px] snap-center"
                  >
                    <div className="relative">
                      <ModernCarousel media={product.image} />
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                        {product.discount}% OFF
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShowDetails(product)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
                      >
                        <FaInfoCircle className="text-orange-600" />
                      </motion.button>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {product.productname}
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
                        <span className="text-2xl font-bold text-orange-600">₹{finalPrice}</span>
                        <span className="text-sm text-gray-600">/ {product.per}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/price-list")}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        Enquire Now
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={about}
                  alt="Madhu Nisha Crackers"
                  className="w-full h-96 object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl opacity-20 -z-10" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                  Welcome to{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
                    Madhu Nisha Crackers
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-8" />
              </div>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Madhu Nisha Crackers has been a well-known Fireworks Store in Sivakasi. What started out as a hobby has become
                  our passion for creating magical moments.
                </p>
                <p>
                  We offer quality products, unparalleled service, and the most competitive prices in town, ensuring
                  every celebration becomes unforgettable.
                </p>
                <p>
                  Trusted name among top companies in the Sivakasi fireworks business — manufacturing, wholesaling, and
                  retailing traditional and modern fireworks.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/about-us")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
              >
                Learn More About Us
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Categories</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto mb-6" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore our wide range of premium fireworks for every occasion and celebration
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map(({ name, icon: Icon, description }, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-orange-100 text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-orange-600 transition-colors">
                  {name}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/price-list")}
                  className="bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-500 hover:to-orange-600 text-orange-600 hover:text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 border border-orange-200 hover:border-orange-500 flex items-center gap-2 mx-auto"
                >
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Light Up Your Celebrations</h2>
            <p className="text-xl text-orange-100 mb-8 leading-relaxed max-w-2xl mx-auto">
              Order online and get the best discounts on all products. Create magical moments with our premium fireworks
              collection.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/price-list")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold px-12 py-4 rounded-2xl text-lg transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 flex items-center gap-3 mx-auto"
            >
              Place Your Order
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-orange-400 rounded-full opacity-60 animate-pulse" />
        <div
          className="absolute bottom-20 right-20 w-6 h-6 bg-yellow-400 rounded-full opacity-40 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-40 right-40 w-3 h-3 bg-red-400 rounded-full opacity-50 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Achievements</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto mb-6" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Numbers that speak for our commitment to excellence and customer satisfaction
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, i) => (
              <ModernStatCard key={i} {...stat} delay={i * 0.2} />
            ))}
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mobile:mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-orange-400">Madhu Nisha Crackers</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Our products focus on our customer's happiness. Crackers are available in different specifications as
                per the requirements of the clients.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/about-us")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-orange-400">Contact Info</h3>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h4 className="font-semibold text-white mb-2">Address</h4>
                  <p>
                    Madhu Nisha Crackers
                    <br />
                    Pernayakkanpatti, Pachayapuram.,
                    <br />
                    Kil Thayilapatti, Sivakasi
                  </p>
                  <div className="mt-5">
                    <p className="text-white font-medium">Office Address</p>
                    <p className="text-gray-300 mt-2">
                      Gopi Pyro World
                      <br/>
                      Sivagamipuram Colony, Viseanatham panchayat.,
                      <br />
                      Sivakasi
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Phone</h4>
                  <a
                    href="tel:+919487524689"
                    className="text-gray-300 hover:text-orange-400 transition-colors block"
                  >
                    +91 94875 24689
                  </a>
                  <a
                    href="tel:+919497594689"
                    className="text-gray-300 hover:text-orange-400 transition-colors block"
                  >
                    +91 94975 94689
                  </a>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Email</h4>
                  <a
                    href="mailto:madhunishacrackers@gmail.com"
                    className="text-gray-300 hover:text-orange-400 transition-colors"
                  >
                    madhunishacrackers@gmail.com
                  </a>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-orange-400">Quick Links</h3>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link}>
                    <a
                      href={link === "Home" ? "/" : `/${link.toLowerCase().replace(/ /g, "-")}`}
                      className="text-gray-300 hover:text-orange-400 transition-colors duration-300 font-medium flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <div className="text-center text-gray-400">
              <p className="mb-4 leading-relaxed">
                As per 2018 Supreme Court order, online sale of firecrackers are not permitted! We value our customers
                and respect jurisdiction. Please add your products to cart and submit enquiries. We will contact you
                within 24 hrs.
              </p>
              <p>
                Copyright © 2025 <span className="text-orange-400 font-semibold">Madhu Nisha Crackers</span>. All rights
                reserved. Developed by <span className="text-orange-400 font-semibold">SPD Solutions</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
