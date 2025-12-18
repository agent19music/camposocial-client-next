"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/themecontext";

export default function AnimatedFooter() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = footerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/comingsoon" },
    { label: "Events", href: "/events" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Login", href: "/login" },
  ];

  const socialLinks = [
    { label: "Instagram", href: "https://instagram.com", external: true },
    { label: "Discord", href: "https://discord.com", external: true },
    { label: "X (Twitter)", href: "https://x.com", external: true },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ];

  return (
    <footer
      ref={footerRef}
      className="bg-black text-white py-16 px-6 md:px-12 lg:px-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div
          className={`flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 transition-all duration-1000 ${
            isVisible
              ? "opacity-100 blur-0 translate-y-0"
              : "opacity-0 blur-sm translate-y-4"
          }`}
          style={{ transitionDelay: "0ms" }}
        >
          {/* Left Side - Headline and Contact */}
          <div className="mb-10 lg:mb-0 max-w-xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight" style={{ color: "#f1efe7" }}>
              Connect on campus now
            </h2>
            <div className="text-gray-400" style={{ color: "#f1efe7" }}>
              <p className="mb-1">Get Support:</p>
              <Link href="mailto:hi@camposocial.com" className="text-white hover:text-orange-400 transition-colors">
                hi@camposocial.com
              </Link>
            </div>
          </div>

          {/* Right Side - Navigation */}
          <div className="flex gap-12 md:gap-20">
            {/* Main Nav */}
            <nav
              className={`flex flex-col gap-3 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 blur-0 translate-y-0"
                  : "opacity-0 blur-sm translate-y-4"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Social Links */}
            <nav
              className={`flex flex-col gap-3 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 blur-0 translate-y-0"
                  : "opacity-0 blur-sm translate-y-4"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Large "campus" Text */}
        <div
          className={`mb-12 transition-all duration-1000 overflow-hidden ${
            isVisible
              ? "opacity-100 blur-0 translate-y-0"
              : "opacity-0 blur-md translate-y-8"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <h1
            className="font-bold leading-none tracking-tighter  select-none"
            style={{
              fontSize: "clamp(6rem, 18vw, 20rem)",
              lineHeight: 0.85,
              color: "#f1efe7"
            }}
          >
            camposocial
          </h1>
        </div>

        {/* Bottom Section */}
        <div
          className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-gray-400 text-sm transition-all duration-1000 ${
            isVisible
              ? "opacity-100 blur-0 translate-y-0"
              : "opacity-0 blur-sm translate-y-4"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          {/* Tagline */}
          <div>
            <p>Your Campus, Your City</p>
            <p>Connect, Share, Grow</p>
          </div>

          {/* Legal Links */}
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Overcaffeinated Undergrad Attribution */}
        <div
          className={`mt-12 pt-8 border-t border-gray-800 text-center transition-all duration-1000 ${
            isVisible
              ? "opacity-100 blur-0 translate-y-0"
              : "opacity-0 blur-sm translate-y-4"
          }`}
          style={{ transitionDelay: "1000ms" }}
        >
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2 flex-wrap">
            Made by an overcaffeinated undergrad
            <Image
              src="https://pub-abe4a6405e724602a7fac9bf761e290c.r2.dev/sean_pfp_peace-removebg-preview.png"
              alt="Sean"
              width={40}
              height={40}
              className="inline-block rounded-full"
            />
          </p>
        </div>
      </div>
    </footer>
  );
}
