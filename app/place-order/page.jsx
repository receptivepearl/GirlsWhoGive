'use client'
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PlaceOrderContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');
  const [organization, setOrganization] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock organization data - in a real app, this would come from your API
  const mockOrganizations = {
    1: {
      id: 1,
      name: "Hope Women's Shelter",
      address: "123 Main St, Downtown",
      description: "Providing safe housing and support services for women and children experiencing homelessness.",
      phone: "(555) 123-4567",
      email: "donations@hopewomensshelter.org"
    },
    2: {
      id: 2,
      name: "Community Health Center",
      address: "456 Oak Ave, Midtown",
      description: "Free healthcare services including reproductive health support for underserved communities.",
      phone: "(555) 234-5678",
      email: "donations@communityhealth.org"
    },
    4: {
      id: 4,
      name: "Family Resource Center",
      address: "321 Elm St, Westside",
      description: "Comprehensive family support services including emergency supplies distribution.",
      phone: "(555) 456-7890",
      email: "donations@familyresource.org"
    },
    5: {
      id: 5,
      name: "Domestic Violence Safe House",
      address: "654 Maple Dr, Eastside",
      description: "Confidential shelter providing safety and support for survivors of domestic violence.",
      phone: "(555) 567-8901",
      email: "donations@dvsafehouse.org"
    },
    7: {
      id: 7,
      name: "LGBTQ+ Community Center",
      address: "147 Birch Ln, Southside",
      description: "Inclusive support services for LGBTQ+ individuals including trans and non-binary people.",
      phone: "(555) 789-0123",
      email: "donations@lgbtqcenter.org"
    },
    9: {
      id: 9,
      name: "Homeless Outreach Center",
      address: "369 Walnut Ave, Riverside",
      description: "Mobile and fixed services for individuals experiencing homelessness.",
      phone: "(555) 901-2345",
      email: "donations@homelessoutreach.org"
    },
    10: {
      id: 10,
      name: "Refugee Women's Network",
      address: "741 Ash St, Hillside",
      description: "Supporting refugee and immigrant women with integration and essential needs.",
      phone: "(555) 012-3456",
      email: "donations@refugeewomen.org"
    }
  };

  const productTypes = [
    { id: 'pads', name: 'Sanitary Pads', description: 'Regular and overnight pads in various sizes' },
    { id: 'tampons', name: 'Tampons', description: 'Regular and super tampons with applicators' },
    { id: 'menstrual_cups', name: 'Menstrual Cups', description: 'Reusable silicone menstrual cups' },
    { id: 'liners', name: 'Pantyliners', description: 'Daily liners and pantyliners' },
    { id: 'period_underwear', name: 'Period Underwear', description: 'Absorbent underwear for light to moderate flow' },
    { id: 'pain_relief', name: 'Pain Relief', description: 'Ibuprofen, heating pads, and other comfort items' }
  ];

  useEffect(() => {
    if (orgId && mockOrganizations[orgId]) {
      setOrganization(mockOrganizations[orgId]);
      setLoading(false);
    } else {
      router.push('/user-dashboard');
    }
  }, [orgId, router]);

  const addItem = (productType) => {
    setOrderItems(prev => {
      const existingItem = prev.find(item => item.productType === productType.id);
      if (existingItem) {
        return prev.map(item =>
          item.productType === productType.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { productType: productType.id, name: productType.name, quantity: 1, description: '' }];
      }
    });
  };

  const updateQuantity = (productType, quantity) => {
    if (quantity <= 0) {
      setOrderItems(prev => prev.filter(item => item.productType !== productType));
    } else {
      setOrderItems(prev =>
        prev.map(item =>
          item.productType === productType
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const updateDescription = (productType, description) => {
    setOrderItems(prev =>
      prev.map(item =>
        item.productType === productType
          ? { ...item, description }
          : item
      )
    );
  };

  const getTotalItems = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      alert('Please add at least one item to your order.');
      return;
    }

    // In a real app, this would submit to your API
    const orderData = {
      organizationId: orgId,
      organizationName: organization.name,
      items: orderItems,
      totalItems: getTotalItems(),
      timestamp: new Date().toISOString()
    };

    console.log('Order submitted:', orderData);
    alert(`Order placed successfully for ${organization.name}! Thank you for your donation.`);
    router.push('/user-dashboard');
  };

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
            <p className="text-gray-600">Loading organization details...</p>
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
              Place Your Donation Order
            </h1>
            <p className="text-lg text-gray-600">
              Help make a difference by donating in-kind items to organizations in need
            </p>
          </div>

          {/* Organization Info */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{organization.name}</h2>
              <p className="text-gray-600 mb-4">📍 {organization.address}</p>
              <p className="text-gray-700 leading-relaxed">{organization.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="text-gray-900">{organization.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-gray-900">{organization.email}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Selection */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Select Products to Donate</h3>
              
              <div className="space-y-4">
                {productTypes.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-2xl p-4 hover:border-pink-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </div>
                      <button
                        onClick={() => addItem(product)}
                        className="bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 transition-colors text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Donation</h3>
              
              {orderItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🛍️</div>
                  <p className="text-gray-600">No items added yet</p>
                  <p className="text-sm text-gray-500">Select products from the left to start your donation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.productType} className="border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.productType, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productType, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <textarea
                        placeholder="Add any specific details (brand preferences, sizes, etc.)"
                        value={item.description}
                        onChange={(e) => updateDescription(item.productType, e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none"
                        rows="2"
                      />
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-900">Total Items:</span>
                      <span className="text-xl font-bold text-pink-600">{getTotalItems()}</span>
                    </div>
                    
                    <button
                      onClick={handleSubmitOrder}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Place Donation Order
                    </button>
                    
                    <p className="text-sm text-gray-500 text-center mt-3">
                      Your donation will be coordinated with {organization.name} for pickup or delivery
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors underline"
            >
              ← Back to Organizations
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const PlaceOrder = () => {
  return (
    <Suspense fallback={
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
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    }>
      <PlaceOrderContent />
    </Suspense>
  );
};

export default PlaceOrder;













