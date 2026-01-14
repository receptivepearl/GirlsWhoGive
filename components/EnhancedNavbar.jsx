'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { useClerk, UserButton } from "@clerk/nextjs";
import Logo from "./Logo";

const EnhancedNavbar = () => {
  const { user, userRole } = useAppContext();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!user) {
      return [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/discover", label: "Discover" },
        { href: "/organization-needs", label: "Organization Needs" }
      ];
    }

    switch (userRole) {
      case 'donor':
        return [
          { href: "/", label: "Home" },
          { href: "/donor/discover", label: "Discover" },
          { href: "/donor/donations", label: "My Donations" },
          { href: "/donor/organization-needs", label: "Organization Needs" },
          { href: "/about", label: "About" }
        ];
      case 'organization':
        return [
          { href: "/", label: "Home" },
          { href: "/organization-dashboard", label: "Dashboard" },
          { href: "/about", label: "About" }
        ];
      case 'admin':
        return [
          { href: "/", label: "Home" },
          { href: "/admin/dashboard", label: "Admin Dashboard" },
          { href: "/admin/organizations", label: "Organizations" },
          { href: "/admin/donations", label: "All Donations" },
          { href: "/admin/organization-needs", label: "Organization Needs" },
          { href: "/about", label: "About" }
        ];
      default:
        return [
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
          { href: "/discover", label: "Discover" },
          { href: "/organization-needs", label: "Organization Needs" }
        ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/40 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'bg-white/20 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-3">
              <Logo size="default" />
              <span className="text-2xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Girls</span>
                <span className="text-gray-900">Who</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Give</span>
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="relative text-gray-900 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 group"
                >
                  {item.label}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center space-x-4"
              >
                {/* Role Badge */}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="hidden sm:inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 text-xs font-medium px-3 py-1 rounded-full border border-pink-200"
                >
                  {userRole === 'donor' ? 'Donor' : userRole === 'organization' ? 'Organization' : 'Admin'}
                </motion.span>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 border-2 border-pink-200 hover:border-pink-400 transition-colors duration-200"
                      }
                    }}
                  />
                </motion.div>
              </motion.div>
            ) : (
              <>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/connect')}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Account
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openSignIn}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign In
                </motion.button>
              </>
            )}

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
            >
              <span className="sr-only">Open main menu</span>
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-lg border-t border-pink-100 rounded-b-2xl shadow-lg">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-gray-900 hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                {!user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: navigationItems.length * 0.1 }}
                    className="pt-4 border-t border-gray-200 space-y-2"
                  >
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/connect');
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openSignIn();
                      }}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                    >
                      Sign In
                    </button>
                  </motion.div>
                )}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: navigationItems.length * 0.1 }}
                    className="pt-4 border-t border-gray-200"
                  >
                    <div className="flex items-center px-3 py-2">
                      <span className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {userRole === 'donor' ? 'Donor' : userRole === 'organization' ? 'Organization' : 'Admin'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default EnhancedNavbar;

