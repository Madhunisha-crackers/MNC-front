import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"
import { Sparkles } from 'lucide-react'
import { useSwipeable } from "react-swipeable"

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
              src={mediaItems[currentIndex] || "/placeholder.svg?height=192&width=300&query=firecracker"}
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

export default ModernCarousel
