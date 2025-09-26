"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Play, Star, Users, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import the modified Globe component
import { GlobeDemo } from "@/components/GlobeDemo";

// Simple wrapper to ensure proper sizing
const GlobeWrapper: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <GlobeDemo />
    </div>
  );
};

const Hero: React.FC = () => {
  const features = [
    { icon: Globe, text: "Global Coverage" },
    { icon: Zap, text: "Real-time Analytics" },
    { icon: Users, text: "Team Collaboration" },
  ];

  // --- Fix hydration issue: pre-generate random particles client-side ---
  const [particles, setParticles] = useState<
    { left: string; top: string; duration: number; delay: number; color: string }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 8 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 2,
      color: i % 3 === 0 ? "bg-neon-pink" : i % 3 === 1 ? "bg-neon-blue" : "bg-neon-purple",
    }));
    setParticles(generated);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-gray-900">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8">
        {/* Left Content - Enhanced for SAIL */}
        <div className="relative z-10 flex-1 lg:pr-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-blue/20 border border-neon-blue/30 mb-6">
              <Star className="w-4 h-4 text-neon-blue fill-neon-blue" />
              <span className="text-sm font-medium text-white">
                Powering SAIL's Steel Supply Chain
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6 drop-shadow-md">
              Steel India's Future
              <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mt-2 text-white">
                with Smart Logistics
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed drop-shadow-sm">
              Revolutionize SAIL's raw material logistics with AI-driven vessel scheduling,
              port-to-plant optimization, and cost-efficient dispatch across India's largest steel
              manufacturing network.
            </p>
          </motion.div>

          {/* SAIL-Specific Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-wrap gap-6 mb-8"
          >
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
                <span className="text-sm font-medium text-white">{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              className="bg-neon-blue hover:bg-neon-blue/80 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg shadow-neon-blue/25 transition-all duration-300 hover:shadow-xl hover:shadow-neon-blue/40 hover:scale-105"
            >
              Optimize SAIL Operations
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-neon-purple/30 text-black font-semibold px-8 py-4 rounded-xl text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              View Steel Analytics
            </Button>
          </motion.div>

          {/* SAIL-Specific Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="flex gap-8 mt-12 pt-8 border-t border-gray-700"
          >
            <div>
              <div className="text-2xl font-bold text-neon-blue">25%</div>
              <div className="text-sm text-gray-400">Cost Reduction</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neon-pink">5 Plants</div>
              <div className="text-sm text-gray-400">Steel Facilities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neon-purple">3 Ports</div>
              <div className="text-sm text-gray-400">East Coast Hubs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neon-blue">15MT+</div>
              <div className="text-sm text-gray-400">Annual Capacity</div>
            </div>
          </motion.div>

          {/* SAIL Plants & Ports Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="mt-8 p-4 rounded-xl bg-gradient-to-r from-neon-blue/10 to-neon-pink/10 border border-neon-blue/20"
          >
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-300">
              <div>
                <div className="text-neon-blue font-semibold mb-1">Steel Plants:</div>
                <div>Bhilai • Durgapur • Rourkela • Bokaro • IISCO</div>
              </div>
              <div>
                <div className="text-neon-pink font-semibold mb-1">Import Ports:</div>
                <div>Haldia • Paradip • Visakhapatnam</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Globe */}
        <div className="relative flex-1 flex justify-start items-start lg:justify-end lg:items-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <div className="w-80 h-80 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] relative -translate-y-24 -translate-x-32 lg:-translate-x-0">
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

      {/* Floating Particles Background (hydration-safe) */}
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

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent pointer-events-none"></div>
    </section>
  );
};

export default Hero;
