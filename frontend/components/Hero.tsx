"use client";

import React from "react";
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

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-gray-900">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8">
        {/* Left Content - Enhanced */}
        <div className="relative z-10 flex-1 lg:pr-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-blue/20 border border-neon-blue/30 mb-6">
              <Star className="w-4 h-4 text-neon-blue fill-neon-blue" />
              <span className="text-sm font-medium text-white">Trusted by 1000+ Companies</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue bg-clip-text text-transparent tracking-tight leading-tight mb-6 drop-shadow-md">
              Navigate the Future
              <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mt-2">
                of Maritime AI
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed drop-shadow-sm">
              Harness AI-driven solutions to optimize maritime logistics, predict weather patterns, and transform your operations with cutting-edge technology.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-wrap gap-6 mb-8"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-neon-blue" />
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
            <Button size="lg" className="bg-neon-blue hover:bg-neon-blue/80 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg shadow-neon-blue/25 transition-all duration-300 hover:shadow-xl hover:shadow-neon-blue/40 hover:scale-105">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="border-neon-purple/30 text-white hover:bg-neon-purple/10 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:border-neon-purple/50">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="flex gap-8 mt-12 pt-8 border-t border-gray-700"
          >
            <div>
              <div className="text-2xl font-bold text-neon-blue">99.9%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neon-pink">24/7</div>
              <div className="text-sm text-gray-400">Support</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neon-purple">150+</div>
              <div className="text-sm text-gray-400">Countries</div>
            </div>
          </motion.div>
        </div>

        <div className="relative flex-1 flex justify-start items-start lg:justify-end lg:items-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <div className="w-80 h-80 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] relative -translate-y-24 -translate-x-32 lg:-translate-x-0">
              {/* Adjust the -translate-x-32 value to shift the globe further left (increase the number) or right (decrease the number) */}
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/20 to-neon-blue/20 rounded-full blur-3xl scale-110"></div>
              
              {/* Globe container - remove constraints that cause oval shape */}
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

      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              i % 3 === 0 ? 'bg-neon-pink' : i % 3 === 1 ? 'bg-neon-blue' : 'bg-neon-purple'
            } opacity-20`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
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