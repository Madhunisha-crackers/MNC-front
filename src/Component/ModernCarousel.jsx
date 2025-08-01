import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"
import { Sparkles } from 'lucide-react'
import { useSwipeable } from "react-swipeable"
import need from "../../public/default.jpg"

const ModernCarousel = ({ media, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const mediaItems = useMemo(() => {
    // Parse media if it's a JSON string, or use as is if it's an array
    const items = media && typeof media === "string" ? JSON.parse(media) : Array.isArray(media) ? media : []
    return items.sort((a, b) => {
      const aStr = typeof a === "string" ? a.toLowerCase() : ""
      const bStr = typeof b === "string" ? b.toLowerCase() : ""
      // Check for Cloudinary video URLs (containing '/video/' or specific extensions)
      const isAVideo = aStr.includes('/video/') || aStr.endsWith('.mp4') || aStr.endsWith('.webm') || aStr.endsWith('.ogg')
      const isBVideo = bStr.includes('/video/') || bStr.endsWith('.mp4') || bStr.endsWith('.webm') || bStr.endsWith('.ogg')
      // Check for GIFs (by extension or URL pattern)
      const isAGif = aStr.endsWith('.gif')
      const isBGif = bStr.endsWith('.gif')
      // Images are anything else (typically .jpg, .jpeg, .png)
      const isAImage = !isAVideo && !isAGif
      const isBImage = !isBVideo && !isBGif
      // Sort: Images first (0), GIFs second (1), Videos third (2)
      return (isAImage ? 0 : isAGif ? 1 : isAVideo ? 2 : 3) - (isBImage ? 0 : isBGif ? 1 : isBVideo ? 2 : 3)
    })
  }, [media])

  const isVideo = (item) => {
    // Check if the item is a string and contains Cloudinary video URL pattern or video extensions
    return typeof item === "string" && (
      item.includes('/video/') ||
      item.toLowerCase().endsWith('.mp4') ||
      item.toLowerCase().endsWith('.webm') ||
      item.toLowerCase().endsWith('.ogg')
    )
  }

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
          <img src={need} alt="image"/>
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
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=192&width=300&query=firecracker"
              }}
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