"use client"

import { motion } from "framer-motion"
import { Shield, AlertTriangle, CheckCircle, XCircle, Flame, Droplets, Eye, Users, Heart, Sparkles, MapPin, Phone, Mail, ArrowRight } from "lucide-react"
import Navbar from "../Component/Navbar"
import "../App.css"

const dosData = [
  {
    icon: CheckCircle,
    title: "Follow Instructions",
    description: "Always read and follow the instructions printed on each firework package carefully before use.",
  },
  {
    icon: Shield,
    title: "Buy from Authorized Dealers",
    description: "Purchase fireworks only from licensed and reputable manufacturers like Madhu Nisha Crackers.",
  },
  {
    icon: Eye,
    title: "Use in Open Spaces",
    description: "Light fireworks only in outdoor areas with plenty of open space, away from buildings.",
  },
  {
    icon: Users,
    title: "Maintain Safe Distance",
    description: "Only one person should light fireworks while others maintain a safe distance of at least 10 feet.",
  },
  {
    icon: Droplets,
    title: "Keep Water Ready",
    description: "Always have water buckets or a garden hose nearby for emergency fire suppression.",
  },
  {
    icon: Heart,
    title: "Supervise Children",
    description: "Adult supervision is mandatory when children are around fireworks. Never leave them unattended.",
  },
]

const dontsData = [
  {
    icon: XCircle,
    title: "Don't Make Homemade Fireworks",
    description: "Never attempt to make your own fireworks or modify existing ones - it's extremely dangerous.",
  },
  {
    icon: Flame,
    title: "Don't Relight Duds",
    description: "Never try to relight fireworks that failed to ignite properly. Wait and dispose safely.",
  },
  {
    icon: AlertTriangle,
    title: "Don't Wear Loose Clothing",
    description: "Avoid loose, flowing clothes that can easily catch fire. Wear cotton clothing instead.",
  },
  {
    icon: XCircle,
    title: "Don't Handle Used Fireworks",
    description: "Never pick up or handle fireworks after use - they may still contain active components.",
  },
  {
    icon: Shield,
    title: "Don't Store Improperly",
    description: "Never carry fireworks in pockets or store them near heat sources or in damp places.",
  },
  {
    icon: Eye,
    title: "Don't Use Indoors",
    description: "Never use fireworks inside buildings, near vehicles, or in confined spaces.",
  },
]

const ModernFireworkAnimation = ({ delay = 0, startPosition, endPosition, burstPosition, colors }) => {
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1920
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 1080

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
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 12,
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
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 12,
        }}
      >
        {/* Primary burst particles */}
        {Array.from({ length: 32 }).map((_, i) => {
          const angle = i * 11.25 * (Math.PI / 180)
          const distance = screenWidth * 0.3
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
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 12,
                ease: "easeOut",
              }}
            />
          )
        })}

        {/* Secondary sparkles */}
        {Array.from({ length: 48 }).map((_, i) => {
          const angle = i * 7.5 * (Math.PI / 180)
          const distance = screenWidth * 0.2
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
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 12,
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
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 12,
            ease: "easeOut",
          }}
        />
      </motion.div>
    </div>
  )
}

