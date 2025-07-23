"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Navbar from "../Component/Navbar"
import { MapPin, Phone, Mail, Globe, Sparkles, Clock, ArrowRight } from "lucide-react"

const ModernFireworkAnimation = ({ delay = 0, startPosition, endPosition, burstPosition, colors }) => {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Rocket Trail */}
      <motion.div
        className="absolute w-4 h-8 rounded-full"
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
          duration: 2.2,
          delay: delay,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 10,
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
          delay: delay + 2.2,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 10,
        }}
      >
        {/* Primary burst particles */}
        {Array.from({ length: 28 }).map((_, i) => {
          const angle = i * 12.86 * (Math.PI / 180)
          const distance = dimensions.width * 0.25
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
                duration: 4.5,
                delay: delay + 2.2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 10,
                ease: "easeOut",
              }}
            />
          )
        })}

        {/* Secondary sparkles */}
        {Array.from({ length: 40 }).map((_, i) => {
          const angle = i * 9 * (Math.PI / 180)
          const distance = dimensions.width * 0.15
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
                x: [0, x * 0.4, x * 0.8, x * 1.3],
                y: [0, y * 0.4, y * 0.8, y * 1.3],
                opacity: [1, 0.8, 0.4, 0],
                scale: [1, 0.8, 0.4, 0],
              }}
              transition={{
                duration: 4,
                delay: delay + 2.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 10,
                ease: "easeOut",
              }}
            />
          )
        })}

        {/* Center flash */}
        <motion.div
          className="absolute w-32 h-32 rounded-full"
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
            delay: delay + 2.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 10,
            ease: "easeOut",
          }}
        />
      </motion.div>
    </div>
  )
}

