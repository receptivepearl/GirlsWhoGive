'use client'
import React from "react";
import { useRouter } from "next/navigation";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import GallerySection from "@/components/GallerySection";
import { useAppContext } from "@/context/AppContext";

const Home = () => {
  const router = useRouter();
  const { user, userRole } = useAppContext();

  const handleRoleSelection = (role) => {
    if (user) {
      // User is already logged in, redirect based on role
      if (userRole === 'donor') {
        router.push('/donor/discover');
      } else if (userRole === 'organization') {
        router.push('/organization-dashboard');
      } else if (userRole === 'admin') {
        router.push('/admin/dashboard');
      }
    } else {
      // User not logged in, redirect to connect page with role selection
      router.push(`/connect?role=${role}`);
    }
  };

  return (
    <>
      <EnhancedNavbar />
      <div 
        className="relative"
        style={{
          backgroundImage: 'url(/background/BackgroundUI.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}
      >
        {/* Hero Section */}
        <HeroSection 
          onRoleSelection={handleRoleSelection}
          user={user}
          userRole={userRole}
        />
        
        {/* Gallery Section */}
        <GallerySection />
        
        {/* Features Section */}
        <FeaturesSection />
      </div>
      <Footer />
    </>
  );
};

export default Home;