export default function Safety() {
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1920
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 1080

  const fireworkConfigs = [
    {
      delay: 0,
      startPosition: { x: -50, y: screenHeight * 0.8 },
      endPosition: { x: screenWidth * 0.2, y: screenHeight * 0.3 },
      burstPosition: { x: screenWidth * 0.2, y: screenHeight * 0.3 },
      colors: {
        primary: "#ff6b35",
        secondary: "#ff8c42",
        tertiary: "#ffad5a",
        center: "#ff6b35",
        burst: ["#ff6b35", "#ff8c42", "#ffad5a", "#ffc971", "#ffe066"],
        sparkles: ["#ffffff", "#fff3cd", "#ffe066", "#ffad5a"],
      },
    },
    {
      delay: 3,
      startPosition: { x: screenWidth + 50, y: screenHeight * 0.9 },
      endPosition: { x: screenWidth * 0.8, y: screenHeight * 0.25 },
      burstPosition: { x: screenWidth * 0.8, y: screenHeight * 0.25 },
      colors: {
        primary: "#e74c3c",
        secondary: "#ec7063",
        tertiary: "#f1948a",
        center: "#e74c3c",
        burst: ["#e74c3c", "#ec7063", "#f1948a", "#f5b7b1", "#fadbd8"],
        sparkles: ["#ffffff", "#fdf2e9", "#f5b7b1", "#ec7063"],
      },
    },
    {
      delay: 6,
      startPosition: { x: screenWidth * 0.1, y: -50 },
      endPosition: { x: screenWidth * 0.4, y: screenHeight * 0.4 },
      burstPosition: { x: screenWidth * 0.4, y: screenHeight * 0.4 },
      colors: {
        primary: "#f39c12",
        secondary: "#f4d03f",
        tertiary: "#f7dc6f",
        center: "#f39c12",
        burst: ["#f39c12", "#f4d03f", "#f7dc6f", "#f8c471", "#fad7a0"],
        sparkles: ["#ffffff", "#fef9e7", "#f8c471", "#f4d03f"],
      },
    },
    {
      delay: 9,
      startPosition: { x: screenWidth * 0.9, y: screenHeight + 50 },
      endPosition: { x: screenWidth * 0.6, y: screenHeight * 0.35 },
      burstPosition: { x: screenWidth * 0.6, y: screenHeight * 0.35 },
      colors: {
        primary: "#e67e22",
        secondary: "#eb984e",
        tertiary: "#f0b27a",
        center: "#e67e22",
        burst: ["#e67e22", "#eb984e", "#f0b27a", "#f5cba7", "#fdebd0"],
        sparkles: ["#ffffff", "#fef5e7", "#f5cba7", "#eb984e"],
      },
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 text-gray-800 overflow-x-hidden relative">
      {/* Background Fireworks Animation */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {fireworkConfigs.map((config, index) => (
          <ModernFireworkAnimation
            key={index}
            delay={config.delay}
            startPosition={config.startPosition}
            endPosition={config.endPosition}
            burstPosition={config.burstPosition}
            colors={config.colors}
          />
        ))}
      </div>

      {/* All content with higher z-index */}
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
                  Safety
                </span>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600">
                  Guidelines
                </span>
              </h1>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "6rem" }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto mb-8"
              />

              <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-800 mb-6">
                Madhu Nisha Crackers
              </p>

              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                Your safety is our priority. Follow these essential guidelines for a safe and enjoyable fireworks
                experience. A moment of caution prevents a lifetime of regret.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Do's Section */}
        <section className="py-20 px-4 sm:px-6 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-4 mobile:flex-col mobile:gap-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700">
                  Safety Do's
                </span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dosData.map(({ icon: Icon, title, description }, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-green-600 transition-colors duration-500">
                      {title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-500">
                      {description}
                    </p>
                  </div>

                  <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-green-200 to-green-300 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Don'ts Section */}
        <section className="py-20 px-4 sm:px-6 relative bg-gradient-to-br from-red-50 to-transparent">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-4 mobile:flex-col mobile:gap-2">
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
                  Safety Don'ts
                </span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full mx-auto" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dontsData.map(({ icon: Icon, title, description }, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-red-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-red-600 transition-colors duration-500">
                      {title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-500">
                      {description}
                    </p>
                  </div>

                  <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-red-200 to-red-300 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Guidelines */}
        <section className="py-20 px-4 sm:px-6 relative">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white text-center overflow-hidden relative shadow-2xl"
            >
              <div className="absolute inset-0 bg-[url('/safety-pattern.png')] bg-cover bg-center opacity-10" />

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <AlertTriangle className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-3xl font-bold mb-6">Emergency Guidelines</h3>

                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <Flame className="w-5 h-5" />
                      In Case of Fire
                    </h4>
                    <ul className="space-y-2 text-orange-100">
                      <li>• Use water or sand to extinguish flames</li>
                      <li>• Never use your hands to put out fires</li>
                      <li>• Call emergency services if needed</li>
                      <li>• Move away from unburned fireworks</li>
                    </ul>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      In Case of Injury
                    </h4>
                    <ul className="space-y-2 text-orange-100">
                      <li>• Seek immediate medical attention</li>
                      <li>• Do not remove embedded particles</li>
                      <li>• Cool burns with cold water</li>
                      <li>• Keep first aid kit accessible</li>
                    </ul>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm"
                >
                  <p className="text-lg font-semibold">
                    Remember: Safety is not just a guideline, it's a responsibility. Enjoy fireworks responsibly and
                    create beautiful memories safely.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Modern Footer */}
        <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/footer-pattern.png')] bg-cover bg-center opacity-5" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 mobile:mb-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Company Info */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">Madhu Nisha Crackers</h2>
                </div>
                <p className="text-orange-200 font-semibold mb-2">Premium Fireworks</p>
                <p className="text-gray-300 leading-relaxed">
                  Spark joy, spread light—fireworks crafted for your celebration. Creating magical moments with quality
                  and safety as our top priorities.
                </p>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold mb-6 text-orange-400">Contact Us</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">Madhu Nisha Crackers</p>
                      <p className="text-gray-300">
                        Pernayakkanpatti
                        <br />
                        Kil Thayilapatti, Sivakasi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">Office Address :</p>
                      <p className="text-gray-300">
                        Sivagamipuram Colony, Viswanatham panchayat.,
                        <br />
                        Sivakasi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-orange-400" />
                    <div className="space-y-1">
                      <a
                        href="tel:+919487594689"
                        className="text-gray-300 hover:text-orange-400 transition-colors block"
                      >
                        +91 94875 94689
                      </a>
              
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-orange-400" />
                    <a
                      href="mailto:madhunishacrackers@gmail.com"
                      className="text-gray-300 hover:text-orange-400 transition-colors"
                    >
                      madhunishacrackers@gmail.com
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold mb-6 text-orange-400">Quick Links</h2>
                <ul className="space-y-3">
                  {["Home", "About Us", "Price List", "Safety Tips", "Contact Us"].map((link) => (
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

            {/* Footer Bottom */}
            <div className="mt-12 pt-8 border-t border-gray-700 text-center">
              <p className="text-gray-400 mb-4 leading-relaxed">
                As per 2018 Supreme Court order, online sale of firecrackers are not permitted! We value our customers
                and respect jurisdiction. Please add your products to cart and submit enquiries. We will contact you
                within 24 hrs.
              </p>
              <p className="text-gray-400">
                Copyright © 2025 <span className="text-orange-400 font-semibold">Madhu Nisha Crackers</span>. All rights
                reserved. Developed by <span className="text-orange-400 font-semibold">SPD Solutions</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
