"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/vessel-manager" },
    { name: "Simulation", href: "/simulation" },
    { name: "Map", href: "/map" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="w-full bg-[#b1c2ec] border-gray-200 shadow-sm backdrop-blur-sm">
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-22">
          {/* Logo Section */}
          <div className="flex items-center justify-start min-w-[120px] sm:min-w-[200px] pl-2 sm:pl-4 lg:pl-6">
            <Image
              src="/navimg.png"
              alt="Company Logo"
              width={150}
              height={150}
              className="object-contain w-24 sm:w-40"
              priority
            />
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="flex items-center lg:hidden pr-2 sm:pr-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#162959] hover:text-[#162959]/80 hover:bg-[#162959]/10"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center justify-center flex-1 space-x-16">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative text-[#162959] hover:text-[#162959]/80 font-semibold px-6 py-4 text-xl transition-all duration-200 group rounded-md"
              >
                {link.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#162959] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></span>
              </a>
            ))}
          </div>

          {/* Right Section - Notification and Avatar */}
          <div className="hidden lg:flex items-center space-x-3 min-w-[80px] pr-2 sm:pr-4 lg:pr-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#162959] hover:text-[#162959]/80 hover:bg-[#162959]/10 relative"
            >
              <Bell className="h-8 w-8" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            <Avatar className="h-10 w-10 border-2 border-[#162959]/20">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-[#162959] text-white text-sm font-medium">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden fixed inset-0 bg-[#b1c2ec] z-50 transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end p-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#162959] hover:text-[#162959]/80 hover:bg-[#162959]/10"
              onClick={toggleMenu}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[#162959] hover:text-[#162959]/80 font-semibold text-2xl transition-all duration-200"
                onClick={toggleMenu}
              >
                {link.name}
              </a>
            ))}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#162959] hover:text-[#162959]/80 hover:bg-[#162959]/10 relative"
              >
                <Bell className="h-8 w-8" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
              <Avatar className="h-10 w-10 border-2 border-[#162959]/20">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-[#162959] text-white text-sm font-medium">
                  U
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;