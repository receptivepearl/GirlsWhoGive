'use client'
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import axios from "axios";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";

const About = () => {
  const bioRef = useRef(null);
  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const howItWorksRef = useRef(null);
  const verifiedRef = useRef(null);
  const ctaRef = useRef(null);

  const bioInView = useInView(bioRef, { once: true, margin: "-100px" });
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const missionInView = useInView(missionRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  const verifiedInView = useInView(verifiedRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });


  return (
    <>
      <EnhancedNavbar />
      <div 
        className="relative min-h-screen pt-16"
        style={{
          backgroundImage: 'url(/background/BackgroundUI.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}
      >
        {/* Floating Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative z-10 px-6 md:px-16 lg:px-32 py-20">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <motion.div
              ref={heroRef}
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-12 shadow-lg border border-pink-100 relative overflow-hidden text-center"
            >
              {/* Decorative gradient background */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 to-purple-600" />
              <div className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              >
                About <motion.span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                >
                  GirlsWhoGive
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed"
              >
                <span className="font-semibold text-pink-600">GirlsWhoGive</span> is a donation-tracking platform that connects compassionate donors with nonprofits and community organizations in need of essential items.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed mt-4"
              >
                Our goal is simple: make in-kind giving <span className="font-semibold text-pink-600">organized, intentional, and transparent</span>—for both donors and organizations.
              </motion.p>
              <motion.div
                initial={{ width: 0 }}
                animate={heroInView ? { width: '100px' } : { width: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto mt-6"
              />
              </div>
            </motion.div>

            {/* Bio Section */}
            <motion.div
              ref={bioRef}
              initial={{ opacity: 0, y: 50 }}
              animate={bioInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-12 shadow-lg border border-pink-100 relative overflow-hidden"
            >
              {/* Decorative gradient background */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 to-purple-600" />
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                {/* Profile Picture */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={bioInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex-shrink-0"
                >
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-pink-300 shadow-xl ring-4 ring-pink-100">
                      <img 
                        src="/headshot.jpg" 
                        alt="Sudharshini Ram - Founder of GirlsWhoGive"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image not found
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 hidden items-center justify-center">
                        <span className="text-4xl md:text-5xl">👤</span>
                      </div>
                    </div>
                    <motion.div
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <span className="text-white text-sm">✨</span>
                    </motion.div>
                  </div>
                </motion.div>
                {/* Bio Content */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={bioInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="flex-1 text-center md:text-left"
                >
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    About the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Founder</span>
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    Hi! I'm <span className="font-semibold text-pink-600">Sudharshini Ram</span>, founder of <span className="font-semibold text-pink-600">GirlsWhoGive</span>, and I believe that access to essential resources is a matter of dignity—not luck.
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mt-4">
                    My journey began through community initiatives, where I organized donation drives that collected <span className="font-bold text-purple-600">thousands of in-kind items</span>, including hygiene products, food, clothing, and school supplies, for local nonprofits and shelters. Through this work, I saw firsthand how generous communities can be—yet I also noticed a major gap.
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mt-4">
                    Nonprofits often didn't know <span className="font-semibold text-pink-600">what donations were coming, how much to expect, or how to track items once they arrived</span>. Donors wanted to help, organizations needed support—but coordination was inefficient and time-consuming.
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mt-4">
                    I created <span className="font-semibold text-pink-600">GirlsWhoGive</span> to solve this problem. The platform acts as a bridge between donors and organizations, making in-kind donations easier to plan, track, and manage. By simplifying the logistics, nonprofits can spend less time counting boxes and more time making an impact.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Mission Section */}
            <motion.div
              ref={missionRef}
              initial={{ opacity: 0, y: 50 }}
              animate={missionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-12 shadow-lg border border-pink-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                We believe that access to basic necessities—such as food, clothing, hygiene products, books, and school supplies—should never be a barrier to dignity, health, or opportunity.
              </p>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                GirlsWhoGive connects donors with nonprofits, shelters, schools, and community organizations by streamlining how in-kind donations are communicated and tracked. Together, we're building a system where generosity is easier to give—and easier to manage.
              </p>
            </motion.div>

            {/* How It Works */}
            <motion.div
              ref={howItWorksRef}
              initial={{ opacity: 0, y: 50 }}
              animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-12 shadow-lg border border-pink-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8">How It Works</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: '★', title: 'Find Organizations', desc: 'Discover nonprofits and community organizations in your area and see exactly what types of donations they accept.', gradient: 'from-pink-500 to-rose-500' },
                  { icon: '♥', title: 'Commit to Donate', desc: 'Let organizations know what items you plan to bring and how many, before arriving in person.', gradient: 'from-purple-500 to-violet-500' },
                  { icon: '✔', title: 'Track Impact', desc: 'Organizations log donations in seconds and view clear monthly totals—no spreadsheets or manual guesswork.', gradient: 'from-indigo-500 to-blue-500' }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="text-center group"
                  >
                    <motion.div
                      transition={{ duration: 0.6 }}
                      className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}
                    >
                      <span className="text-3xl text-white">{item.icon}</span>
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Verified Organizations */}
            <motion.div
              ref={verifiedRef}
              initial={{ opacity: 0, y: 50 }}
              animate={verifiedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-12 shadow-lg border border-pink-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">Verified Organizations</h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                Organizations with a ✓ checkmark are verified partners who have completed our registration process. This ensures that:
              </p>
              
              <div className="space-y-4">
                {[
                  'They are legitimate nonprofit or community organizations',
                  'They accept in-kind donations',
                  'They maintain accurate donation records',
                  'They can responsibly receive and distribute donated items',
                  'They provide transparency around community impact'
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={verifiedInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <motion.span
                      className="text-green-600 text-xl"
                      initial={{ scale: 0 }}
                      animate={verifiedInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                    >
                      ✓
                    </motion.span>
                    <p className="text-gray-700">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>


            {/* Call to Action */}
            <motion.div
              ref={ctaRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={ctaInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-700 to-purple-700 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 relative z-10"
              >
                Ready to Make a Difference?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg sm:text-xl mb-8 opacity-90 relative z-10"
              >
                Join a growing community of donors and organizations working together to make in-kind giving more effective.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center relative z-10"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/user-dashboard'}
                  className="bg-white text-pink-600 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Start Donating
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/organization-dashboard'}
                  className="bg-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg hover:bg-purple-800 transition-colors border border-white/30 shadow-lg"
                >
                  Join as Organization
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;













