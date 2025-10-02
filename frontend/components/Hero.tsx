"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { GlobeDemo } from "@/components/GlobeDemo";

// Simple wrapper for globe
const GlobeWrapper: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <GlobeDemo />
    </div>
  );
};

const Hero: React.FC = () => {
  const [particles, setParticles] = useState<
    { left: string; top: string; duration: number; delay: number; color: string }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const generated = Array.from({ length: 8 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 2,
      color:
        i % 3 === 0
          ? "bg-neon-pink"
          : i % 3 === 1
          ? "bg-neon-blue"
          : "bg-neon-purple",
    }));
    setParticles(generated);
  }, []);

  const handleNavigate = () => {
    router.push("/vessel-manager");
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 bg-gray-900">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="relative z-10 flex-1 text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-blue/20 border border-neon-blue/30 mb-6">
            <Star className="w-4 h-4 text-neon-blue fill-neon-blue" />
            <span className="text-sm font-medium text-white">
              Powering SAIL's Steel Supply Chain
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-md">
            Steel India's Future
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mt-2 text-white">
              with Smart Logistics
            </span>
          </h1>

          {/* Paragraph */}
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed mx-auto lg:mx-0">
            Revolutionize SAIL's raw material logistics with AI-driven vessel
            scheduling, port-to-plant optimization, and cost-efficient dispatch
            across India's largest steel manufacturing network.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8">
            {[
              { icon: "🚢", text: "Vessel Schedule Optimization" },
              { icon: "🏭", text: "5 Integrated Steel Plants" },
              { icon: "⚓", text: "3 Major Port Operations" },
              { icon: "🚚", text: "Rail Transport Intelligence" },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center">
                  <span className="text-lg">{feature.icon}</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              size="lg"
              className="bg-neon-blue hover:bg-neon-blue/80 text-white font-semibold px-6 py-3 rounded-xl text-base sm:text-lg"
            >
              Optimize SAIL Operations
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-neon-purple/30 text-black font-semibold px-6 py-3 rounded-xl text-base sm:text-lg"
              onClick={handleNavigate}
            >
              <Play className="w-5 h-5 mr-2" />
              Create a Vessel
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-10 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-neon-blue">
                25%
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                Cost Reduction
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-neon-pink">
                5 Plants
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                Steel Facilities
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-neon-purple">
                3 Ports
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                East Coast Hubs
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-neon-blue">
                15MT+
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                Annual Capacity
              </div>
            </div>
          </div>

          {/* Plants & Ports Info */}
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-neon-blue/10 to-neon-pink/10 border border-neon-blue/20 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
              <div>
                <div className="text-neon-blue font-semibold mb-1">
                  Steel Plants:
                </div>
                <div>Bhilai • Durgapur • Rourkela • Bokaro • IISCO</div>
              </div>
              <div>
                <div className="text-neon-pink font-semibold mb-1">
                  Import Ports:
                </div>
                <div>Haldia • Paradip • Visakhapatnam</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Globe (hidden on mobile, shown only lg+) */}
        <div className="hidden lg:flex relative flex-1 justify-center lg:justify-end items-center lg:items-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <div className="w-80 h-80 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] relative -translate-y-36 -translate-x-32 lg:-translate-x-0">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/20 to-neon-blue/20 rounded-full blur-3xl scale-110"></div>

              {/* Globe container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full relative">
                  <GlobeWrapper />
                </div>
              </div>

              {/* Orbiting elements */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute -top-4 left-1/2 w-3 h-3 bg-neon-pink rounded-full blur-sm shadow-lg shadow-neon-pink/50"></div>
                <div className="absolute top-1/2 -right-4 w-2 h-2 bg-neon-blue rounded-full blur-sm shadow-lg shadow-neon-blue/50"></div>
                <div className="absolute -bottom-4 left-1/3 w-2.5 h-2.5 bg-neon-purple rounded-full blur-sm shadow-lg shadow-neon-purple/50"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${p.color} opacity-20`}
            style={{ left: p.left, top: p.top }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <ChevronDown className="w-8 h-8 text-neon-blue opacity-70" />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent pointer-events-none"></div>
    </section>
  );
};

export default Hero;
