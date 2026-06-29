'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { locationService } from "@/lib/locationService";
import { MISSION_STATEMENT } from "@/config/missionStatement";

const UserDashboard = () => {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('organizations');

  // Mock data for organizations - in a real app, this would come from your API
  const mockOrganizations = [
    {
      id: 1,
      name: "Hope Women's Shelter",
      address: "123 Main St, Downtown",
      distance: "0.5 miles",
      description: "Providing safe housing and support services for women and children experiencing homelessness.",
      verified: true,
      phone: "(555) 123-4567",
      hours: "24/7",
      productsNeeded: ["Pads", "Tampons", "Menstrual Cups"],
      lat: 37.7749,
      lng: -122.4194
    },
    {
      id: 2,
      name: "Community Health Center",
      address: "456 Oak Ave, Midtown",
      distance: "1.2 miles",
      description: "Free healthcare services including reproductive health support for underserved communities.",
      verified: true,
      phone: "(555) 234-5678",
      hours: "Mon-Fri 8AM-6PM",
      productsNeeded: ["Pads", "Tampons", "Liners"],
      lat: 37.7849,
      lng: -122.4094
    },
    {
      id: 3,
      name: "Youth Empowerment Center",
      address: "789 Pine St, Uptown",
      distance: "2.1 miles",
      description: "Supporting young women with education, mentorship, and essential supplies.",
      verified: false,
      phone: "(555) 345-6789",
      hours: "Mon-Fri 3PM-8PM",
      productsNeeded: ["Pads", "Tampons"],
      lat: 37.7649,
      lng: -122.4294
    },
    {
      id: 4,
      name: "Family Resource Center",
      address: "321 Elm St, Westside",
      distance: "2.8 miles",
      description: "Comprehensive family support services including emergency supplies distribution.",
      verified: true,
      phone: "(555) 456-7890",
      hours: "Mon-Sat 9AM-5PM",
      productsNeeded: ["Pads", "Tampons", "Menstrual Cups", "Liners"],
      lat: 37.7549,
      lng: -122.4394
    },
    {
      id: 5,
      name: "Domestic Violence Safe House",
      address: "654 Maple Dr, Eastside",
      distance: "3.2 miles",
      description: "Confidential shelter providing safety and support for survivors of domestic violence.",
      verified: true,
      phone: "(555) 567-8901",
      hours: "24/7",
      productsNeeded: ["Pads", "Tampons", "Liners"],
      lat: 37.7449,
      lng: -122.4094
    },
    {
      id: 6,
      name: "Senior Women's Support Group",
      address: "987 Cedar Blvd, Northside",
      distance: "3.9 miles",
      description: "Supporting elderly women with dignity and access to essential health products.",
      verified: false,
      phone: "(555) 678-9012",
      hours: "Tue & Thu 10AM-2PM",
      productsNeeded: ["Pads", "Liners"],
      lat: 37.7349,
      lng: -122.4194
    },
    {
      id: 7,
      name: "LGBTQ+ Community Center",
      address: "147 Birch Ln, Southside",
      distance: "4.1 miles",
      description: "Inclusive support services for LGBTQ+ individuals including trans and non-binary people.",
      verified: true,
      phone: "(555) 789-0123",
      hours: "Mon-Fri 10AM-8PM",
      productsNeeded: ["Pads", "Tampons", "Menstrual Cups"],
      lat: 37.7249,
      lng: -122.4294
    },
    {
      id: 8,
      name: "Teen Parent Program",
      address: "258 Spruce St, Central",
      distance: "4.7 miles",
      description: "Supporting young parents with resources, education, and essential supplies.",
      verified: false,
      phone: "(555) 890-1234",
      hours: "Mon-Fri 2PM-7PM",
      productsNeeded: ["Pads", "Tampons"],
      lat: 37.7149,
      lng: -122.4394
    },
    {
      id: 9,
      name: "Homeless Outreach Center",
      address: "369 Walnut Ave, Riverside",
      distance: "5.2 miles",
      description: "Mobile and fixed services for individuals experiencing homelessness.",
      verified: true,
      phone: "(555) 901-2345",
      hours: "Mon-Sat 7AM-6PM",
      productsNeeded: ["Pads", "Tampons", "Liners"],
      lat: 37.7049,
      lng: -122.4194
    },
    {
      id: 10,
      name: "Refugee Women's Network",
      address: "741 Ash St, Hillside",
      distance: "5.8 miles",
      description: "Supporting refugee and immigrant women with integration and essential needs.",
      verified: true,
      phone: "(555) 012-3456",
      hours: "Mon-Fri 9AM-4PM",
      productsNeeded: ["Pads", "Tampons", "Menstrual Cups", "Liners"],
      lat: 37.6949,
      lng: -122.4094
    }
  ];

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        // Get user's location
        let location;
        try {
          location = await locationService.getCurrentLocation();
        } catch (error) {
          console.error("Error getting location:", error);
          location = { lat: 37.7749, lng: -122.4194 }; // San Francisco fallback
        }
        
        setUserLocation(location);

        // Fetch nearby organizations from API
        const response = await fetch(
          `/api/organizations/nearby?lat=${location.lat}&lng=${location.lng}&limit=10&radius=50`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.organizations)) {
            setOrganizations(data.organizations);
          } else {
            // Fallback to mock data if API response is invalid
            setOrganizations(mockOrganizations);
          }
        } else {
          // Fallback to mock data if API fails
          setOrganizations(mockOrganizations);
        }
      } catch (error) {
        console.error("Error loading organizations:", error);
        // Fallback to mock data
        setOrganizations(mockOrganizations);
        setUserLocation({ lat: 37.7749, lng: -122.4194 }); // San Francisco fallback
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  const handleOrganizationClick = (organization) => {
    if (organization.verified) {
      router.push(`/place-order?orgId=${organization.id}`);
    } else {
      alert("This organization is not yet verified for direct donations. Please contact them directly or visit in person.");
    }
  };

  const AboutContent = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-pink-100">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About GirlsWhoGive</h2>
      
      <div className="space-y-6 text-lg text-gray-700">
        <p>
          {MISSION_STATEMENT}
        </p>
        
        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h3>
        <p>
          We help donors and organizations coordinate in-kind giving—food, clothing, books, and more—so every contribution reaches the people who need it.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📍</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Find Organizations</h4>
            <p className="text-gray-600">Discover verified organizations near you that accept donations</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💝</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Make Donations</h4>
            <p className="text-gray-600">Commit to donating in-kind items that go directly to organizations</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Track Impact</h4>
            <p className="text-gray-600">See how your donations make a real difference in your community</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Verified Organizations</h3>
        <p>
          Organizations with a ✓ checkmark are verified partners who have completed our 
          registration process. You can place direct orders for these organizations, 
          ensuring your donations reach those who need them most.
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div 
          className="relative min-h-screen flex items-center justify-center"
          style={{
            backgroundImage: 'url(/background/BackgroundUI.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            minHeight: '100vh'
          }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Finding organizations near you...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
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
        <div className="px-6 md:px-16 lg:px-32 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Organizations Near You
            </h1>
            <p className="text-lg text-gray-600">
              Discover local organizations that accept in-kind donations
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-pink-100">
              <button
                onClick={() => setActiveTab('organizations')}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeTab === 'organizations'
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Organizations
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeTab === 'about'
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                About
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'organizations' ? (
            <div className="space-y-6">
              {organizations && Array.isArray(organizations) && organizations.length > 0 ? (
                organizations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => handleOrganizationClick(org)}
                  className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                    org.verified ? 'border-green-200 bg-green-50/70' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{org.name}</h3>
                        {org.verified && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">📍 {org.address}</p>
                      <p className="text-pink-600 font-medium mb-3">🚗 {org.distance} away</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{org.description}</p>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="text-gray-900">{org.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Hours</p>
                      <p className="text-gray-900">{org.hours}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Products Needed</p>
                      <div className="flex flex-wrap gap-1">
                        {org.productsNeeded.map((product, index) => (
                          <span key={index} className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {org.verified ? (
                        <span className="text-green-600 font-medium">✓ Click to place an order</span>
                      ) : (
                        <span className="text-orange-600 font-medium">Contact directly or visit in person</span>
                      )}
                    </div>
                    <button className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors">
                      {org.verified ? 'Place Order' : 'Contact'}
                    </button>
                  </div>
                </div>
              ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No organizations found</h3>
                  <p className="text-gray-600">Check back later for available organizations.</p>
                </div>
              )}
            </div>
          ) : (
            <AboutContent />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;
