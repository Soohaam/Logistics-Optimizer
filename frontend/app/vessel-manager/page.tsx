"use client";

import VesselManager from "../../components/VesselManager";
import Navbar from "../../components/Navbar"; // ✅ Import your Navbar

export default function VesselManagerPage() {
  return (
    <>
      <Navbar /> {/* ✅ Navbar added at the top */}
      <VesselManager />
    </>
  );
}
