"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "ui/button"
import { GlobeDemo } from "../components/GlobeDemo"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-black rounded-lg p-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent tracking-tight">
                LogistiX AI
              </span>
            </motion.div>

            {/* Desktop Navigation Links */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden md:flex items-center space-x-6"
            >
              <Button
                variant="ghost"
                onClick={scrollToHero}
                className="text-white/80 hover:text-white text-lg px-4 py-2 transition-all duration-300"
              >
                Home
              </Button>
              <Link href="/vessel-manager">
                <Button className="relative overflow-hidden group bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg px-6 py-2 rounded-lg">
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 transition-transform duration-300 transform translate-x-full group-hover:translate-x-0" />
                </Button>
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="md:hidden"
            >
              <Button
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white/80 hover:text-white"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden bg-black/90 backdrop-blur-xl mt-4 rounded-xl overflow-hidden border border-white/10"
              >
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="flex flex-col p-4 space-y-4"
                >
                  <Button
                    variant="ghost"
                    onClick={scrollToHero}
                    className="text-white/80 hover:text-white text-lg px-4 py-2"
                  >
                    Home
                  </Button>
                  <Link href="/vessel-manager">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg px-6 py-2 rounded-lg w-full">
                      Dashboard
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Globe */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-full h-full max-w-5xl transform scale-110">
            <GlobeDemo background="transparent" />
          </div>
        </div>

        {/* Overlay Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-8xl font-extrabold bg-gradient-to-r from-neon-pink via-neon-blue to-neon-purple bg-clip-text text-transparent leading-tight tracking-tighter">
              AI-Powered Logistics
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          >
            <p className="text-xl md:text-3xl text-gray-200 mt-4 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
              Next-Gen Vessel Scheduling & Cost Optimization for Steel Supply Chains
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          >
            <Link href="/vessel-manager">
              <Button
                size="lg"
                className="bg-gradient-to-r from-neon-pink to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white text-xl px-10 py-6 rounded-full border-0 shadow-2xl hover:shadow-neon-blue/70 transition-all duration-300 transform hover:scale-105"
              >
                Launch Dashboard
                <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-3 h-3 bg-neon-pink rounded-full animate-float opacity-50"></div>
          <div className="absolute top-3/4 right-20 w-2 h-2 bg-neon-blue rounded-full animate-float opacity-40 animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-2.5 h-2.5 bg-neon-purple rounded-full animate-float opacity-60 animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-neon-pink rounded-full animate-float opacity-50 animation-delay-3000"></div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="w-8 h-8 text-neon-blue opacity-70" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent tracking-tight">
              Redefining Maritime Logistics
            </h2>
            <p className="text-xl text-gray-300 mt-4 max-w-3xl mx-auto font-light">
              Unleash the power of AI to streamline vessel operations, slash costs, and supercharge your supply chain.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Scheduling",
                description: "AI-powered scheduling that dynamically adapts to real-time conditions for peak efficiency.",
                icon: "🚢",
              },
              {
                title: "Cost Optimization",
                description: "Cutting-edge algorithms minimize fuel, port, and operational costs with precision.",
                icon: "💰",
              },
              {
                title: "Supply Chain Intelligence",
                description: "Gain full visibility with predictive analytics and actionable insights.",
                icon: "🔗",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
                className="group relative bg-[rgba(50,25,100,0.3)] backdrop-blur-md border border-neon-blue/20 rounded-2xl p-8 hover:bg-[rgba(100,50,255,0.2)] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 to-neon-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="relative text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="relative text-gray-200 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Tailwind CSS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap');

        :root {
          --neon-pink: #ff2e63;
          --neon-blue: #00ddeb;
          --neon-purple: #9b5de5;
        }

        .font-sans {
          font-family: 'Inter', sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
      `}</style>
    </div>
  )
}