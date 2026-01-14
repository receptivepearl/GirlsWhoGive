'use client'
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";
import StatsSection from "@/components/StatsSection";

const Gallery = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentThankYouNote, setCurrentThankYouNote] = useState(0);
  
  const slideshowImages = [
    "/Gallery Test Image 1.jpeg",
    "/Gallery Test Image 2.jpeg",
    "/Gallery Test Image 3.jpeg"
  ];

  const thankYouNotes = [
    {
      image: "/New Leaf Thank you Note.png",
      organizationName: "A New Leaf West Valley Housing Assistance Center"
    }
    // Add more thank-you notes here as they become available
  ];

  // Navigation functions for main gallery
  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };

  // Navigation functions for thank-you notes
  const goToNextThankYou = () => {
    setCurrentThankYouNote((prev) => (prev + 1) % thankYouNotes.length);
  };

  const goToPreviousThankYou = () => {
    setCurrentThankYouNote((prev) => (prev - 1 + thankYouNotes.length) % thankYouNotes.length);
  };

  // Auto-advance main gallery slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slideshowImages.length]);

  // Auto-advance thank-you notes slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThankYouNote((prev) => (prev + 1) % thankYouNotes.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [thankYouNotes.length]);

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
          <div className="max-w-6xl mx-auto">
            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  Gallery
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600">
                Showcasing the impact of our community
              </p>
            </motion.div>

            {/* Section 1: Moving Image Slideshow */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 md:p-8 mb-12 shadow-lg border border-pink-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 to-purple-600" />
              
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden bg-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center p-4"
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={slideshowImages[currentSlide]}
                        alt={`Gallery image ${currentSlide + 1}`}
                        fill
                        className="object-contain"
                        priority={currentSlide === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  aria-label="Previous image"
                >
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  aria-label="Next image"
                >
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {slideshowImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'bg-white w-8'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Our Impact in Numbers Section */}
            <div className="mb-12">
              <StatsSection />
            </div>

            {/* Section 2: Thank-You Notes Slideshow */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-lg border border-pink-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 to-purple-600" />
              
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Thank You Notes
                </h2>
              </div>

              {/* Thank-You Note Slideshow Container */}
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden bg-white mb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentThankYouNote}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center p-4"
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={thankYouNotes[currentThankYouNote].image}
                        alt={`Thank you note from ${thankYouNotes[currentThankYouNote].organizationName}`}
                        fill
                        className="object-contain"
                        priority={currentThankYouNote === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button
                  onClick={goToPreviousThankYou}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  aria-label="Previous thank you note"
                >
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={goToNextThankYou}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  aria-label="Next thank you note"
                >
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Slide Indicators */}
                {thankYouNotes.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    {thankYouNotes.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentThankYouNote(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentThankYouNote
                            ? 'bg-pink-600 w-8'
                            : 'bg-pink-300/50 hover:bg-pink-300/75'
                        }`}
                        aria-label={`Go to thank you note ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Organization Name */}
              <motion.p
                key={currentThankYouNote}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-700 font-medium text-center"
              >
                {thankYouNotes[currentThankYouNote].organizationName}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Gallery;