const ContactCard = ({ icon: Icon, title, content, delay = 0, gradient }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative"
    >
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-16 h-16 ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
      </div>

      <div className="relative pt-10 p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-orange-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center group-hover:text-orange-600 transition-colors duration-500">
            {title}
          </h2>
          <div className="space-y-3">
            {content.map((item, itemIndex) => (
              <div key={itemIndex}>
                {typeof item === "string" ? (
                  <p className="text-gray-600 text-center leading-relaxed group-hover:text-gray-700 transition-colors duration-500">
                    {item}
                  </p>
                ) : (
                  <motion.a
                    href={item.href}
                    whileHover={{ scale: 1.05 }}
                    className="block text-orange-600 hover:text-orange-700 text-center transition-colors duration-200 hover:underline font-medium"
                  >
                    {item.text}
                  </motion.a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />

        {/* Decorative element */}
        <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
      </div>
    </motion.div>
  )
}

export default function Contact() {
  const [screenDimensions, setScreenDimensions] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    const updateDimensions = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const contactCards = [
    {
      icon: MapPin,
      title: "Our Shop Location",
      content: ["MN Crackers", "Anil Kumar Eye Hospital Opp.", "Sattur Road", "Sivakasi, Tamil Nadu"],
      gradient: "bg-gradient-to-br from-orange-400 to-orange-600",
    },
    {
      icon: Phone,
      title: "Call Us Anytime",
      content: [
        { text: "+91 63836 59214", href: "tel:+916383659214" },
        { text: "+91 96554 56167", href: "tel:+919655456167" },
      ],
      gradient: "bg-gradient-to-br from-green-400 to-green-600",
    },
    {
      icon: Mail,
      title: "Email Address",
      content: [{ text: "nivasramasamy27@gmail.com", href: "mailto:nivasramasamy27@gmail.com" }],
      gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
  ]

  const fireworkConfigs = [
    {
      delay: 0,
      startPosition: { x: -50, y: screenDimensions.height * 0.8 },
      endPosition: { x: screenDimensions.width * 0.2, y: screenDimensions.height * 0.3 },
      burstPosition: { x: screenDimensions.width * 0.2, y: screenDimensions.height * 0.3 },
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
      delay: 2.5,
      startPosition: { x: screenDimensions.width + 50, y: screenDimensions.height * 0.9 },
      endPosition: { x: screenDimensions.width * 0.8, y: screenDimensions.height * 0.25 },
      burstPosition: { x: screenDimensions.width * 0.8, y: screenDimensions.height * 0.25 },
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
      delay: 5,
      startPosition: { x: screenDimensions.width * 0.1, y: -50 },
      endPosition: { x: screenDimensions.width * 0.5, y: screenDimensions.height * 0.4 },
      burstPosition: { x: screenDimensions.width * 0.5, y: screenDimensions.height * 0.4 },
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
      delay: 7.5,
      startPosition: { x: screenDimensions.width * 0.9, y: screenDimensions.height + 50 },
      endPosition: { x: screenDimensions.width * 0.7, y: screenDimensions.height * 0.35 },
      burstPosition: { x: screenDimensions.width * 0.7, y: screenDimensions.height * 0.35 },
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Background Fireworks */}
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

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto pt-32 pb-16 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <Phone className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
                Contact
              </span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600">Us</span>
            </h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "6rem" }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto mb-8"
            />

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ready to light up your celebrations? Get in touch with{" "}
              <span className="font-semibold text-orange-600">MN Crackers</span> for all your premium fireworks needs.
              We're here to make your special moments truly unforgettable.
            </p>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {contactCards.map((card, index) => (
              <ContactCard
                key={index}
                icon={card.icon}
                title={card.title}
                content={card.content}
                delay={index * 0.2}
                gradient={card.gradient}
              />
            ))}
          </div>

          {/* Business Hours Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative mb-16"
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300"
              >
                <Clock className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            <div className="relative pt-10 p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-orange-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 group-hover:text-purple-600 transition-colors duration-500">
                  Business Hours
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700">Regular Days</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>Monday - Saturday</p>
                      <p className="font-medium text-orange-600">9:00 AM - 8:00 PM</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700">Festival Season</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>Extended Hours</p>
                      <p className="font-medium text-orange-600">8:00 AM - 10:00 PM</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-orange-50 rounded-2xl">
                  <p className="text-sm text-orange-700">
                    <strong>Note:</strong> We're available for emergency orders and bulk purchases. Call us anytime!
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
            </div>
          </motion.div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.01 }}
            className="group relative"
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300"
              >
                <Globe className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            <div className="relative pt-10 p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-orange-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center group-hover:text-emerald-600 transition-colors duration-500">
                  Find Us on Map
                </h2>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.0487539047143!2d77.79800291478508!3d9.453334793222115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cf8c8c8c8c8c%3A0x8c8c8c8c8c8c8c8c!2sMN%20Crackers%2C%20Anil%20Kumar%20Eye%20Hospital%20Opp.%2C%20Sattur%20Road%2C%20Sivakasi%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1703123456789!5m2!1sen!2sin"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="w-full hover:brightness-110 transition-all duration-300"
                  />
                </div>
                <div className="mt-6 text-center">
                  <motion.a
                    href="https://maps.google.com/?q=MN+Crackers+Sivakasi"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <MapPin className="w-5 h-5" />
                    Get Directions
                    <ArrowRight className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>

              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
            </div>
          </motion.div>
        </section>

        {/* Modern Footer */}
        <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 mt-20 shadow-2xl overflow-hidden relative">
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
                  <h2 className="text-2xl font-bold">MN Crackers</h2>
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
                      <p className="text-white font-medium">MN Crackers</p>
                      <p className="text-gray-300">
                        Anil Kumar Eye Hospital Opp.,
                        <br />
                        Sattur Road, Sivakasi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-orange-400" />
                    <div className="space-y-1">
                      <a
                        href="tel:+916383659214"
                        className="text-gray-300 hover:text-orange-400 transition-colors block"
                      >
                        +91 63836 59214
                      </a>
                      <a
                        href="tel:+919655456167"
                        className="text-gray-300 hover:text-orange-400 transition-colors block"
                      >
                        +91 96554 56167
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-orange-400" />
                    <a
                      href="mailto:nivasramasamy27@gmail.com"
                      className="text-gray-300 hover:text-orange-400 transition-colors"
                    >
                      nivasramasamy27@gmail.com
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
                Copyright © 2025 <span className="text-orange-400 font-semibold">MN Crackers</span>. All rights
                reserved. Developed by <span className="text-orange-400 font-semibold">SPD Solutions</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
