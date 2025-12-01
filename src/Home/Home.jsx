import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {Sparkles,Rocket,Volume2,Bomb,Disc,CloudSun,Heart,SmilePlus,Clock,ArrowRight,Gift,Copy,ShoppingCart,X,AlertTriangle} from "lucide-react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { FaInfoCircle, FaArrowLeft, FaArrowRight } from "react-icons/fa"
import Navbar from "../Component/Navbar"
import "../App.css"
import { API_BASE_URL } from "../../Config"
import about from "../cont.jpg"
import need from "../default.jpg"

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

// Function to generate positions optimized for mobile and desktop
const generatePositionsForScreen = (count) => {
  const positions = []
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1920
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 1080
  const isMobile = screenWidth < 768

  if (isMobile) {
    // Mobile: Stack promocodes vertically in center
    const centerX = 0 // Relative to screen center
    const startY = -screenHeight * 0.2 // Start above center
    const spacing = 120 // Vertical spacing between promocodes

    for (let i = 0; i < count; i++) {
      positions.push({
        x: centerX,
        y: startY + i * spacing,
      })
    }
  } else {
    // Desktop: Use the existing non-overlapping logic
    const padding = 150
    const maxX = screenWidth - padding * 2
    const maxY = screenHeight - padding * 2
    const minDistance = 200
    const maxAttempts = 50

    for (let i = 0; i < count; i++) {
      let attempts = 0
      let newPosition
      let validPosition = false

      while (!validPosition && attempts < maxAttempts) {
        newPosition = {
          x: Math.random() * maxX - maxX / 2,
          y: Math.random() * maxY - maxY / 2,
        }

        validPosition = true
        for (const existingPos of positions) {
          const distance = Math.sqrt(
            Math.pow(newPosition.x - existingPos.x, 2) + Math.pow(newPosition.y - existingPos.y, 2),
          )
          if (distance < minDistance) {
            validPosition = false
            break
          }
        }
        attempts++
      }

      if (newPosition) {
        positions.push(newPosition)
      }
    }
  }

  return positions
}

