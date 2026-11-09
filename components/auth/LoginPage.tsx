"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, Lock, Eye, EyeOff } from "lucide-react";
// import { SimovisLogoIcon } from "../public/icons/Icons";
import { SimovisLogoIcon } from "../../public/icons/Icons";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isLoading) return;

  setIsLoading(true);
  setError("");
  // setSuccess("");

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.trim(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login gagal");
    }

    // setSuccess(`Login berhasil! Selamat datang, ${data.user.name}.`);
    setPassword("");
    router.replace("/dashboard");
    router.refresh();

    // Navigasi ke dashboard ditambahkan saat
    // halaman dashboard sudah tersedia.
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat login"
    );
  } finally {
    setIsLoading(false);
  }
};

  const [error, setError] = useState("");
// const [success, setSuccess] = useState("");

  return (
    <div className="h-screen h-dvh w-full bg-[#FBFAFC] flex flex-col lg:flex-row relative overflow-hidden select-none">
      {/* Background Soft Purple Glow */}
      <div className="absolute top-1/4 right-0 w-[600px] lg:w-[850px] h-[600px] lg:h-[850px] bg-[#E8C2FF]/30 rounded-full blur-[140px] pointer-events-none z-0 transform translate-x-1/4" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#D48DFF]/20 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Left Section: Login Form (~48% on desktop) */}
      <div className="w-full lg:w-[48%] xl:w-[48%] h-full flex flex-col justify-center items-center px-6 sm:px-12 lg:px-10 xl:px-16 py-6 lg:py-0 relative z-10 shrink-0">
        <div className="w-full max-w-[420px] sm:max-w-[440px]">
          <div className="bg-white rounded-[26px] p-8 sm:p-10 border border-[#ECE9F0] shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all">
            {/* Title & Description */}
            <div className="text-center mb-7">
              <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">
                Login
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed max-w-[280px] mx-auto">
                Masuk untuk memantau kepatuhan APD di seluruh lini operasional.
              </p>
            </div>

            {/* Form */}
            <form aria-busy={isLoading} onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-xs sm:text-sm font-medium text-zinc-700 block">
                  Username
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    autoComplete="username"
                    disabled={isLoading}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukan username"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#4D0077] focus:ring-2 focus:ring-[#4D0077]/15 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs sm:text-sm font-medium text-zinc-700 block">
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukan Password"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#4D0077] focus:ring-2 focus:ring-[#4D0077]/15 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
  <p
    role="alert"
    className="text-sm text-center text-red-600   "
  >
    {error}
  </p>
)}

{/* {success && (
  <p
    role="status"
    className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
  >
    {success}
  </p>
)} */}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 sm:py-3.5 px-4 bg-[#4D0077] hover:bg-[#3D005F] active:scale-[0.99] text-white font-medium text-sm sm:text-base rounded-xl shadow-md shadow-[#4D0077]/25 hover:shadow-lg hover:shadow-[#4D0077]/35 transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section: Branding & Full Half-Screen 3D Platform Box (~52% on desktop) */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col h-full overflow-hidden justify-between lg:w-[52%] xl:w-[52%] pb-0">
        {/* Brand Header */}
        <div className="relative z-20 flex shrink-0 flex-col items-start pt-8 lg:pt-[5.5vh] xl:pt-[6.5vh] px-6 sm:px-10 lg:px-0 lg:pl-[3vw] xl:pl-[4vw] max-w-[540px]">
          <div className="flex items-center gap-3.5">
            <SimovisLogoIcon className="w-13 h-13 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-[#4D0077] shrink-0" />
            <span className="text-4xl sm:text-5xl lg:text-[54px]  text-[#4D0077] tracking-tight leading-none">
              Simovis
            </span>
          </div>
          <p className="mt-3.5 sm:mt-4 text-zinc-600 text-sm sm:text-base lg:text-[17px] font-normal leading-relaxed">
            Verifikasi kepatuhan alat pelindung diri secara otomatis dan objektif di setiap lini operasional.
          </p>
        </div>

        {/* Hero Visual Area: Full Width 3D Box & Large APD Equipment */}
        <div className="relative w-full flex-1 min-h-0 flex items-end justify-end pointer-events-none">
          <div className="relative lg:absolute lg:right-0 lg:bottom-0 w-full aspect-[600/440] max-h-[64vh]">

            {/* SVG 3D Isometric Platform Base Box Grounded to Bottom-Right */}
            <div className="absolute inset-0 w-full h-full">
              <svg
                viewBox="0 40 600 350"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_25px_40px_rgba(77,0,119,0.18)]"
              >
                <defs>
                  {/* Top Face Gradient */}
                  <linearGradient
                    id="topGradient"
                    x1="0"
                    y1="40"
                    x2="600"
                    y2="320"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#F5DCFF" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#D98EFF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#9C2BE8" stopOpacity="0.85" />
                  </linearGradient>

                  {/* Left Face Gradient */}
                  <linearGradient
                    id="leftGradient"
                    x1="0"
                    y1="180"
                    x2="300"
                    y2="440"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#E5A6FF" stopOpacity="0.9" />
                    <stop offset="45%" stopColor="#BE66FF" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#8A13D6" stopOpacity="0.8" />
                  </linearGradient>

                  {/* Right Face Gradient */}
                  <linearGradient
                    id="rightGradient"
                    x1="300"
                    y1="180"
                    x2="600"
                    y2="440"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#9E35F0" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#6C00B8" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#4A0082" stopOpacity="1" />
                  </linearGradient>
                </defs>

                {/* Left Side Face of Platform (grounded flat to bottom y=440) */}
                <polygon
                  points="0,180 300,320 300,440 0,440"
                  fill="url(#leftGradient)"
                  stroke="#ffffff"
                // strokeWidth="1.5"
                />

                {/* Right Side Face of Platform (grounded flat to bottom y=440 and right edge x=600) */}
                <polygon
                  points="300,320 600,180 600,440 300,440"
                  fill="url(#rightGradient)"
                  stroke="rgba(255, 255, 255, 0.3)"
                // strokeWidth="0.5"
                />

                {/* Top Face of Platform (Rhombus) */}
                <polygon
                  points="300,40 600,180 300,320 0,180"
                  fill="url(#topGradient)"
                  stroke="#ffffff"
                  strokeWidth="0.5"
                />

                {/* Top Rim Highlight */}
                <polyline
                  points="0,180 300,40 600,180"
                  stroke="#FFFFFF"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  opacity="0.95"
                />

                {/* Center Front Edge Highlight between Top and Side faces */}
                <polyline
                  points="0,180 300,320 600,180"
                  stroke="#FFFFFF"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  opacity="0.7"
                />

                {/* Center Seam Vertical Line */}
                <line
                  x1="300"
                  y1="320"
                  x2="300"
                  y2="440"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="0.5"
                />
              </svg>
            </div>

            {/* APD Equipment Overlay Image */}
            <div className="absolute top-[-10%] left-[15%] w-[70%] z-10 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.16)]">
              <Image
                src="/assets/equipments.png"
                alt="Simovis APD Safety Equipment"
                width={699}
                height={221}
                priority
                className="w-full h-auto object-contain"
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
