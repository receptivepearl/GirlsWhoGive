'use client'
import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { useClerk } from "@clerk/nextjs";
import { DONATION_TYPES, DONATION_TYPE_CONFIG } from "@/config/donationTypes";
import toast from "react-hot-toast";

const ConnectContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userRole, organizationProfile, createUser, createOrganization, fetchUserData } = useAppContext();
  const { openSignUp } = useClerk();

  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || null);
  const [signupPhase, setSignupPhase] = useState('choose-role');
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [organizationForm, setOrganizationForm] = useState({
    name: '',
    address: '',
    location: '',
    phone: '',
    email: '',
    description: '',
    website: '',
    taxId: ''
  });
  const [acceptedDonationTypes, setAcceptedDonationTypes] = useState([]);
  const [isOrgAdministrator, setIsOrgAdministrator] = useState(false);
  const [parentOrganizationId, setParentOrganizationId] = useState('');
  const [parentOrganizations, setParentOrganizations] = useState([]);
  const [loadingParentOrgs, setLoadingParentOrgs] = useState(false);
  const [adminInvitationCode, setAdminInvitationCode] = useState('');
  const [invitationError, setInvitationError] = useState('');

  const isCompleteStep = searchParams.get('step') === 'complete';

  useEffect(() => {
    const storedRole = localStorage.getItem('selectedRole');
    if (user && storedRole) {
      setSelectedRole(storedRole);
      setSignupPhase('complete-profile');
    } else if (user && userRole === 'organization' && !organizationProfile) {
      localStorage.setItem('selectedRole', 'organization');
      setSelectedRole('organization');
      setSignupPhase('complete-profile');
    } else if (isCompleteStep && user && userRole && !storedRole) {
      setSignupPhase('choose-role');
    }
  }, [user, userRole, organizationProfile, isCompleteStep]);

  useEffect(() => {
    if (signupPhase !== 'complete-profile' || selectedRole !== 'organization' || isOrgAdministrator) return;

    const fetchParentOrganizations = async () => {
      setLoadingParentOrgs(true);
      try {
        const response = await fetch('/api/organizations/parent-organizations');
        const data = await response.json();
        if (data.success) {
          setParentOrganizations(data.organizations || []);
        }
      } catch (error) {
        console.error('Error fetching parent organizations:', error);
      } finally {
        setLoadingParentOrgs(false);
      }
    };

    fetchParentOrganizations();
  }, [signupPhase, selectedRole, isOrgAdministrator]);

  useEffect(() => {
    if (!user || !userRole) return;
    const storedRole = localStorage.getItem('selectedRole');
    if (storedRole) return;

    if (userRole === 'organization' && !organizationProfile) return;

    if (userRole === 'donor') {
      router.push('/donor/discover');
    } else if (userRole === 'organization') {
      router.push('/organization-dashboard');
    } else if (userRole === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [user, userRole, organizationProfile, router]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role !== 'organization') {
      setIsOrgAdministrator(false);
      setParentOrganizationId('');
    }
  };

  const handleStartSignUp = () => {
    if (!selectedRole) {
      alert('Please choose an account type first');
      return;
    }

    if (selectedRole === 'admin') {
      if (adminInvitationCode.trim() !== 'BlueParrot') {
        setInvitationError('Invalid invitation code. Please contact the platform administrators for access.');
        return;
      }
      setInvitationError('');
    }

    localStorage.setItem('selectedRole', selectedRole);
    const redirectUrl = `${window.location.origin}/connect?step=complete`;

    openSignUp({
      forceRedirectUrl: redirectUrl,
      signInForceRedirectUrl: redirectUrl,
    });
  };

  const validateOrganizationForm = () => {
    if (isOrgAdministrator) {
      if (!organizationForm.name.trim()) {
        alert('Please enter the name of your organization');
        return false;
      }
    } else {
      if (!parentOrganizationId) {
        alert('Please select which organization you are a chapter of');
        return false;
      }
      if (!organizationForm.name.trim()) {
        alert('Please enter your chapter name');
        return false;
      }
      if (!organizationForm.location.trim()) {
        alert('Please enter your chapter location');
        return false;
      }
    }

    if (!organizationForm.address) {
      alert(isOrgAdministrator ? 'Please fill in your organization address' : 'Please fill in your chapter address');
      return false;
    }

    if (acceptedDonationTypes.length === 0) {
      alert('Please select at least one donation category your organization accepts');
      return false;
    }

    return true;
  };

  const handleCompleteProfile = async () => {
    const role = localStorage.getItem('selectedRole') || selectedRole;
    if (!role || !user) return;

    setSubmittingProfile(true);
    try {
      if (role === 'organization') {
        if (!validateOrganizationForm()) {
          setSubmittingProfile(false);
          return;
        }

        await createUser('organization');

        const orgData = {
          ...organizationForm,
          acceptedDonationTypes,
          isOrgAdministrator,
          parentOrganizationId: isOrgAdministrator ? null : parentOrganizationId,
        };

        const result = await createOrganization(orgData);

        localStorage.removeItem('selectedRole');
        await fetchUserData();

        if (result?.pendingApproval) {
          toast.success('Registration submitted! Await platform administrator approval to unlock your dashboard.');
          router.push('/organization-dashboard');
        } else {
          toast.success('Organization profile saved!');
          router.push('/organization-dashboard');
        }
        return;
      }

      await createUser(role);
      localStorage.removeItem('selectedRole');
      await fetchUserData();

      if (role === 'donor') {
        toast.success('Welcome! Your donor account is ready.');
        router.push('/donor/discover');
      } else if (role === 'admin') {
        toast.success('Admin account created successfully.');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleSignIn = () => {
    router.push('/sign-in');
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
      }
      return [...prev, donationType];
    });
  };

  const roleLabels = {
    donor: 'Donor',
    organization: 'Organization/Chapter',
    admin: 'Administrator',
  };

  return (
    <>
      <EnhancedNavbar />
      <div
        className="relative min-h-screen py-12 pt-16"
        style={{
          backgroundImage: 'url(/background/BackgroundUI.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Connect with GirlsWhoGive
            </h1>
            <p className="text-lg text-gray-600">
              {signupPhase === 'complete-profile'
                ? 'Complete your profile to finish setting up your account'
                : 'Choose your role and join our community'}
            </p>
          </div>

          {signupPhase === 'choose-role' && (
            <>
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-pink-100 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Role</h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <button
                    onClick={() => handleRoleSelect('donor')}
                    className={`p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left h-full flex flex-col ${
                      selectedRole === 'donor'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">👤</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">Donor</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Find organizations near you and make donation commitments
                    </p>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('organization')}
                    className={`p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left h-full flex flex-col ${
                      selectedRole === 'organization'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">🏢</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                      Organization / Chapter
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Receive donations and track your impact as an organization or chapter
                    </p>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className={`p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left h-full flex flex-col sm:col-span-2 lg:col-span-1 ${
                      selectedRole === 'admin'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">👨‍💼</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">Administrator</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Manage platform operations and organization verification
                    </p>
                  </button>
                </div>
              </div>

              {selectedRole && (
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-pink-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {selectedRole === 'donor' ? 'Join as a Donor' :
                     selectedRole === 'organization' ? 'Register as Organization/Chapter' :
                     'Administrator Access'}
                  </h2>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    First, create your login with email and password. After that, you will return here to enter your {roleLabels[selectedRole]?.toLowerCase()} details.
                  </p>

                  {selectedRole === 'admin' && (
                    <div className="mb-6 space-y-4">
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
                            className="mt-2 text-sm text-red-600"
                          >
                            {invitationError}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleStartSignUp}
                      className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                        selectedRole === 'donor'
                          ? 'bg-pink-600 text-white hover:bg-pink-700' :
                        selectedRole === 'organization'
                          ? 'bg-purple-600 text-white hover:bg-purple-700' :
                          'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {selectedRole === 'admin' ? 'Create Admin Account' : 'Create Account'}
                    </button>

                    <button
                      onClick={handleSignIn}
                      className="px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-600 transition-all duration-300"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {signupPhase === 'complete-profile' && user && selectedRole && (
            <>
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-pink-100 mb-8">
                <p className="text-gray-700">
                  Signed in as <strong>{user.emailAddresses?.[0]?.emailAddress}</strong>. Complete your{' '}
                  <strong>{roleLabels[selectedRole]}</strong> profile below.
                </p>
              </div>

              {selectedRole === 'organization' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-pink-100 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Organization/Chapter Information</h2>
                  <p className="text-gray-600 mb-6">
                    Tell us about your organization or chapter. This information will be saved to your account.
                  </p>

                  <div
                    className={`mb-8 rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300 ${
                      isOrgAdministrator
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md ring-2 ring-purple-200'
                        : 'border-purple-200 bg-gradient-to-br from-purple-50/80 to-indigo-50/50 hover:border-purple-400'
                    }`}
                  >
                    <label className="flex flex-col sm:flex-row sm:items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOrgAdministrator}
                        onChange={(e) => {
                          setIsOrgAdministrator(e.target.checked);
                          if (e.target.checked) setParentOrganizationId('');
                        }}
                        className="h-5 w-5 sm:mt-0.5 flex-shrink-0 rounded border-purple-400 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="min-w-0">
                        <span className="block text-base sm:text-lg font-bold text-purple-900 leading-snug">
                          I am an Organization Administrator
                        </span>
                        <p className="mt-1 text-sm text-purple-800 leading-relaxed">
                          Check this if you oversee multiple chapters under your organization.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {isOrgAdministrator ? (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
                        <input
                          type="text"
                          value={organizationForm.name}
                          onChange={(e) => handleOrganizationFormChange('name', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                          placeholder="e.g., Girls Who Give National"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
                            Which organization are you a chapter of? *
                          </label>
                          <select
                            value={parentOrganizationId}
                            onChange={(e) => setParentOrganizationId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white"
                            disabled={loadingParentOrgs}
                          >
                            <option value="">
                              {loadingParentOrgs ? 'Loading organizations...' : 'Select your parent organization'}
                            </option>
                            {parentOrganizations.map((org) => (
                              <option key={org._id} value={org._id}>{org.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Name *</label>
                          <input
                            type="text"
                            value={organizationForm.name}
                            onChange={(e) => handleOrganizationFormChange('name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                            placeholder="e.g., Girls Who Give — Boston Chapter"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Location *</label>
                          <input
                            type="text"
                            value={organizationForm.location}
                            onChange={(e) => handleOrganizationFormChange('location', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                            placeholder="e.g., Boston, MA"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isOrgAdministrator ? 'Organization Address *' : 'Chapter Address *'}
                      </label>
                      <input
                        type="text"
                        value={organizationForm.address}
                        onChange={(e) => handleOrganizationFormChange('address', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="Full address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={organizationForm.phone}
                        onChange={(e) => handleOrganizationFormChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={organizationForm.email}
                        onChange={(e) => handleOrganizationFormChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="contact@organization.org"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        type="url"
                        value={organizationForm.website}
                        onChange={(e) => handleOrganizationFormChange('website', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="https://www.organization.org"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID / EIN</label>
                      <input
                        type="text"
                        value={organizationForm.taxId}
                        onChange={(e) => handleOrganizationFormChange('taxId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="12-3456789"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Organization Description</label>
                      <textarea
                        value={organizationForm.description}
                        onChange={(e) => handleOrganizationFormChange('description', e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="Describe your organization's mission..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3 leading-snug">
                        What types of donations does your organization accept? *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.values(DONATION_TYPES).map((type) => {
                          const config = DONATION_TYPE_CONFIG[type];
                          const isSelected = acceptedDonationTypes.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleDonationTypeToggle(type)}
                              className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left flex flex-col gap-2 min-h-[4.5rem] ${
                                isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                              }`}
                            >
                              <span className="text-xl leading-none">{config.icon}</span>
                              <span className="font-medium text-sm leading-snug break-words">{config.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'donor' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Donor Account</h2>
                  <p className="text-gray-600">
                    Your login is set up. Click below to finish creating your donor account and start discovering organizations.
                  </p>
                </div>
              )}

              {selectedRole === 'admin' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Administrator Account</h2>
                  <p className="text-gray-600">
                    Your login is set up. Click below to activate your administrator account.
                  </p>
                </div>
              )}

              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
                <button
                  onClick={handleCompleteProfile}
                  disabled={submittingProfile}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-lg text-white transition-all disabled:opacity-50 ${
                    selectedRole === 'donor' ? 'bg-pink-600 hover:bg-pink-700' :
                    selectedRole === 'organization' ? 'bg-purple-600 hover:bg-purple-700' :
                    'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {submittingProfile ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </>
          )}

          {signupPhase === 'complete-profile' && !user && (
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border border-pink-100">
              <p className="text-gray-600 mb-4">Please sign in or create your account to continue setting up your profile.</p>
              <button
                onClick={handleStartSignUp}
                className="px-8 py-3 bg-pink-600 text-white rounded-2xl font-semibold hover:bg-pink-700"
              >
                Create Account
              </button>
            </div>
          )}

          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors underline"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const Connect = () => {
  return (
    <Suspense fallback={
      <>
        <EnhancedNavbar />
        <div className="relative min-h-screen flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600"></div>
        </div>
        <Footer />
      </>
    }>
      <ConnectContent />
    </Suspense>
  );
};

export default Connect;