// Modern Firework Animation Component
const ModernFireworkAnimation = ({
  delay = 0,
  startPosition,
  endPosition,
  burstPosition,
  colors,
  onBurstComplete,
  promocode,
  onCopyPromo,
  copiedPromos,
}) => {
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1920
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 1080

  useEffect(() => {
    if (onBurstComplete) {
      const timer = setTimeout(() => {
        onBurstComplete()
      }, delay + 3000) // Trigger after rocket reaches and bursts
      return () => clearTimeout(timer)
    }
  }, [delay, onBurstComplete])

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
    onCopyPromo(code)
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Rocket Trail */}
      <motion.div
        className="absolute w-3 h-8 rounded-full"
        style={{
          left: startPosition.x,
          top: startPosition.y,
          background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.tertiary} 100%)`,
          boxShadow: `0 0 20px ${colors.primary}`,
        }}
        animate={{
          x: [0, endPosition.x - startPosition.x],
          y: [0, endPosition.y - startPosition.y],
          opacity: [1, 1, 0],
          scale: [1, 1.2, 0.8],
        }}
        transition={{
          duration: 2,
          delay: delay,
          ease: "easeOut",
        }}
      />

      {/* Main Burst */}
      <motion.div
        className="absolute"
        style={{
          left: burstPosition.x,
          top: burstPosition.y,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.8, 0] }}
        transition={{
          duration: 5,
          delay: delay + 2,
        }}
      >
        {/* Primary burst particles */}
        {Array.from({ length: 32 }).map((_, i) => {
          const angle = i * 11.25 * (Math.PI / 180)
          const distance = screenWidth < 768 ? screenWidth * 0.08 : screenWidth * 0.15
          const x = Math.cos(angle) * distance
          const y = Math.sin(angle) * distance
          return (
            <motion.div
              key={`primary-${i}`}
              className="absolute w-4 h-4 rounded-full"
              style={{
                background: colors.burst[i % colors.burst.length],
                boxShadow: `0 0 15px ${colors.burst[i % colors.burst.length]}`,
              }}
              animate={{
                x: [0, x * 0.3, x * 0.7, x],
                y: [0, y * 0.3, y * 0.7, y],
                opacity: [1, 0.9, 0.5, 0],
                scale: [1, 1.3, 0.8, 0],
              }}
              transition={{
                duration: 4,
                delay: delay + 2,
                ease: "easeOut",
              }}
            />
          )
        })}

        {/* Secondary sparkles */}
        {Array.from({ length: 48 }).map((_, i) => {
          const angle = i * 7.5 * (Math.PI / 180)
          const distance = screenWidth < 768 ? screenWidth * 0.05 : screenWidth * 0.1
          const x = Math.cos(angle) * distance
          const y = Math.sin(angle) * distance
          return (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: colors.sparkles[i % colors.sparkles.length],
                boxShadow: `0 0 10px ${colors.sparkles[i % colors.sparkles.length]}`,
              }}
              animate={{
                x: [0, x * 0.4, x * 0.8, x * 1.2],
                y: [0, y * 0.4, y * 0.8, y * 1.2],
                opacity: [1, 0.8, 0.4, 0],
                scale: [1, 0.8, 0.4, 0],
              }}
              transition={{
                duration: 3.5,
                delay: delay + 2.3,
                ease: "easeOut",
              }}
            />
          )
        })}

        {/* Center flash */}
        <motion.div
          className="absolute w-40 h-40 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.center}aa 0%, ${colors.secondary}66 30%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [0, 4, 2, 0],
            opacity: [0, 1, 0.3, 0],
          }}
          transition={{
            duration: 2.5,
            delay: delay + 2,
            ease: "easeOut",
          }}
        />
      </motion.div>

      {/* Promocode appears after burst */}
      {promocode && !copiedPromos.includes(promocode.code) && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 4, duration: 0.5 }}
          className="absolute pointer-events-auto bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white mobile:px-4 mobile:py-3 px-6 py-4 rounded-3xl shadow-2xl font-bold mobile:text-base text-lg border-4 border-white"
          style={{
            left: burstPosition.x,
            top: burstPosition.y,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4)",
            zIndex: 45,
            maxWidth: screenWidth < 768 ? "280px" : "auto",
          }}
        >
          <div className="flex items-center mobile:gap-2 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Gift className="mobile:w-5 mobile:h-5 w-6 h-6" />
            </motion.div>
            <div className="text-center">
              <div className="font-black mobile:text-lg text-xl">{promocode.code}</div>
              <div className="bg-white text-purple-600 px-3 py-1 rounded-full mobile:text-xs text-sm font-bold mt-1">
                {promocode.discount}% OFF
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => copyToClipboard(promocode.code)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full mobile:p-1.5 p-2 transition-all duration-300"
            >
              <Copy className="mobile:w-3 mobile:h-3 w-4 h-4" />
            </motion.button>
          </div>

          {/* Sparkles around promocode - reduced for mobile */}
          {Array.from({ length: screenWidth < 768 ? 6 : 8 }, (_, sparkleIndex) => (
            <motion.div
              key={sparkleIndex}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 360],
                x: [0, Math.cos(sparkleIndex * 60) * (screenWidth < 768 ? 20 : 30), 0],
                y: [0, Math.sin(sparkleIndex * 60) * (screenWidth < 768 ? 20 : 30), 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: sparkleIndex * 0.2,
              }}
              className="absolute mobile:w-1.5 mobile:h-1.5 w-2 h-2 bg-yellow-300 rounded-full pointer-events-none"
              style={{
                boxShadow: "0 0 10px #fde047",
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

// Rocket Badge Animation Component
const RocketBadgeAnimation = ({ isActive, onComplete, promocodes, onCopyPromo, copiedPromos }) => {
  const [currentRocketIndex, setCurrentRocketIndex] = useState(0)
  const [showingFireworks, setShowingFireworks] = useState([])
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showCloseButton, setShowCloseButton] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [rocketPositions, setRocketPositions] = useState([])

  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1920
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 1080

  useEffect(() => {
    if (promocodes.length > 0) {
      const positions = generatePositionsForScreen(promocodes.length)
      setRocketPositions(positions)
    }
  }, [promocodes.length])

  useEffect(() => {
    if (isActive && promocodes.length > 0 && !hasTriggered) {
      setHasTriggered(true)
      fireNextRocket(0)
    }
  }, [isActive, promocodes.length, hasTriggered])

  const fireNextRocket = (rocketIndex) => {
    if (rocketIndex >= promocodes.length) {
      setTimeout(() => {
        setAnimationComplete(true)
        onComplete()
      }, 1000)
      return
    }

    const position = rocketPositions[rocketIndex] || { x: 0, y: 0 }
    const burstPosition = {
      x: screenWidth / 2 + position.x,
      y: screenHeight / 2 + position.y,
    }

    setShowingFireworks((prev) => [
      ...prev,
      {
        index: rocketIndex,
        startPosition: { x: screenWidth / 2, y: screenHeight - 100 },
        endPosition: burstPosition,
        burstPosition: burstPosition,
        colors: {
          primary: ["#ff6b35", "#e74c3c", "#f39c12", "#e67e22"][rocketIndex % 4],
          secondary: ["#ff8c42", "#ec7063", "#f4d03f", "#eb984e"][rocketIndex % 4],
          tertiary: ["#ffad5a", "#f1948a", "#f7dc6f", "#f0b27a"][rocketIndex % 4],
          center: ["#ff6b35", "#e74c3c", "#f39c12", "#e67e22"][rocketIndex % 4],
          burst: [
            ["#ff6b35", "#ff8c42", "#ffad5a", "#ffc971", "#ffe066"],
            ["#e74c3c", "#ec7063", "#f1948a", "#f5b7b1", "#fadbd8"],
            ["#f39c12", "#f4d03f", "#f7dc6f", "#f8c471", "#fad7a0"],
            ["#e67e22", "#eb984e", "#f0b27a", "#f5cba7", "#fdebd0"],
          ][rocketIndex % 4],
          sparkles: [
            ["#ffffff", "#fff3cd", "#ffe066", "#ffad5a"],
            ["#ffffff", "#fdf2e9", "#f5b7b1", "#ec7063"],
            ["#ffffff", "#fef9e7", "#f8c471", "#f4d03f"],
            ["#ffffff", "#fef5e7", "#f5cba7", "#eb984e"],
          ][rocketIndex % 4],
        },
        promocode: promocodes[rocketIndex],
      },
    ])

    if (rocketIndex === 0) {
      setShowCloseButton(true)
    }

    // Fire next rocket after 3 seconds
    setTimeout(() => {
      fireNextRocket(rocketIndex + 1)
    }, 3000)
  }

  const handleCloseAll = () => {
    setShowingFireworks([])
    setShowCloseButton(false)
    promocodes.forEach((promo) => {
      if (!copiedPromos.includes(promo.code)) {
        onCopyPromo(promo.code)
      }
    })
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-40"
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
              className="fixed mobile:top-24 mobile:right-4 hundred:mt-3 tab:mt-3 tab:h-14 tab:w-14 top-8 right-8 z-50 pointer-events-auto mobile:w-10 mobile:h-10 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300"
              style={{
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
              }}
            >
              <X className="mobile:w-5 mobile:h-5 tab:h-8 tab:w-8 w-6 h-6" />
            </motion.button>
          )}

          {/* Firework Animations */}
          {showingFireworks.map((firework) => (
            <ModernFireworkAnimation
              key={`firework-${firework.index}`}
              delay={0}
              startPosition={firework.startPosition}
              endPosition={firework.endPosition}
              burstPosition={firework.burstPosition}
              colors={firework.colors}
              promocode={firework.promocode}
              onCopyPromo={onCopyPromo}
              copiedPromos={copiedPromos}
            />
          ))}

          {/* Shop Now Button - appears after animation */}
          {animationComplete && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="fixed mobile:bottom-22 mobile:right-4 bottom-8 right-8 z-50 pointer-events-auto"
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
          <img src={need} alt="image" />
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
  const [showRocketAnimation, setShowRocketAnimation] = useState(false)
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

  const handleRocketClick = () => {
    setShowRocketAnimation(true)
  }

  const handleRocketComplete = () => {
    // Animation completed
  }

  const handleCopyPromo = (code) => {
    setCopiedPromos((prev) => [...prev, code])
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
        .then((data) => setFastRunningProducts(data.data.filter((p) => p.fast_running === true)))
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

      {/* Rocket Badge - Now at bottom */}
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
          {/* Rocket Badge */}
          <motion.button
            whileHover={{ scale: 1.15, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRocketClick}
            className="relative mobile:-translate-y-16 bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 overflow-hidden border-4 border-white rounded-full"
            style={{
              width: window.innerWidth < 768 ? "80px" : "100px",
              height: window.innerWidth < 768 ? "80px" : "100px",
            }}
          >
            {/* Rocket Emoji */}
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="text-4xl md:text-5xl"
            >
              🚀
            </motion.div>
            {/* Label */}
            <div className="absolute mobile:-bottom-10 -bottom-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white mobile:px-3 mobile:py-1 px-6 py-2 rounded-full mobile:text-xs text-sm font-bold whitespace-nowrap shadow-xl border-2 border-white">
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
              <span className="font-black tracking-wider">M N C</span>
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
                💥
              </motion.div>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Rocket Badge Animation */}
      <RocketBadgeAnimation
        isActive={showRocketAnimation}
        onComplete={handleRocketComplete}
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
                        className="w-[100%] h-[100%]"
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
                  src={about || "/placeholder.svg"}
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
                  Madhu Nisha Crackers has been a well-known Fireworks Store in Sivakasi. What started out as a hobby
                  has become our passion for creating magical moments.
                </p>
                <p>
                  We offer quality products, unparalleled service, and the most competitive prices in town, ensuring
                  every celebration becomes unforgettable. And also ensure we do business with best crackers
                </p>
                <p>
                  Trusted name among top companies in the Sivakasi fireworks business — manufacturing, wholesaling, and
                  retailing traditional and modern fireworks. And selling out best crackers in Sivakasi.
                </p>
                <h4 className="text-orange-500 inline-flex items-center gap-1"><AlertTriangle />We don't usually support online shopping, Every products displayed here are for your references...</h4>
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
                    Pernayakkanpatti
                    <br />
                    Kil Thayilapatti, Sivakasi
                  </p>
                  <div className="mt-5">
                    <p className="text-white font-medium">Office Address</p>
                    <p className="text-gray-300 mt-2">
                      <br />
                      Sivagamipuram Colony, Viswanatham panchayat.,
                      <br />
                      Sivakasi
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Phone</h4>
                  <a href="tel:+919487524689" className="text-gray-300 hover:text-orange-400 transition-colors block">
                    +91 94875 24689
                  </a>
                  <a href="tel:+919487594689" className="text-gray-300 hover:text-orange-400 transition-colors block">
                    +91 94875 94689
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