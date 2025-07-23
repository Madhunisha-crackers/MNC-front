"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaPlus, FaMinus, FaArrowLeft, FaArrowRight, FaInfoCircle } from "react-icons/fa"
import { ShoppingCart, Search, Filter, X, Sparkles, CheckCircle, Download } from "lucide-react"
import { useSwipeable } from "react-swipeable"
import Navbar from "../Component/Navbar"
import { API_BASE_URL } from "../../Config"
import "../App.css"

const RocketCrackerLoader = ({ onComplete }) => {
  const [stage, setStage] = useState("flying") // 'flying', 'burst', 'success'

  useEffect(() => {
    const timer1 = setTimeout(() => setStage("burst"), 1800)
    const timer2 = setTimeout(() => setStage("success"), 2300)
    const timer3 = setTimeout(() => {
      if (onComplete) onComplete()
    }, 4800) // Auto-close after showing success message for 2.5 seconds

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/60 backdrop-blur-sm">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Rocket Line Animation */}
        <AnimatePresence>
          {stage === "flying" && (
            <motion.div
              initial={{ y: 300, x: -200, rotate: 45 }}
              animate={{ y: 0, x: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="relative"
            >
              {/* Rocket Body - Simple Line Design */}
              <motion.div
                animate={{
                  scaleY: [1, 1.1, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{ duration: 0.15, repeat: 12 }}
                className="relative"
              >
                {/* Main rocket body */}
                <div className="w-1 h-16 bg-gradient-to-t from-gray-400 via-gray-300 to-gray-200 rounded-full relative">
                  {/* Rocket tip */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
                  {/* Rocket fins */}
                  <div className="absolute -bottom-1 -left-1 w-0 h-0 border-t-3 border-r-2 border-t-orange-500 border-r-transparent"></div>
                  <div className="absolute -bottom-1 -right-1 w-0 h-0 border-t-3 border-l-2 border-t-orange-500 border-l-transparent"></div>
                </div>
              </motion.div>

              {/* Enhanced Rocket trail */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7, 1, 0] }}
                transition={{ duration: 0.2, repeat: 9 }}
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
              >
                <div className="w-3 h-12 bg-gradient-to-t from-orange-600 via-yellow-400 to-red-500 rounded-full opacity-80"></div>
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-gradient-to-t from-yellow-300 to-white rounded-full"></div>
              </motion.div>

              {/* Smoke particles */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    scale: [0, 1, 1.5],
                    y: [0, -20 - i * 5],
                    x: [0, (i % 2 === 0 ? -1 : 1) * (5 + i)],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: 2,
                    delay: i * 0.1,
                  }}
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Burst Effect */}
        <AnimatePresence>
          {stage === "burst" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-[110]"
            >
              {/* Central massive burst */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 3, 2] }}
                transition={{ duration: 0.6 }}
                className="w-24 h-24 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 rounded-full relative z-[110] shadow-2xl"
              />

              {/* Large sparkles - first ring */}
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    rotate: 0,
                  }}
                  animate={{
                    scale: [0, 2, 0],
                    x: Math.cos((i * 22.5 * Math.PI) / 180) * 150,
                    y: Math.sin((i * 22.5 * Math.PI) / 180) * 150,
                    rotate: 360,
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.1 + i * 0.03,
                    ease: "easeOut",
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[110]"
                >
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                </motion.div>
              ))}

              {/* Medium sparkles - second ring */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={`medium-${i}`}
                  initial={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    rotate: 0,
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    x: Math.cos((i * 30 * Math.PI) / 180) * 200,
                    y: Math.sin((i * 30 * Math.PI) / 180) * 200,
                    rotate: -360,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.2 + i * 0.04,
                    ease: "easeOut",
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[110]"
                >
                  <Sparkles className="w-6 h-6 text-orange-300" />
                </motion.div>
              ))}

              {/* Large particle effects */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  initial={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 1,
                  }}
                  animate={{
                    scale: [0, 2, 0],
                    x: Math.cos((i * 18 * Math.PI) / 180) * (180 + Math.random() * 100),
                    y: Math.sin((i * 18 * Math.PI) / 180) * (180 + Math.random() * 100),
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 1.4,
                    delay: 0.15 + i * 0.02,
                    ease: "easeOut",
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[110]"
                >
                  <div className="w-4 h-4 bg-gradient-to-br from-yellow-200 to-orange-400 rounded-full shadow-lg"></div>
                </motion.div>
              ))}

              {/* Shockwave effect */}
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 8, opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-4 border-yellow-300 rounded-full z-[110]"
              />

              <motion.div
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 12, opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-orange-300 rounded-full z-[110]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Success Message */}
        <AnimatePresence>
          {stage === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.3, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -30 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                duration: 0.6,
              }}
              className="text-center z-[110]"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
                className="w-32 h-32 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 400 }}
                >
                  <CheckCircle className="w-16 h-16 text-white" />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-5xl font-bold text-white mb-6 tracking-wide"
              >
                BOOKED!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="text-white/90 text-xl mb-6"
              >
                Your order has been successfully placed
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="flex items-center justify-center gap-3 text-yellow-300 text-lg"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <span className="font-semibold">Thank you for choosing MN Crackers!</span>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const ToasterNotification = ({ show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: 100 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -100, x: 100 }}
          className="fixed top-20 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-green-200 p-4 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1">Download Complete!</h4>
              <p className="text-sm text-gray-600">Estimate bill downloaded. Please check your file explorer.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const SuccessAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-12 h-12 text-white" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-bold text-gray-800 mb-4"
      >
        Order Booked!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-gray-600 mb-6"
      >
        Your order has been successfully placed. We'll contact you within 24 hours.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-center gap-2 text-orange-600"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">Thank you for choosing MN Crackers!</span>
        <Sparkles className="w-5 h-5" />
      </motion.div>
    </motion.div>
  </motion.div>
)

