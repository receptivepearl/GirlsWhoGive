'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";
import ContactPopup from "@/components/ContactPopup";
import { useAppContext } from "@/context/AppContext";
import { locationService } from "@/lib/locationService";
import axios from "axios";
import { DONATION_TYPES, DONATION_TYPE_CONFIG } from "@/config/donationTypes";


const DiscoverPage = () => {
  const router = useRouter();
  const { user, userRole } = useAppContext();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedDonationType, setSelectedDonationType] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  const [loadingOrgDetails, setLoadingOrgDetails] = useState(false);

  // Get user's current location (works for both logged in and not logged in)
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        setLoading(true);
        const location = await locationService.getCurrentLocation();
        setUserLocation(location);
        await loadOrganizations(location);
      } catch (error) {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to get your location. Please ensure location services are enabled on your device/OS.';
        if (error && error.code === 3) {
          errorMessage = 'Location request timed out. Please check your signal and try refreshing.';
        } else if (error && error.code === 2) {
          errorMessage = 'Location is unavailable. Please check system location services.';
        } else if (error && error.code === 1) {
          errorMessage = 'Location permission denied. Please grant location access in your browser settings.';
        }

        setLocationError(errorMessage);
        
        // Use default location (San Francisco) as fallback
        const fallbackLocation = { lat: 37.7749, lng: -122.4194 };
        setUserLocation(fallbackLocation);
        setLocationError(prev => prev + ' Displaying organizations for San Francisco as a fallback.');
        await loadOrganizations(fallbackLocation);
      } finally {
        setLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Load organizations based on location and filters
  const loadOrganizations = async (location, query = '', verifiedOnlyFilter = false, donationType = null) => {
    if (!location) return;

    try {
      setSearchLoading(true);
      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        query: query,
        verifiedOnly: verifiedOnlyFilter.toString(),
        radius: '50000' // 50km
      });
      
      // Add donation type if selected
      if (donationType) {
        params.append('donationType', donationType);
      }

      const response = await fetch(`/api/organizations/nearby?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrganizations(data.organizations);
        } else {
          console.error('Error loading organizations:', data.message);
          setOrganizations([]);
        }
      } else {
        console.error('Failed to fetch organizations');
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      setOrganizations([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!userLocation) return;
    await loadOrganizations(userLocation, searchQuery, verifiedOnly, selectedDonationType);
  };

  // Handle verified filter change
  const handleVerifiedFilterChange = async (verified) => {
    setVerifiedOnly(verified);
    await loadOrganizations(userLocation, searchQuery, verified, selectedDonationType);
  };

  // Handle donation type change
  const handleDonationTypeChange = async (donationType) => {
    const newType = selectedDonationType === donationType ? null : donationType;
    setSelectedDonationType(newType);
    await loadOrganizations(userLocation, searchQuery, verifiedOnly, newType);
  };

  const handleOrganizationClick = async (organization) => {
    if (!user) return;

    // If verified and not a Google Place, go to place order
    if (organization.verified && !organization.isGooglePlace) {
      router.push(`/donor/place-order?orgId=${organization.id}`);
    } else {
      // For unverified organizations, show contact popup
      let orgDetails = { ...organization };
      
      setLoadingOrgDetails(true);
      try {
        if (!organization.isGooglePlace && organization.id) {
          // It's a registered organization, try to fetch full details
          const response = await axios.get(`/api/organizations/${organization.id}`);
          if (response.data.success) {
            orgDetails = {
              ...organization,
              email: response.data.organization.email || organization.email,
              phone: response.data.organization.phone || organization.phone,
              address: response.data.organization.address || organization.address,
            };
          }
        } else if (organization.isGooglePlace && organization.id) {
          // It's a Google Place, fetch detailed contact information
          try {
            const placeDetails = await locationService.getPlaceDetails(organization.id);
            orgDetails = {
              ...organization,
              phone: placeDetails.formatted_phone_number || placeDetails.international_phone_number || organization.phone || null,
              website: placeDetails.website || organization.website || null,
              email: organization.email || null,
              address: placeDetails.formatted_address || placeDetails.vicinity || organization.address,
            };
          } catch (error) {
            console.error('Error fetching Google Place details:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching organization details:', error);
      } finally {
        setLoadingOrgDetails(false);
      }
      
      setSelectedOrganization(orgDetails);
      setIsContactPopupOpen(true);
    }
  };

  return (
    <>
      <EnhancedNavbar />
      <ContactPopup 
        organization={selectedOrganization}
        isOpen={isContactPopupOpen}
        onClose={() => {
          setIsContactPopupOpen(false);
          setSelectedOrganization(null);
        }}
      />
      {loadingOrgDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading contact information...</p>
          </div>
        </div>
      )}
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
        <div className="px-6 md:px-16 lg:px-32 py-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover Organizations
            </h1>
            <p className="text-lg text-gray-600">
              Find nearby organizations that accept donations
            </p>
            {locationError && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-md mx-auto">
                <p className="text-yellow-800 text-sm">{locationError}</p>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100 mb-8">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search for organizations, shelters, or donation centers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Donation Type Selector */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What would you like to donate?
                </label>
                <div className="flex flex-wrap gap-3">
                  {Object.values(DONATION_TYPES).map((type) => {
                    const config = DONATION_TYPE_CONFIG[type];
                    const isSelected = selectedDonationType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => handleDonationTypeChange(type)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          isSelected
                            ? 'bg-pink-600 text-white shadow-md transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                        }`}
                      >
                        <span className="text-lg">{config.icon}</span>
                        <span>{config.label}</span>
                        {isSelected && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedDonationType && (
                  <button
                    onClick={() => handleDonationTypeChange(selectedDonationType)}
                    className="mt-3 text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="verifiedOnly"
                    checked={verifiedOnly}
                    onChange={(e) => handleVerifiedFilterChange(e.target.checked)}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="verifiedOnly" className="text-sm font-medium text-gray-700">
                    Show only verified organizations
                  </label>
                </div>
                
                <div className="text-sm text-gray-500">
                  {organizations.length} organizations found
                </div>
              </div>
            </div>
          </div>

          {/* Organizations List */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading organizations...</p>
              </div>
            ) : organizations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No organizations found</h3>
                <p className="text-gray-600">Check back later for available organizations.</p>
              </div>
            ) : (
              organizations.map((org) => (
              <div
                key={org.id || org._id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{org.name}</h3>
                      {org.verified ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      ) : org.isGooglePlace ? (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Google Place
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Unverified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2 flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {org.address}
                    </p>
                    {org.distance && (
                      <p className="text-pink-600 font-medium mb-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {org.distance} • {org.duration}
                      </p>
                    )}
                  </div>
                  {org.photoUrl && (
                    <img 
                      src={org.photoUrl} 
                      alt={org.name}
                      className="w-20 h-20 rounded-lg object-cover ml-4"
                    />
                  )}
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {org.description || 'Community organization providing support services.'}
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Rating</p>
                    <p className="text-gray-900">
                      {org.rating ? `${org.rating}/5 (${org.userRatingsTotal} reviews)` : 'No rating'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <p className="text-gray-900">
                      {org.isGooglePlace ? 'Google Place' : 'Registered Organization'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className="text-gray-900">
                      {org.verified ? 'Can accept online donations' : 'Visit in person'}
                    </p>
                  </div>
                </div>

                {user && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {org.verified && !org.isGooglePlace ? (
                      <span className="text-green-600 font-medium">
                        ✓ Click to place a donation order
                      </span>
                    ) : (
                      <span className="text-orange-600 font-medium">
                        Contact directly or visit in person
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleOrganizationClick(org)}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base transition-colors min-h-[44px] ${
                      org.verified && !org.isGooglePlace
                        ? 'bg-pink-600 text-white hover:bg-pink-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {org.verified && !org.isGooglePlace ? 'Place Order' : 'Contact'}
                  </button>
                </div>
                )}
              </div>
              ))
            )}
          </div>

          {/* Help Section */}
          <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Verified Organizations</h4>
                <p className="text-gray-600 text-sm">
                  Organizations with a ✓ checkmark are verified and accept direct donation orders through our platform.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Unverified Organizations</h4>
                <p className="text-gray-600 text-sm">
                  These organizations haven't completed verification yet. You can still contact them directly or visit in person.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DiscoverPage;





