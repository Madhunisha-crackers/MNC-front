import { motion } from "framer-motion"
import { Sparkles } from 'lucide-react'

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 mx-auto mb-6"
        >
          <div className="w-full h-full border-4 border-orange-200 border-t-orange-600 rounded-full"></div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-bold text-orange-600 mb-2">Loading Products</h2>
          <p className="text-orange-500">Please wait while we fetch the latest fireworks...</p>
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center justify-center gap-2 text-orange-400"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">MN Crackers</span>
          <Sparkles className="w-5 h-5" />
        </motion.div>
      </div>
    </div>
  )
}

export default LoadingSpinner
