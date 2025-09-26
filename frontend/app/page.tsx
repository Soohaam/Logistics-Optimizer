"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Button } from "ui/button"
import Link from "next/link"
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue bg-clip-text text-transparent tracking-tight drop-shadow-md">
            Transforming Steel Industry Logistics
          </h2>
          <p className="text-lg sm:text-xl text-white mt-4 max-w-3xl mx-auto font-light drop-shadow-sm">
            AI-powered optimization for SAIL's integrated steel plants. Streamline vessel scheduling, port-to-plant dispatch, and reduce transportation costs across all five facilities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              title: "Vessel Optimization Engine",
              description: "AI-driven vessel scheduling for coking coal and limestone imports across Haldia, Paradip, and Visakhapatnam ports.",
              icon: "🚢",
            },
            {
              title: "Port-to-Plant Intelligence",
              description: "Optimize rail dispatch from ports to all 5 SAIL plants: Bhilai, Durgapur, Rourkela, Bokaro, and IISCO steel facilities.",
              icon: "🏭",
            },
            {
              title: "Cost Reduction Analytics",
              description: "Minimize ocean freight, port handling, railway transport, and demurrage costs through intelligent route optimization.",
              icon: "💰",
            },
            {
              title: "Delay Prediction System",
              description: "Predict vessel delays and port congestion using weather data and historical patterns to prevent costly disruptions.",
              icon: "📊",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group relative bg-gray-800/30 backdrop-blur-md border border-neon-blue/30 rounded-xl p-8 hover:bg-gray-800/50 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/20 to-neon-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="relative text-xl sm:text-2xl font-bold mb-4 text-white drop-shadow-sm">{feature.title}</h3>
              <p className="relative text-white leading-relaxed text-sm sm:text-base">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* SAIL-Specific Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gray-800/50 backdrop-blur-md border border-neon-blue/30 rounded-xl p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 drop-shadow-sm">
  Built Specifically for SAIL Operations
</h3>

            <div className="grid md:grid-cols-3 gap-6 text-sm text-white">
              <div>
                <div className="text-neon-blue font-semibold">5 Integrated Plants</div>
                <div className="text-white">Bhilai, Durgapur, Rourkela, Bokaro, IISCO</div>
              </div>
              <div>
                <div className="text-neon-pink font-semibold">3 Major Ports</div>
                <div className="text-white">Haldia, Paradip, Visakhapatnam</div>
              </div>
              <div>
                <div className="text-neon-purple font-semibold">Key Materials</div>
                <div className="text-white">Coking Coal, Limestone, Dolomite, Manganese Ore</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent pointer-events-none"></div>
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