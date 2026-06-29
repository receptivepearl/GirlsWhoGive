'use client'
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

const PlaceOrderContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userRole, createDonation } = useAppContext();
  const orgId = searchParams.get('orgId');
  const driveId = searchParams.get('driveId');
  
  const [organization, setOrganization] = useState(null);
  const [drive, setDrive] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch organization data from API
  const fetchOrganization = async (orgId) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.organization;
        }
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
    return null;
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
    // Redirect if not authenticated or not a donor
    if (!user) {
      router.push('/connect?role=donor');
      return;
    }
    if (userRole && userRole !== 'donor') {
      router.push('/');
      return;
    }

    const loadOrganization = async () => {
      if (orgId) {
        const org = await fetchOrganization(orgId);
        if (org) {
          setOrganization(org);
          if (driveId) {
            try {
              const driveRes = await fetch(`/api/drives/${driveId}`);
              const driveData = await driveRes.json();
              if (driveData.success && driveData.drive.organizationId === orgId) {
                setDrive(driveData.drive);
              } else {
                router.push(`/donor/place-order?orgId=${orgId}`);
              }
            } catch (error) {
              console.error('Error fetching drive:', error);
            }
          }
        } else {
          router.push('/donor/discover');
        }
      } else {
        router.push('/donor/discover');
      }
      setLoading(false);
    };

    loadOrganization();
  }, [orgId, driveId, router, user, userRole]);

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
        return [...prev, { 
          productType: productType.id, 
          name: productType.name, 
          quantity: 1, 
          description: '' 
        }];
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP).');
        e.target.value = '';
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image size must be less than 5MB.');
        e.target.value = '';
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      alert('Please add at least one item to your donation commitment.');
      return;
    }

    setSubmitting(true);
    try {
      // Create FormData instead of JSON
      const formData = new FormData();
      formData.append('organizationId', organization.id || organization._id);
      formData.append('organizationName', organization.name);
      formData.append('items', JSON.stringify(orderItems));
      formData.append('totalItems', getTotalItems().toString());
      formData.append('status', 'pending');
      formData.append('donorName', user.firstName + ' ' + user.lastName);
      formData.append('donorEmail', user.emailAddresses[0].emailAddress);
      if (driveId) {
        formData.append('driveId', driveId);
      }
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const result = await createDonation(formData);
      if (result) {
        router.push('/donor/donations');
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      alert('Error creating donation commitment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <EnhancedNavbar />
        <div 
          className="relative min-h-screen flex items-center justify-center pt-16"
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
        <div className="px-6 md:px-16 lg:px-32 py-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Create Donation Commitment
            </h1>
            <p className="text-lg text-gray-600">
              Commit to donating in-kind items to {organization.name}
              {drive && ` — ${drive.name}`}
            </p>
          </div>

          {drive && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-6 mb-8">
              <h2 className="text-xl font-bold text-purple-900 mb-2">🎯 Donation Drive: {drive.name}</h2>
              <p className="text-purple-800 text-sm mb-3">
                Goal: {drive.currentAmount} / {drive.goalAmount} items collected
              </p>
              {drive.comments && (
                <p className="text-sm text-purple-700">{drive.comments}</p>
              )}
            </div>
          )}

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
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Donation Commitment</h3>
              
              {orderItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🛍️</div>
                  <p className="text-gray-600">No items added yet</p>
                  <p className="text-sm text-gray-500">Select products from the left to start your donation commitment</p>
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
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              updateQuantity(item.productType, value);
                            }}
                            className="w-20 text-center font-medium border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            aria-label={`Quantity of ${item.name}`}
                          />
                          <button
                            onClick={() => updateQuantity(item.productType, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center transition-colors"
                            aria-label="Increase quantity"
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
                    {/* Image Upload Section */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload a photo of your donation (optional)
                      </label>
                      {!imagePreview ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                            id="donation-image-input"
                          />
                          <label
                            htmlFor="donation-image-input"
                            className="cursor-pointer flex flex-col items-center"
                          >
                            <div className="text-3xl mb-2">📷</div>
                            <p className="text-sm text-gray-600">Click to upload image</p>
                            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF, or WebP (max 5MB)</p>
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Donation preview"
                            className="w-full h-48 object-cover rounded-lg border-2 border-pink-200"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-900">Total Items:</span>
                      <span className="text-xl font-bold text-pink-600">{getTotalItems()}</span>
                    </div>
                    
                    <button
                      onClick={handleSubmitOrder}
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {submitting ? 'Creating Commitment...' : 'Create Donation Commitment'}
                    </button>
                    
                    <p className="text-sm text-gray-500 text-center mt-3">
                      This creates a donation commitment. You'll coordinate delivery directly with {organization.name}.
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

const PlaceOrderPage = () => {
  return (
    <Suspense fallback={
      <>
        <EnhancedNavbar />
        <div 
          className="relative min-h-screen flex items-center justify-center pt-16"
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

export default PlaceOrderPage;