const ModernCarousel = ({ media, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
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
      return (isAImage ? 0 : isAGif ? 1 : isAVideo ? 2 : 3) - (isBImage ? 0 : isBGif ? 1 : isBVideo ? 2 : 3)
    })
  }, [media])

  const isVideo = (item) => typeof item === "string" && item.startsWith("data:video/")

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1)),
    onSwipedRight: () => setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1)),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    trackTouch: true,
  })

  if (!mediaItems.length) {
    return (
      <div className="w-full h-48 rounded-2xl mb-4 overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center border border-orange-200">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <p className="text-orange-600 font-medium text-sm">No media available</p>
        </div>
      </div>
    )
  }

  return (
    <div
      {...handlers}
      className="relative w-full h-48 rounded-2xl mb-4 overflow-hidden group bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 cursor-pointer"
      onClick={() => onImageClick && onImageClick(media)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {isVideo(mediaItems[currentIndex]) ? (
            <video
              src={mediaItems[currentIndex]}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <img
              src={mediaItems[currentIndex] || "/placeholder.svg"}
              alt="Product"
              className="w-full h-full object-cover rounded-2xl"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {mediaItems.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
          >
            <FaArrowLeft className="text-orange-600 text-sm" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
          >
            <FaArrowRight className="text-orange-600 text-sm" />
          </motion.button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {mediaItems.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-white shadow-lg" : "bg-white/50 hover:bg-white/75"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const Pricelist = () => {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showMinOrderModal, setShowMinOrderModal] = useState(false)
  const [minOrderMessage, setMinOrderMessage] = useState("")
  const [showToaster, setShowToaster] = useState(false)
  const [customerDetails, setCustomerDetails] = useState({
    customer_name: "",
    address: "",
    district: "",
    state: "",
    mobile_number: "",
    email: "",
    customer_type: "User",
  })
  const [selectedType, setSelectedType] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [promocode, setPromocode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [promocodes, setPromocodes] = useState([])
  const [originalTotal, setOriginalTotal] = useState(0)
  const [totalDiscount, setTotalDiscount] = useState(0)
  const [showLoader, setShowLoader] = useState(false)
  const debounceTimeout = useRef(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const formatPrice = (price) => {
    const num = Number.parseFloat(price)
    return Number.isInteger(num) ? num.toString() : num.toFixed(2)
  }

  useEffect(() => {
    const savedCart = localStorage.getItem("firecracker-cart")
    if (savedCart) setCart(JSON.parse(savedCart))
    fetch(`${API_BASE_URL}/api/locations/states`)
      .then((res) => res.json())
      .then((data) => setStates(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching states:", err))
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data.filter((p) => p.status === "on")))
      .catch((err) => console.error("Error loading products:", err))
    fetch(`${API_BASE_URL}/api/promocodes`)
      .then((res) => res.json())
      .then((data) => setPromocodes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching promocodes:", err))
  }, [])

  useEffect(() => {
    if (customerDetails.state) {
      fetch(`${API_BASE_URL}/api/locations/states/${customerDetails.state}/districts`)
        .then((res) => res.json())
        .then((data) => setDistricts(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching districts:", err))
    }
  }, [customerDetails.state])

  useEffect(() => localStorage.setItem("firecracker-cart", JSON.stringify(cart)), [cart])

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(() => {
      if (promocode && promocode !== "custom") handleApplyPromo(promocode)
      else setAppliedPromo(null)
    }, 500)
    return () => clearTimeout(debounceTimeout.current)
  }, [promocode])

  const addToCart = useCallback((product) => {
    if (!product || !product.serial_number) return console.error("Invalid product or missing serial_number:", product)
    setCart((prev) => ({ ...prev, [product.serial_number]: (prev[product.serial_number] || 0) + 1 }))
  }, [])

  const removeFromCart = useCallback((product) => {
    if (!product || !product.serial_number) return console.error("Invalid product or missing serial_number:", product)
    setCart((prev) => {
      const count = (prev[product.serial_number] || 1) - 1
      const updated = { ...prev }
      if (count <= 0) delete updated[product.serial_number]
      else updated[product.serial_number] = count
      return updated
    })
  }, [])

  const updateCartQuantity = useCallback((product, quantity) => {
    if (!product?.serial_number) return console.error("Invalid product or missing serial_number:", product)
    if (quantity < 0) quantity = 0
    setCart((prev) => {
      const updated = { ...prev }
      if (quantity === 0) delete updated[product.serial_number]
      else updated[product.serial_number] = quantity
      return updated
    })
  }, [])

  const handleFinalCheckout = async () => {
    // Close any error modals first
    setShowMinOrderModal(false)

    setShowLoader(true)
    const order_id = `ORD-${Date.now()}`
    const selectedProducts = Object.entries(cart).map(([serial, qty]) => {
      const product = products.find((p) => p.serial_number === serial)
      return {
        id: product.id,
        product_type: product.product_type,
        quantity: qty,
        per: product.per,
        image: product.image,
        price: product.price,
        discount: product.discount,
        serial_number: product.serial_number,
        productname: product.productname,
        status: product.status,
      }
    })

    if (!selectedProducts.length) return setShowLoader(false), showError("Your cart is empty.")
    if (!customerDetails.customer_name) return setShowLoader(false), showError("Customer name is required.")
    if (!customerDetails.address) return setShowLoader(false), showError("Address is required.")
    if (!customerDetails.district) return setShowLoader(false), showError("District is required.")
    if (!customerDetails.state) return setShowLoader(false), showError("Please select a state.")

    const mobile = customerDetails.mobile_number.replace(/\D/g, "").slice(-10)
    if (mobile.length !== 10) return setShowLoader(false), showError("Mobile number must be 10 digits.")

    const selectedState = customerDetails.state?.trim()
    const minOrder = states.find((s) => s.name === selectedState)?.min_rate
    if (minOrder && Number.parseFloat(originalTotal) < minOrder)
      return (
        setShowLoader(false),
        showError(`Minimum order for ${selectedState} is ₹${minOrder}. Your total is ₹${originalTotal}.`)
      )

    try {
      const response = await fetch(`${API_BASE_URL}/api/direct/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id,
          products: selectedProducts,
          net_rate: Number.parseFloat(totals.net),
          you_save: Number.parseFloat(totals.save),
          total: Number.parseFloat(totals.total),
          promo_discount: Number.parseFloat(totals.promo_discount || "0.00"),
          customer_type: customerDetails.customer_type,
          customer_name: customerDetails.customer_name,
          address: customerDetails.address,
          mobile_number: mobile,
          email: customerDetails.email,
          district: customerDetails.district,
          state: customerDetails.state,
          promocode: appliedPromo?.code || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Download PDF immediately
        const pdfResponse = await fetch(`${API_BASE_URL}/api/direct/invoice/${data.order_id}`, { responseType: "blob" })
        const blob = await pdfResponse.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        const safeCustomerName = (customerDetails.customer_name || "unknown")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
        link.setAttribute("download", `${safeCustomerName}-${data.order_id}.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        // The rocket animation will auto-close and trigger handleRocketComplete
      } else {
        setShowLoader(false)
        const data = await response.json()
        showError(data.message || "Booking failed.")
      }
    } catch (err) {
      setShowLoader(false)
      console.error("Checkout error:", err)
      showError("Something went wrong during checkout.")
    }
  }

  // Add new function to handle rocket animation completion
  const handleRocketComplete = () => {
    setShowLoader(false)

    // Close all modals
    setIsCartOpen(false)
    setShowModal(false)
    setShowDetailsModal(false)
    setShowMinOrderModal(false)

    // Reset form data
    setCart({})
    setCustomerDetails({
      customer_name: "",
      address: "",
      district: "",
      state: "",
      mobile_number: "",
      email: "",
      customer_type: "User",
    })
    setAppliedPromo(null)
    setPromocode("")
    setOriginalTotal(0)
    setTotalDiscount(0)

    // Show toaster notification after a brief delay
    setTimeout(() => {
      setShowToaster(true)
    }, 500)
  }

  const showError = (message) => {
    setMinOrderMessage(message)
    setShowMinOrderModal(true)
    setTimeout(() => setShowMinOrderModal(false), 5000)
  }

  const handleCheckoutClick = () =>
    Object.keys(cart).length ? (setShowModal(true), setIsCartOpen(false)) : showError("Your cart is empty.")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === "mobile_number") {
      const cleaned = value.replace(/\D/g, "").slice(-10)
      setCustomerDetails((prev) => ({ ...prev, [name]: cleaned }))
    } else {
      setCustomerDetails((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleShowDetails = useCallback((product) => {
    setSelectedProduct(product)
    setShowDetailsModal(true)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setSelectedProduct(null)
    setShowDetailsModal(false)
  }, [])

  const handleImageClick = useCallback((media) => {
    const mediaItems = media && typeof media === "string" ? JSON.parse(media) : Array.isArray(media) ? media : []
    setSelectedImages(mediaItems)
    setCurrentImageIndex(0)
    setShowImageModal(true)
  }, [])

  const handleCloseImageModal = useCallback(() => {
    setShowImageModal(false)
    setSelectedImages([])
    setCurrentImageIndex(0)
  }, [])

  const handleApplyPromo = useCallback(
    async (code) => {
      if (!code) return setAppliedPromo(null)
      try {
        const res = await fetch(`${API_BASE_URL}/api/promocodes`)
        const promos = await res.json()
        const found = promos.find((p) => p.code.toLowerCase() === code.toLowerCase())
        if (!found) {
          showError("Invalid promocode.")
          setAppliedPromo(null)
          return
        }
        if (found.min_amount && Number.parseFloat(originalTotal) < found.min_amount) {
          showError(`Minimum order amount for this promocode is ₹${found.min_amount}. Your total is ₹${originalTotal}.`)
          setAppliedPromo(null)
          return
        }
        if (found.end_date && new Date(found.end_date) < new Date()) {
          showError("This promocode has expired.")
          setAppliedPromo(null)
          return
        }
        setAppliedPromo(found)
      } catch (err) {
        console.error("Promo apply error:", err)
        showError("Could not validate promocode.")
        setAppliedPromo(null)
      }
    },
    [originalTotal],
  )

  const totals = useMemo(() => {
    let net = 0,
      save = 0,
      total = 0
    for (const serial in cart) {
      const qty = cart[serial]
      const product = products.find((p) => p.serial_number === serial)
      if (!product) continue
      const originalPrice = Number.parseFloat(product.price)
      const discount = originalPrice * (product.discount / 100)
      const priceAfterDiscount = originalPrice - discount
      net += originalPrice * qty
      save += discount * qty
      total += priceAfterDiscount * qty
    }
    setOriginalTotal(total)
    setTotalDiscount(save)
    let promoDiscount = 0
    if (appliedPromo) {
      promoDiscount = (total * appliedPromo.discount) / 100
      total -= promoDiscount
      save += promoDiscount
    }
    return {
      net: formatPrice(net),
      save: formatPrice(save),
      total: formatPrice(total),
      promo_discount: formatPrice(promoDiscount),
    }
  }, [cart, products, appliedPromo])

  const productTypes = useMemo(
    () => ["All", ...new Set(products.map((p) => (p.product_type || "Others").replace(/_/g, " ")).sort())],
    [products],
  )

  const grouped = useMemo(
    () =>
      products
        .filter(
          (p) =>
            p.product_type !== "gift_box_dealers" &&
            (selectedType === "All" || p.product_type === selectedType.replace(/ /g, "_")) &&
            (!searchTerm ||
              p.productname.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.serial_number.toLowerCase().includes(searchTerm.toLowerCase())),
        )
        .reduce((acc, p) => {
          const key = p.product_type || "Others"
          acc[key] = acc[key] || []
          acc[key].push(p)
          return acc
        }, {}),
    [products, selectedType, searchTerm],
  )

  return (
    <>
      <Navbar />
      <ToasterNotification show={showToaster} onClose={() => setShowToaster(false)} />
      <AnimatePresence>
        {showLoader && <RocketCrackerLoader onComplete={handleRocketComplete} />}
        {showSuccess && <SuccessAnimation />}
        {showMinOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-96 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Oops!</h3>
              <p className="text-gray-600 mb-6">{minOrderMessage}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMinOrderModal(false)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-2xl"
              >
                Got it
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        {showDetailsModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedProduct.productname}</h2>
                    <div className="flex items-center gap-2">
                      {selectedProduct.discount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {selectedProduct.discount}% OFF
                        </span>
                      )}
                      <span className="text-orange-600 font-semibold text-lg">
                        ₹{formatPrice(selectedProduct.price * (1 - selectedProduct.discount / 100))} /{" "}
                        {selectedProduct.per}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCloseDetails}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
                <ModernCarousel media={selectedProduct.image} onImageClick={handleImageClick} />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">
                      {selectedProduct.description ||
                        "Experience the magic of celebrations with our premium quality fireworks."}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        addToCart(selectedProduct)
                        handleCloseDetails()
                      }}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Add to Cart
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCloseDetails}
                      className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mobile:max-w-md mobile:w-[90%] onefifty:max-w-[90%] mx-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-orange-100 ">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                  Your Cart
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {Object.keys(cart).length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  Object.entries(cart).map(([serial, qty]) => {
                    const product = products.find((p) => p.serial_number === serial)
                    if (!product) return null
                    const discount = (product.price * product.discount) / 100
                    const priceAfterDiscount = formatPrice(product.price - discount)
                    const imageSrc =
                      (product.image && typeof product.image === "string"
                        ? JSON.parse(product.image)
                        : Array.isArray(product.image)
                          ? product.image
                          : []
                      ).filter(
                        (item) =>
                          !item.startsWith("data:video/") &&
                          !item.startsWith("data:image/gif") &&
                          !item.toLowerCase().endsWith(".gif"),
                      )[0] || "/placeholder.svg"
                    return (
                      <motion.div
                        key={serial}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100"
                      >
                        <img
                          src={imageSrc || "/placeholder.svg"}
                          alt={product.productname}
                          className="w-20 h-20 rounded-xl object-cover bg-white"
                        />
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-800 line-clamp-2">{product.productname}</p>
                          <p className="text-sm text-orange-600 font-bold">
                            ₹{priceAfterDiscount} x {qty}
                          </p>
                          <p className="text-xs text-gray-600">
                            Subtotal: ₹{formatPrice((product.price - discount) * qty)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(product)}
                            className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center"
                          >
                            <FaMinus className="w-4 h-4" />
                          </motion.button>
                          <motion.input
                            key={qty}
                            type="number"
                            value={qty}
                            onChange={(e) => updateCartQuantity(product, Number.parseInt(e.target.value) || 0)}
                            min="0"
                            className="text-sm font-medium w-8 text-center bg-transparent border-none focus:outline-none"
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addToCart(product)}
                            className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center"
                          >
                            <FaPlus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
              <div className="p-6 border-t border-orange-100 bg-white rounded-b-3xl">
                <div className="mb-4 p-3 bg-orange-50 rounded-2xl border border-orange-200">
                  <p className="text-xs font-medium text-orange-800 mb-2 text-center">Minimum Purchase Rates</p>
                  <div className="text-xs text-orange-700 overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap">
                      {states.map((s) => `${s.name}: ₹${s.min_rate}`).join(" • ")}
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promocode</label>
                  <select
                    value={promocode}
                    onChange={(e) => setPromocode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-orange-200 text-sm focus:ring-2 focus:ring-orange-400 transition-all duration-300"
                  >
                    <option value="">Select Promocode</option>
                    {promocodes.map((promo) => (
                      <option key={promo.id} value={promo.code}>
                        {promo.code} ({promo.discount}% OFF{promo.min_amount ? `, Min: ₹${promo.min_amount}` : ""}
                        {promo.end_date ? `, Exp: ${new Date(promo.end_date).toLocaleDateString()}` : ""})
                      </option>
                    ))}
                    <option value="custom">Enter custom code</option>
                  </select>
                  {promocode === "custom" && (
                    <input
                      type="text"
                      value={promocode === "custom" ? "" : promocode}
                      onChange={(e) => setPromocode(e.target.value)}
                      placeholder="Enter custom code"
                      className="w-full px-3 py-2 mt-2 rounded-xl border border-orange-200 text-sm focus:ring-2 focus:ring-orange-400 transition-all duration-300"
                    />
                  )}
                  {appliedPromo && (
                    <p className="text-green-600 text-xs mt-1">
                      Applied: {appliedPromo.code} ({appliedPromo.discount}% OFF)
                      {appliedPromo.min_amount && `, Min: ₹${appliedPromo.min_amount}`}
                      {appliedPromo.end_date && `, Expires: ${new Date(appliedPromo.end_date).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-700 space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Net Total:</span>
                    <span>₹{totals.net}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>You Save:</span>
                    <span>₹{totals.save}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Promocode ({appliedPromo.code}):</span>
                      <span>-₹{totals.promo_discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg text-orange-600 pt-2 border-t border-orange-200">
                    <span>Total:</span>
                    <span>₹{totals.total}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCart({})}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl"
                  >
                    Clear Cart
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckoutClick}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-2xl shadow-lg"
                  >
                    Checkout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showImageModal && selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center backdrop-blur-sm"
            onClick={handleCloseImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] w-full mx-4"
            >
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {selectedImages[currentImageIndex]?.startsWith("data:video/") ? (
                      <video
                        src={selectedImages[currentImageIndex]}
                        autoPlay
                        muted
                        loop
                        className="w-full max-h-[80vh] object-contain rounded-2xl"
                      />
                    ) : (
                      <img
                        src={selectedImages[currentImageIndex] || "/placeholder.svg"}
                        alt="Product Image"
                        className="w-full max-h-[80vh] object-contain rounded-2xl"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseImageModal}
                  className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-6 h-6" />
                </motion.button>

                {/* Navigation Buttons */}
                {selectedImages.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setCurrentImageIndex((prev) => (prev === 0 ? selectedImages.length - 1 : prev - 1))
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                    >
                      <FaArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setCurrentImageIndex((prev) => (prev === selectedImages.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                    >
                      <FaArrowRight className="w-5 h-5" />
                    </motion.button>
                  </>
                )}

                {/* Image Counter */}
                {selectedImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                    {currentImageIndex + 1} / {selectedImages.length}
                  </div>
                )}

                {/* Thumbnail Navigation */}
                {selectedImages.length > 1 && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-md overflow-x-auto p-2">
                    {selectedImages.map((image, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? "border-orange-400" : "border-white/30 hover:border-white/60"
                        }`}
                      >
                        {image?.startsWith("data:video/") ? (
                          <video src={image} className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-28 px-4 sm:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm appearance-none cursor-pointer min-w-[200px]"
            >
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {Object.entries(grouped).map(([type, items]) => (
          <motion.div key={type} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 capitalize">{type.replace(/_/g, " ")}</h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-orange-400 to-transparent rounded-full" />
              <span className="text-orange-600 font-semibold bg-orange-100 px-3 py-1 rounded-full text-sm">
                {items.length} items
              </span>
            </div>
            <div className="grid mobile:grid-cols-2 hundred:grid-cols-4 onefifty:grid-cols-3 gap-6">
              {items.map((product) => {
                if (!product) return null
                const originalPrice = Number.parseFloat(product.price)
                const discount = originalPrice * (product.discount / 100)
                const finalPrice =
                  product.discount > 0 ? formatPrice(originalPrice - discount) : formatPrice(originalPrice)
                const count = cart[product.serial_number] || 0
                return (
                  <motion.div
                    key={product.serial_number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-orange-100"
                  >
                    <div className="relative">
                      <ModernCarousel media={product.image} onImageClick={handleImageClick} />
                      {product.discount > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                          {product.discount}% OFF
                        </div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShowDetails(product)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                      >
                        <FaInfoCircle className="text-orange-600" />
                      </motion.button>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-orange-600">
                        {product.productname}
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        {product.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">₹{formatPrice(originalPrice)}</span>
                        )}
                        <span className="text-xl font-bold text-orange-600">₹{finalPrice}</span>
                        <span className="text-sm text-gray-600">/ {product.per}</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <AnimatePresence mode="wait">
                          {count > 0 ? (
                            <motion.div
                              key="quantity-controls"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-1.5 sm:p-2"
                            >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeFromCart(product)}
                                className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
                              >
                                <FaMinus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </motion.button>
                              <motion.input
                                key={count}
                                type="number"
                                value={count}
                                onChange={(e) => updateCartQuantity(product, Number.parseInt(e.target.value) || 0)}
                                min="0"
                                className="text-white font-bold text-sm sm:text-lg px-1 sm:px-2 w-10 sm:w-16 text-center bg-transparent border-none focus:outline-none"
                              />
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => addToCart(product)}
                                className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
                              >
                                <FaPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </motion.button>
                            </motion.div>
                          ) : (
                            <motion.button
                              key="add-button"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => addToCart(product)}
                              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl shadow-lg flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                            >
                              <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Add</span>
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </main>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Details</h2>
                <div className="space-y-4">
                  {["customer_name", "address", "mobile_number", "email"].map((field) => (
                    <input
                      key={field}
                      name={field}
                      type={field === "email" ? "email" : "text"}
                      placeholder={field.replace(/_/g, " ").toUpperCase()}
                      value={customerDetails[field]}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      required={field !== "email"}
                    />
                  ))}
                  <select
                    name="state"
                    value={customerDetails.state}
                    onChange={(e) => setCustomerDetails((prev) => ({ ...prev, state: e.target.value, district: "" }))}
                    className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {customerDetails.state && (
                    <select
                      name="district"
                      value={customerDetails.district}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      required
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promocode</label>
                    <select
                      value={promocode}
                      onChange={(e) => setPromocode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-orange-200 text-sm focus:ring-2 focus:ring-orange-400 transition-all duration-300"
                    >
                      <option value="">Select Promocode</option>
                      {promocodes.map((promo) => (
                        <option key={promo.id} value={promo.code}>
                          {promo.code} ({promo.discount}% OFF{promo.min_amount ? `, Min: ₹${promo.min_amount}` : ""}
                          {promo.end_date ? `, Exp: ${new Date(promo.end_date).toLocaleDateString()}` : ""})
                        </option>
                      ))}
                      <option value="custom">Enter custom code</option>
                    </select>
                    {promocode === "custom" && (
                      <input
                        type="text"
                        value={promocode === "custom" ? "" : promocode}
                        onChange={(e) => setPromocode(e.target.value)}
                        placeholder="Enter custom code"
                        className="w-full px-3 py-2 mt-2 rounded-xl border border-orange-200 text-sm focus:ring-2 focus:ring-orange-400 transition-all duration-300"
                      />
                    )}
                    {appliedPromo && (
                      <p className="text-green-600 text-xs mt-1">
                        Applied: {appliedPromo.code} ({appliedPromo.discount}% OFF)
                        {appliedPromo.min_amount && `, Min: ₹${appliedPromo.min_amount}`}
                        {appliedPromo.end_date && `, Expires: ${new Date(appliedPromo.end_date).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex justify-between">
                      <span>Net Total:</span>
                      <span>₹{totals.net}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>Promocode ({appliedPromo.code}):</span>
                        <span>-₹{totals.promo_discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-green-600">
                      <span>Discount (promocode included):</span>
                      <span>-₹{totals.save}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-orange-600 pt-2 border-t border-orange-200">
                      <span>Total:</span>
                      <span>₹{totals.total}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFinalCheckout}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-2xl shadow-lg"
                  >
                    Confirm Booking
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsCartOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center ${isCartOpen ? "hidden" : ""}`}
      >
        <ShoppingCart className="w-6 h-6" />
        {Object.keys(cart).length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold"
          >
            {Object.values(cart).reduce((a, b) => a + b, 0)}
          </motion.span>
        )}
      </motion.button>
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 15s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </>
  )
}

export default Pricelist
