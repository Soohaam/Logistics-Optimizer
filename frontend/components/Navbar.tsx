"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

const Navbar: React.FC = () => {
  const navLinks = [
    { name: "Dashboard", href: "/vessel-manager" },
    { name: "Simulation", href: "/simulation" },
    { name: "Map", href: "/map" },
  ];

  return (
    <nav className="w-full bg-[#b1c2ec] border-gray-200 shadow-sm backdrop-blur-sm">
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center h-22">
          {/* Logo Section */}
          <div className="flex items-center justify-start min-w-[200px] pl-2 sm:pl-4 lg:pl-6">
            <Image
              src="/navimg.png"
              alt="Company Logo"
              width={200}
              height={200}
              className="object-contain"
              priority
            />
          </div>

          {/* Centered Navigation Links */}
          <div className="flex items-center justify-center flex-1 space-x-16">
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
          <div className="flex items-center space-x-3 min-w-[80px] pr-2 sm:pr-4 lg:pr-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#162959] hover:text-[#162959]/80 hover:bg-[#162959]/10 relative"
            >
              <Bell className="h-7 w-7" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            <Avatar className="h-12 w-12 border-2 border-[#162959]/20">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-[#162959] text-white text-sm font-medium">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;