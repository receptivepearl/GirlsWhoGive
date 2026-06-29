'use client'
import React from "react";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";
import StatsSection from "@/components/StatsSection";

const ImpactPage = () => {
  return (
    <>
      <EnhancedNavbar />
      <div 
        className="relative min-h-screen"
        style={{
          backgroundImage: 'url(/background/BackgroundUI.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}
      >
        <div className="pt-20">
          <StatsSection />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ImpactPage;





