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
  Copy,
  Check,
  X,
  Gift,
} from "lucide-react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { FaInfoCircle, FaArrowLeft, FaArrowRight } from "react-icons/fa"
import Navbar from "../Component/Navbar"
import "../App.css"
import { API_BASE_URL } from "../../Config"

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

// Sparkler Animation Component
const SparklerAnimation = ({ isActive, onComplete }) => {
  const sparkles = Array.from({ length: 20 }, (_, i) => i)

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
          className="fixed inset-0 pointer-events-none z-40"
        >
          {sparkles.map((i) => (
            <motion.div
              key={i}
              initial={{
                x: "50vw",
                y: "10vh",
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 100}vw`,
                y: `${10 + Math.random() * 80}vh`,
                scale: [0, 1, 0],
                rotate: 360,
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-lg"
              style={{
                boxShadow: "0 0 10px #fbbf24, 0 0 20px #fbbf24, 0 0 30px #fbbf24",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Promocode Modal Component
const PromocodeModal = ({ isOpen, onClose, promocodes, navigate }) => {
  const [copiedCode, setCopiedCode] = useState(null)

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto relative"
          >
            {/* Yellow Light Effect */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full shadow-lg animate-pulse">
              <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="text-center flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 Special Offers!</h2>
                  <p className="text-gray-600">Available Promocodes</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              <div className="space-y-4 mb-6">
                {promocodes.length > 0 ? (
                  promocodes.map((promo, index) => (
                    <motion.div
                      key={promo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-4 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">%</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{promo.code}</h3>
                            <p className="text-sm text-gray-600">{promo.description}</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(promo.code)}
                          className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 transition-all duration-300"
                        >
                          {copiedCode === promo.code ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-600">Copy</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                      {promo.discount && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full font-bold">
                            {promo.discount}% OFF
                          </span>
                          {promo.min_order && <span className="text-gray-600">Min order: ₹{promo.min_order}</span>}
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Gift className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No promocodes available at the moment</p>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate("/price-list")
                  onClose()
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Order Now & Use Promocode
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
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
  const [showPromocodeModal, setShowPromocodeModal] = useState(false)
  const [showSparkler, setShowSparkler] = useState(false)
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

  const handleThreadClick = () => {
    setShowSparkler(true)
  }

  const handleSparklerComplete = () => {
    setShowSparkler(false)
    setShowPromocodeModal(true)
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
          // Filter active promocodes
          const activePromocodes = data.filter((promo) => promo.is_active !== false)
          setPromocodes(activePromocodes)
        })
        .catch((err) => console.error("Error loading promocodes:", err))
    }
    fetchPromocodes()
    const interval = setInterval(fetchPromocodes, 30 * 1000) // Refresh every 30 seconds
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

      {/* Promocode Thread */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="fixed top-16 left-1/2 -translate-x-1/2 z-30"
      >
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Thread */}
          <div className="w-0.5 h-16 bg-gradient-to-b from-yellow-400 to-orange-500 mx-auto mb-2 shadow-sm"></div>

          {/* Promocode Tag */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleThreadClick}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-sm flex items-center gap-2 relative overflow-hidden"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Gift className="w-4 h-4" />
            </motion.div>
            <span>Offers!</span>

            {/* Shine effect */}
            <motion.div
              animate={{ x: [-100, 100] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Sparkler Animation */}
      <SparklerAnimation isActive={showSparkler} onComplete={handleSparklerComplete} />

      {/* Promocode Modal */}
      <PromocodeModal
        isOpen={showPromocodeModal}
        onClose={() => setShowPromocodeModal(false)}
        promocodes={promocodes}
        navigate={navigate}
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
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
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
                  src="/cont.png"
                  alt="MN Crackers"
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
                    MN Crackers
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-8" />
              </div>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  MN Crackers has been a well-known Fireworks Store in Sivakasi. What started out as a hobby has become
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
        <div className="absolute inset-0 bg-[url('/fireworks-bg.jpg')] bg-cover bg-center opacity-20" />
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
              <h3 className="text-2xl font-bold mb-6 text-orange-400">MN Crackers</h3>
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
                    MN Crackers
                    <br />
                    Anil Kumar Eye Hospital Opp.
                    <br />
                    Sattur Road, Sivakasi
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Phone</h4>
                  <p>
                    +91 63836 59214
                    <br />
                    +91 96554 56167
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Email</h4>
                  <p>nivasramasamy27@gmail.com</p>
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
                Copyright © 2025 <span className="text-orange-400 font-semibold">MN Crackers</span>. All rights
                reserved. Developed by <span className="text-orange-400 font-semibold">SPD Solutions</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
