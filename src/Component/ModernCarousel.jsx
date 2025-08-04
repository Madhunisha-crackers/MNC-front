import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useSwipeable } from "react-swipeable";
import need from "../default.jpg";

const ModernCarousel = ({ media, onImageClick, isCard = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);

  const mediaItems = useMemo(() => {
    const items = media && typeof media === "string" ? JSON.parse(media) : Array.isArray(media) ? media : [];
    return items.sort((a, b) => {
      const aStr = typeof a === "string" ? a.toLowerCase() : "";
      const bStr = typeof b === "string" ? b.toLowerCase() : "";
      const isAVideo = aStr.includes('/video/') || aStr.endsWith('.mp4') || aStr.endsWith('.webm') || aStr.endsWith('.ogg') || aStr.startsWith("data:video/");
      const isBVideo = bStr.includes('/video/') || bStr.endsWith('.mp4') || bStr.endsWith('.webm') || bStr.endsWith('.ogg') || bStr.startsWith("data:video/");
      const isAGif = aStr.endsWith('.gif') || aStr.startsWith("data:image/gif");
      const isBGif = bStr.endsWith('.gif') || bStr.startsWith("data:image/gif");
      const isAImage = !isAVideo && !isAGif;
      const isBImage = !isBVideo && !isBGif;

      return (isAImage ? 0 : isAGif ? 1 : isAVideo ? 2 : 3) - (isBImage ? 0 : isBGif ? 1 : isBVideo ? 2 : 3);
    });
  }, [media]);

  const isVideo = (item) => {
    return typeof item === "string" && (
      item.includes('/video/') ||
      item.toLowerCase().endsWith('.mp4') ||
      item.toLowerCase().endsWith('.webm') ||
      item.toLowerCase().endsWith('.ogg') ||
      item.startsWith("data:video/")
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1)),
    onSwipedRight: () => setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1)),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    trackTouch: true,
  });

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.touches[0].clientX;
    const diffX = touchStartX.current - touchEndX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
      else setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
      touchStartX.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="w-full h-46 rounded-3xl mb-4 overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center border border-orange-200">
        <div className="text-center">
          <img src={need} alt="Placeholder" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div
      {...handlers}
      className="relative w-full h-48 mobile:h-64 rounded-3xl mb-4 overflow-hidden group bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 cursor-pointer"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => onImageClick && onImageClick(media)}
    >
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
              {...(isCard ? { autoPlay: true, muted: true, loop: true } : { controls: true })}
              className="w-full h-full object-cover rounded-3xl"
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=192&width=300&query=firecracker";
              }}
            />
          ) : (
            <img
              src={mediaItems[currentIndex] || "/placeholder.svg?height=192&width=300&query=firecracker"}
              alt="Product"
              className="w-full h-full object-cover rounded-3xl"
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=192&width=300&query=firecracker";
              }}
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
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
          >
            <FaArrowLeft className="text-orange-600 text-lg" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
          >
            <FaArrowRight className="text-orange-600 text-lg" />
          </motion.button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {mediaItems.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-white shadow-lg" : "bg-white/50 hover:bg-white/75"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ModernCarousel;