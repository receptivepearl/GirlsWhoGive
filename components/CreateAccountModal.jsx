'use client'
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { useClerk } from "@clerk/nextjs";
import { DONATION_TYPES, DONATION_TYPE_CONFIG } from "@/config/donationTypes";

const CreateAccountModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, userRole } = useAppContext();
  const { openSignIn, openSignUp } = useClerk();
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [organizationForm, setOrganizationForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    website: '',
    taxId: ''
  });
  const [acceptedDonationTypes, setAcceptedDonationTypes] = useState([]);
  const [adminInvitationCode, setAdminInvitationCode] = useState('');
  const [invitationError, setInvitationError] = useState('');

  useEffect(() => {
    // If user is already logged in and has a role, close modal and redirect appropriately
    if (user && userRole) {
      onClose();
      if (userRole === 'donor') {
        router.push('/donor/discover');
      } else if (userRole === 'organization') {
        router.push('/organization-dashboard');
      } else if (userRole === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, userRole, router, onClose]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleSignUp = async () => {
    if (selectedRole === 'organization') {
      // For organizations, we need to collect additional info first
      if (!organizationForm.name || !organizationForm.address) {
        alert('Please fill in organization name and address');
        return;
      }
      // Require at least one donation category to be selected
      if (acceptedDonationTypes.length === 0) {
        alert('Please select at least one donation category your organization accepts');
        return;
      }
      // Store organization data including accepted donation types
      const orgDataWithCategories = {
        ...organizationForm,
        acceptedDonationTypes: acceptedDonationTypes
      };
      localStorage.setItem('organizationData', JSON.stringify(orgDataWithCategories));
    }
    
    if (selectedRole === 'admin') {
      // Check invitation code for admin
      if (adminInvitationCode.trim() !== 'BlueParrot') {
        setInvitationError('Invalid invitation code. Please contact the platform administrators for access.');
        return;
      }
      setInvitationError('');
    }
    
    // Store the selected role in localStorage for after signup
    localStorage.setItem('selectedRole', selectedRole);
    openSignUp();
  };

  const handleSignIn = () => {
    onClose();
    openSignIn();
  };

  const handleOrganizationFormChange = (field, value) => {
    setOrganizationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDonationTypeToggle = (donationType) => {
    setAcceptedDonationTypes(prev => {
      if (prev.includes(donationType)) {
        return prev.filter(type => type !== donationType);
      } else {
        return [...prev, donationType];
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-6 md:p-12">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Connect with GirlsWhoGive
                  </h1>
                  <p className="text-lg text-gray-600">
                    Choose your role and join our community
                  </p>
                </div>

                {/* Role Selection */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg border border-pink-100 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Role</h2>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleRoleSelect('donor')}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        selectedRole === 'donor'
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="text-4xl mb-4">👤</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Donor</h3>
                      <p className="text-gray-600 text-sm">
                        Find organizations near you and make donation commitments
                      </p>
                    </button>

                    <button
                      onClick={() => handleRoleSelect('organization')}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        selectedRole === 'organization'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-4xl mb-4">🏢</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Organization</h3>
                      <p className="text-gray-600 text-sm">
                        Receive donations and track your impact in the community
                      </p>
                    </button>

                    <button
                      onClick={() => handleRoleSelect('admin')}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        selectedRole === 'admin'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="text-4xl mb-4">👨‍💼</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Administrator</h3>
                      <p className="text-gray-600 text-sm">
                        Manage platform operations and organization verification
                      </p>
                    </button>
                  </div>
                </div>

                {/* Organization Form */}
                {selectedRole === 'organization' && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg border border-pink-100 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Organization Information</h2>
                    <p className="text-gray-600 mb-6">
                      Please provide your organization details. This information will be used for verification.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name *
                        </label>
                        <input
                          type="text"
                          value={organizationForm.name}
                          onChange={(e) => handleOrganizationFormChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Your organization name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          value={organizationForm.address}
                          onChange={(e) => handleOrganizationFormChange('address', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Full address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={organizationForm.phone}
                          onChange={(e) => handleOrganizationFormChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={organizationForm.email}
                          onChange={(e) => handleOrganizationFormChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="contact@organization.org"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={organizationForm.website}
                          onChange={(e) => handleOrganizationFormChange('website', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="https://www.organization.org"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax ID / EIN
                        </label>
                        <input
                          type="text"
                          value={organizationForm.taxId}
                          onChange={(e) => handleOrganizationFormChange('taxId', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="12-3456789"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Description
                        </label>
                        <textarea
                          value={organizationForm.description}
                          onChange={(e) => handleOrganizationFormChange('description', e.target.value)}
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Describe your organization's mission and the communities you serve..."
                        />
                      </div>

                      {/* Donation Categories Selection */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          What types of donations does your organization accept? *
                        </label>
                        <p className="text-sm text-gray-500 mb-4">
                          Select all that apply. This helps donors find your organization when searching for specific donation types.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.values(DONATION_TYPES).map((type) => {
                            const config = DONATION_TYPE_CONFIG[type];
                            const isSelected = acceptedDonationTypes.includes(type);
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => handleDonationTypeToggle(type)}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                  isSelected
                                    ? 'border-pink-500 bg-pink-50 shadow-md'
                                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xl">{config.icon}</span>
                                  <span className={`font-medium text-sm ${isSelected ? 'text-pink-700' : 'text-gray-700'}`}>
                                    {config.label}
                                  </span>
                                  {isSelected && (
                                    <svg className="w-4 h-4 text-pink-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {acceptedDonationTypes.length === 0 && (
                          <p className="mt-2 text-sm text-red-600">
                            Please select at least one donation category
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Authentication Actions */}
                {selectedRole && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg border border-pink-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {selectedRole === 'donor' ? 'Join as a Donor' : 
                       selectedRole === 'organization' ? 'Register Your Organization' : 
                       'Administrator Access'}
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={handleSignUp}
                        className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                          selectedRole === 'donor' 
                            ? 'bg-pink-600 text-white hover:bg-pink-700' :
                          selectedRole === 'organization'
                            ? 'bg-purple-600 text-white hover:bg-purple-700' :
                            'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {selectedRole === 'admin' ? 'Request Admin Access' : 'Create Account'}
                      </button>
                      
                      <button
                        onClick={handleSignIn}
                        className="px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-600 transition-all duration-300"
                      >
                        Sign In
                      </button>
                    </div>

                    {selectedRole === 'organization' && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Organizations are automatically verified upon registration. 
                          You'll be able to receive donations immediately after account creation.
                        </p>
                      </div>
                    )}

                    {selectedRole === 'admin' && (
                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Invitation Code *
                          </label>
                          <input
                            type="text"
                            value={adminInvitationCode}
                            onChange={(e) => {
                              setAdminInvitationCode(e.target.value);
                              setInvitationError('');
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              invitationError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Enter invitation code"
                          />
                          {invitationError && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-600 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              {invitationError}
                            </motion.p>
                          )}
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Administrator access requires a valid invitation code. 
                            Please contact the platform administrators if you need access.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateAccountModal;
