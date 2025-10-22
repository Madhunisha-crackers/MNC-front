import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Navbar from "../Component/Navbar"
import { API_BASE_URL } from "../../Config"

const Status = () => {
  const [searchForm, setSearchForm] = useState({
    customer_name: "",
    mobile_number: "",
  })
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [expandedTimelines, setExpandedTimelines] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === "mobile_number") {
      const cleaned = value.replace(/\D/g, "").slice(-10)
      setSearchForm((prev) => ({ ...prev, [name]: cleaned }))
    } else {
      setSearchForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const toggleTimeline = (orderId) => {
    setExpandedTimelines((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const searchOrders = async () => {
    if (!searchForm.customer_name.trim() || !searchForm.mobile_number.trim()) {
      alert("Please enter both name and mobile number")
      return
    }

    if (searchForm.mobile_number.length !== 10) {
      alert("Please enter a valid 10-digit mobile number")
      return
    }

    setIsLoading(true)
    try {
      const [bookingsRes, quotationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/direct/bookings/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: searchForm.customer_name.trim(),
            mobile_number: searchForm.mobile_number,
          }),
        }),
        fetch(`${API_BASE_URL}/api/direct/quotations/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: searchForm.customer_name.trim(),
            mobile_number: searchForm.mobile_number,
          }),
        }),
      ])

      const [bookingsData, quotationsData] = await Promise.all([bookingsRes.json(), quotationsRes.json()])

      const allOrders = [
        ...(Array.isArray(bookingsData) ? bookingsData.map((order) => ({ ...order, type: "booking" })) : []),
        ...(Array.isArray(quotationsData) ? quotationsData.map((order) => ({ ...order, type: "quotation" })) : []),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setOrders(allOrders)
      setHasSearched(true)
    } catch (error) {
      console.error("Error searching orders:", error)
      alert("Error searching orders. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "confirmed":
        return "text-blue-600 bg-blue-100"
      case "packed":
        return "text-purple-600 bg-purple-100"
      case "dispatched":
        return "text-orange-600 bg-orange-100"
      case "delivered":
        return "text-green-600 bg-green-100"
      case "booked":
        return "text-green-600 bg-green-100"
      case "canceled":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "packed":
        return <Package className="w-4 h-4" />
      case "dispatched":
        return <Truck className="w-4 h-4" />
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      case "booked":
        return <CheckCircle className="w-4 h-4" />
      case "canceled":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getOrderTimeline = (order) => {
    const timeline = [
      {
        status: "Order Placed",
        date: order.created_at,
        completed: true,
        icon: <Package className="w-4 h-4" />,
      },
    ]

    if (
      order.status === "confirmed" ||
      order.status === "packed" ||
      order.status === "dispatched" ||
      order.status === "delivered" ||
      order.status === "booked"
    ) {
      timeline.push({
        status: "Confirmed",
        date: order.updated_at || order.created_at,
        completed: true,
        icon: <CheckCircle className="w-4 h-4" />,
      })
    }

    if (order.status === "packed" || order.status === "dispatched" || order.status === "delivered") {
      timeline.push({
        status: "Packed",
        date: order.processing_date || order.updated_at,
        completed: true,
        icon: <Package className="w-4 h-4" />,
      })
    }

    if (order.status === "dispatched" || order.status === "delivered") {
      timeline.push({
        status: "Dispatched",
        date: order.dispatch_date || order.updated_at,
        completed: true,
        icon: <Truck className="w-4 h-4" />,
        transport: {
          company: order.transport_name,
          tracking_number: order.lr_number,
          driver_contact: order.transport_contact,
        },
      })
    }

    if (order.status === "delivered") {
      timeline.push({
        status: "Delivered",
        date: order.delivery_date || order.updated_at,
        completed: true,
        icon: <CheckCircle className="w-4 h-4" />,
      })
    }

    return timeline
  }

  const downloadInvoice = async (order) => {
    try {
      const endpoint =
        order.type === "booking"
          ? `/api/direct/invoice/${order.order_id}`
          : `/api/direct/quotation/${order.quotation_id}`

      const response = await fetch(`${API_BASE_URL}${endpoint}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute(
        "download",
        `${order.customer_name}-${order.order_id || order.quotation_id}.pdf`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading invoice:", error)
      alert("Error downloading invoice. Please try again.")
    }
  }

  const formatPrice = (price) => {
    const num = Number.parseFloat(price)
    return isNaN(num) ? "0.00" : num.toFixed(2)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Navbar />
      <main className="hundred:pt-48 mobile:pt-34 px-4 sm:px-8 max-w-7xl mx-auto mobile:mb-32 hundred:mb-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 mobile:-mt-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Track Your Orders</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Enter your details to track your orders and quotations</p>
          </div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6 mb-8 max-w-md mx-auto"
          >
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="customer_name"
                  placeholder="Enter your full name"
                  value={searchForm.customer_name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="mobile_number"
                  placeholder="Enter your mobile number"
                  value={searchForm.mobile_number}
                  onChange={handleInputChange}
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={searchOrders}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Track Orders
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Orders List */}
          <AnimatePresence>
            {hasSearched && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
                    <p className="text-gray-500">
                      No orders found with the provided details. Please check your name and mobile number.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Orders ({orders.length})</h2>
                    {orders.map((order) => (
                      <motion.div
                        key={`${order.type}-${order.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-lg border border-orange-100 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-800">
                                  {order.type === "booking"
                                    ? `Order #${order.order_id}`
                                    : `Quote #${order.quotation_id}`}
                                </h3>
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} flex items-center gap-1`}
                                >
                                  {getStatusIcon(order.status)}
                                  {order.status?.toUpperCase() || "PENDING"}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(order.created_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {order.district}, {order.state}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4 md:mt-0">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-orange-600">₹{formatPrice(order.total)}</p>
                              </div>
                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => downloadInvoice(order)}
                                  className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl"
                                >
                                  <Download className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => toggleTimeline(`${order.type}-${order.id}`)}
                                  className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-xl"
                                >
                                  {expandedTimelines[`${order.type}-${order.id}`] ? (
                                    <ChevronUp className="w-5 h-5" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5" />
                                  )}
                                </motion.button>
                              </div>
                            </div>
                          </div>

                          {/* Order Timeline */}
                          <AnimatePresence>
                            {expandedTimelines[`${order.type}-${order.id}`] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6 overflow-hidden"
                              >
                                <h4 className="text-sm font-semibold text-gray-700 mb-4">Order Timeline</h4>
                                <div className="relative">
                                  {getOrderTimeline(order).map((step, index, array) => (
                                    <div key={index} className="flex items-start gap-4 pb-4 last:pb-0">
                                      <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                          step.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                                        }`}
                                      >
                                        {step.icon}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <p
                                            className={`text-sm font-medium ${
                                              step.completed ? "text-gray-800" : "text-gray-500"
                                            }`}
                                          >
                                            {step.status}
                                          </p>
                                          {step.date && <p className="text-xs text-gray-500">{formatDate(step.date)}</p>}
                                        </div>
                                      </div>
                                      {index < array.length - 1 && (
                                        <div
                                          className={`absolute left-4 top-8 w-0.5 h-8 ${
                                            step.completed ? "bg-green-200" : "bg-gray-200"
                                          }`}
                                          style={{ marginTop: "0px" }}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </>
  )
}

export default Status