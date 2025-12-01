import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Target, Eye, Rocket, ArrowRight, Phone, Mail, MapPin } from "lucide-react"
import Navbar from "../Component/Navbar"
import fire from '../fire.jpg'

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const FloatingParticle = ({ delay = 0 }) => {
  return (
    <motion.div
      className="absolute w-2 h-2 bg-orange-400 rounded-full opacity-60"
      animate={{
        y: [-20, -100, -20],
        x: [0, Math.random() * 40 - 20, 0],
        opacity: [0, 1, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        delay,
        ease: "easeInOut",
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  )
}

const ModernCard = ({ icon: Icon, title, content, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-orange-100 overflow-hidden"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />

      <div className="relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-orange-600 transition-colors duration-500">
          {title}
        </h3>

        <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-500">
          {content}
        </p>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
    </motion.div>
  )
}

export default function About() {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 4,
    }))
    setParticles(newParticles)
  }, [])

  const companyValues = [
    {
      icon: Target,
      title: "Our Mission",
      content:
        "We respect consumer's benefit, safety, good quality, beautiful packing, effective service, and reasonable price. Our products are market-oriented and meet high-quality standards with innovative designs that bring joy to every celebration. Being best dealers of crackers in Sivakasi",
    },
    {
      icon: Eye,
      title: "Our Vision",
      content:
        "To be the leading fireworks company across India, establishing our presence amongst retailers and making our premium products accessible to all. Our vision is to create magical moments through quality fireworks that light up every celebration.",
    },
    {
      icon: Sparkles,
      title: "Our Values",
      content:
        "Safety first is our motto. Madhu Nisha Crackers has adopted stringent quality testing measures and norms defined by the fireworks industry. We believe in innovation, customer satisfaction, and creating unforgettable experiences through our products.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 text-gray-800 overflow-x-hidden">
      <Navbar />

      <div className="relative z-10 mt-20">
        {/* Main About Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 hundred:mt-0 mobile:-mt-25">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image Section */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
              }}
            >
              <img
                src={fire}
                alt="Fireworks display"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </motion.div>

            {/* Text Content Section */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6, staggerChildren: 0.2 } }
              }}
              className="space-y-8"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                  Discover{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
                    Madhu Nisha Fireworks
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-8" />
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                className="space-y-6 text-lg text-gray-600 leading-relaxed"
              >
                <p>
                  <strong className="text-orange-600">Madhu Nisha Fireworks</strong> is your premier destination for high-quality
                  fireworks, lighting up celebrations across India with brilliance and joy. From vibrant festivals to intimate
                  gatherings, our fireworks add a magical touch to every occasion.
                </p>

                <p>
                  We partner with top manufacturers to deliver innovative, safe, and spectacular products that create lasting
                  memories. Our commitment to excellence ensures every sparkler and burst is crafted with precision and care and being best dealers in Sivakasi.
                </p>

                <p>
                  Serving Tamil Nadu and beyond, we cater to families, event planners, and retailers with tailored solutions,
                  affordable prices, and a passion for making every moment shine brighter.
                </p>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center gap-3 bg-orange-100 px-4 py-2 rounded-full">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-800 font-medium">Premium Quality</span>
                </div>
                <div className="flex items-center gap-3 bg-orange-100 px-4 py-2 rounded-full">
                  <Target className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-800 font-medium">Safety First</span>
                </div>
                <div className="flex items-center gap-3 bg-orange-100 px-4 py-2 rounded-full">
                  <Rocket className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-800 font-medium">Innovation</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 mx-4 rounded-3xl overflow-hidden relative bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
          <div className="absolute inset-0 bg-[url('/fireworks-pattern.png')] bg-cover bg-center opacity-10" />

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-orange-400 rounded-full"
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.sin(i) * 50, 0],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 4,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative z-10 max-w-4xl mx-auto text-center px-6 text-white"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
              🎆 Premium Fireworks with Exclusive Discounts!
            </h2>

            <p className="text-xl mb-4 text-orange-100">
              Celebrate every occasion with <span className="font-semibold text-orange-300">Madhu Nisha Crackers</span>. Your
              trusted partner for elite fireworks and festive celebrations.
            </p>

            <p className="text-lg mb-8 text-gray-300">
              Explore our collection of rockets, gift boxes, skyshots, sparklers, and more—with convenient online
              ordering and reliable doorstep delivery across Tamil Nadu.
            </p>  

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.a
                href="tel:+919487594689"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Phone className="w-5 h-5" />
                +91 94875 94689
              </motion.a>

       
            </div>
          </motion.div>
        </section>

        {/* Company Values Section */}
        <section className="py-32 px-4 md:px-8 relative">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Foundation</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto mb-6" />
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Built on strong values and unwavering commitment to excellence, safety, and customer satisfaction
              </p>
            </motion.div>

            <div className="grid tab:grid-cols-1 hundred:grid-cols-3 gap-8">
              {companyValues.map((value, i) => (
                <ModernCard key={i} icon={value.icon} title={value.title} content={value.content} delay={i * 0.2} />
              ))}
            </div>
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
                        href="tel:+919487524689"
                        className="text-gray-300 hover:text-orange-400 transition-colors block"
                      >
                        +91 94875 24689
                      </a>
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
