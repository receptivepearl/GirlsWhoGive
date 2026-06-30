'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { DONATION_TYPES, DONATION_TYPE_CONFIG } from "@/config/donationTypes";
import { OngoingDrivesPanel, AllDrivesPanel, DashboardDriveSection, OngoingDrivesSummary } from "@/components/OrganizationDrivePanel";
import OrganizationEditDetailsModal from "@/components/OrganizationEditDetailsModal";
import toast from "react-hot-toast";
import { MISSION_STATEMENT } from "@/config/missionStatement";
import { getOrganizationDisplayName } from "@/lib/organizationUtils";

const OrganizationDashboard = () => {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user, userRole, getToken, organizationProfile, userDataLoaded } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [organizationData, setOrganizationData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    thisMonthOrders: 0,
    chapterCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingCategories, setEditingCategories] = useState(false);
  const [savingCategories, setSavingCategories] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [driveEvents, setDriveEvents] = useState([]);
  const [ongoingDriveEvents, setOngoingDriveEvents] = useState([]);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);

  const activeOrganization = organizationData || organizationProfile;
  const organizationDisplayName = getOrganizationDisplayName(activeOrganization);

  useEffect(() => {
    if (organizationProfile) {
      setOrganizationData((prev) => {
        if (prev?.name?.trim()) return prev;
        return organizationProfile;
      });
    }
  }, [organizationProfile]);

  // Redirect if not authenticated or not an organization
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/connect?role=organization');
      return;
    }

    if (!userDataLoaded) return;

    if (userRole === 'organization' && !organizationProfile && !organizationData) {
      router.push('/connect?role=organization');
      return;
    }

    // Only redirect if userRole is explicitly set and not organization
    if (userRole !== null && userRole !== undefined && userRole !== 'organization') {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, userRole, userDataLoaded, router]);

  const loadData = async () => {
    if (!isSignedIn) return;

    try {
      const token = await getToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      
      const [orgRes, pendingRes, statsRes] = await Promise.all([
        axios.get('/api/organizations/me', { headers }),
        axios.get('/api/donations/organization?status=pending', { headers }),
        axios.get('/api/organizations/stats', { headers })
      ]);

      if (orgRes.data?.success) {
        const org = orgRes.data.organization;
        setOrganizationData(org);
        const pending = org.isOrgAdministrator && (org.approvalStatus === 'pending' || !org.verified);
        const rejected = org.isOrgAdministrator && org.approvalStatus === 'rejected';
        setIsPendingApproval(pending);
        setIsRejected(rejected);
        setIsOrgAdmin(org.isOrgAdministrator && org.approvalStatus === 'approved' && org.verified);

        if (org.isOrgAdministrator && org.approvalStatus === 'approved' && org.verified) {
          try {
            const chaptersRes = await axios.get('/api/organizations/chapters', { headers });
            if (chaptersRes.data?.success) {
              setChapters(chaptersRes.data.chapters || []);
            }
          } catch (chapterError) {
            console.error('Error loading chapters:', chapterError);
          }
        }
      } else if (organizationProfile) {
        const org = organizationProfile;
        setOrganizationData(org);
        const pending = org.isOrgAdministrator && (org.approvalStatus === 'pending' || !org.verified);
        const rejected = org.isOrgAdministrator && org.approvalStatus === 'rejected';
        setIsPendingApproval(pending);
        setIsRejected(rejected);
        setIsOrgAdmin(org.isOrgAdministrator && org.approvalStatus === 'approved' && org.verified);
      }
      if (pendingRes.data?.success) {
        const mappedPending = pendingRes.data.donations.map(d => ({
          id: d._id,
          donorName: d.donorName,
          donorEmail: d.donorEmail,
          items: d.items,
          totalItems: d.totalItems,
          date: new Date(d.date).toISOString().slice(0,10),
          status: d.status,
          notes: d.notes || '',
          image: d.image,
          chapterName: d.chapterName,
          driveId: d.driveId,
          driveName: d.driveName,
        }));
        setPendingRequests(mappedPending);
      }

      if (orgRes.data?.success) {
        const org = orgRes.data.organization;
        const pending = org.isOrgAdministrator && (org.approvalStatus === 'pending' || !org.verified);
        if (!pending) {
          try {
            const [allDrivesRes, ongoingDrivesRes] = await Promise.all([
              axios.get('/api/drives?filter=all', { headers }),
              axios.get('/api/drives?filter=ongoing', { headers }),
            ]);
            if (allDrivesRes.data?.success) setDriveEvents(allDrivesRes.data.drives || []);
            if (ongoingDrivesRes.data?.success) setOngoingDriveEvents(ongoingDrivesRes.data.drives || []);
          } catch (driveError) {
            console.error('Error loading drives:', driveError);
          }
        }
      }
      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
    } catch (e) {
      console.error('Error loading organization dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userDataLoaded) return;

    loadData();

    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, [isLoaded, isSignedIn, userDataLoaded, organizationProfile?._id]);

  const handleSubmissionAction = async (orderId, action) => {
    try {
      const token = await getToken();
      const response = await axios.put('/api/donations/organization',
        { donationId: orderId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setPendingRequests(prev => prev.filter(order => order.id !== orderId));
        toast.success(action === 'confirm' ? 'Donation confirmed' : 'Donation rejected');
        loadData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error(error.response?.data?.message || 'Failed to update submission');
    }
  };

  const handleDonationTypeToggle = (donationType) => {
    if (!organizationData) return;
    const currentTypes = organizationData.acceptedDonationTypes || [];
    const newTypes = currentTypes.includes(donationType)
      ? currentTypes.filter(type => type !== donationType)
      : [...currentTypes, donationType];
    
    setOrganizationData(prev => ({
      ...prev,
      acceptedDonationTypes: newTypes
    }));
  };

  const handleSaveCategories = async () => {
    if (!organizationData) return;
    
    // Require at least one category
    if (!organizationData.acceptedDonationTypes || organizationData.acceptedDonationTypes.length === 0) {
      toast.error('Please select at least one donation category');
      return;
    }

    setSavingCategories(true);
    try {
      const token = await getToken();
      const response = await axios.put('/api/organizations/me', 
        { acceptedDonationTypes: organizationData.acceptedDonationTypes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Donation categories updated successfully');
        setEditingCategories(false);
        loadData(); // Refresh to get updated data
      }
    } catch (error) {
      console.error('Error updating donation categories:', error);
      toast.error('Failed to update donation categories');
    } finally {
      setSavingCategories(false);
    }
  };

  const renderPendingRequestCard = (order) => (
    <div key={order.id} className="border border-yellow-200 rounded-2xl p-6 bg-yellow-50/50 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              {isOrgAdmin && order.chapterName && (
                <span className="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  {order.chapterName}
                </span>
              )}
              <h4 className="font-semibold text-gray-900">Submission from {order.donorName}</h4>
              <p className="text-sm text-gray-500">{order.donorEmail}</p>
              {order.driveName && (
                <p className="text-sm text-purple-700 font-medium mt-1">Drive: {order.driveName}</p>
              )}
              <p className="text-sm text-gray-500">Submitted: {order.date}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              Awaiting Review
            </span>
          </div>

          <div className="mb-4">
            <h5 className="font-medium text-gray-900 mb-2">Items ({order.totalItems} total):</h5>
            <div className="grid md:grid-cols-2 gap-3">
              {order.items.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-pink-600 font-semibold">×{item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSubmissionAction(order.id, 'confirm')}
              className="px-6 py-2 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => handleSubmissionAction(order.id, 'reject')}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>

        {order.image?.secure_url && (
          <div className="md:w-48 flex-shrink-0">
            <div
              className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-pink-200 cursor-pointer"
              onClick={() => setSelectedImage(order.image.secure_url)}
            >
              <Image src={order.image.secure_url} alt="Donation" fill className="object-cover" unoptimized />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className={`grid gap-6 ${isOrgAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Donations</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProducts.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💝</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">This Month</p>
              <p className="text-3xl font-bold text-gray-900">{stats.thisMonthOrders.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        {isOrgAdmin && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Affiliated Chapters</p>
                <p className="text-3xl font-bold text-gray-900">{stats.chapterCount?.toLocaleString() || chapters.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏛️</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <OngoingDrivesSummary
        drives={ongoingDriveEvents}
        showOrgLabel={isOrgAdmin}
        isOrgAdminViewer={isOrgAdmin}
        getToken={getToken}
        onViewAll={() => setActiveTab('ongoing-drives')}
      />

      <DashboardDriveSection
        getToken={getToken}
        onRefresh={loadData}
        onViewAllDrives={() => setActiveTab('all-drives')}
        pastDriveCount={driveEvents.filter((d) => d.status === 'completed').length}
        upcomingDrives={driveEvents.filter((d) => d.status === 'upcoming')}
        canCreateDrives={!isOrgAdmin}
      />

      {isOrgAdmin && chapters.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Chapters</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter) => (
              <div key={chapter._id} className="border border-purple-100 rounded-xl p-4 bg-purple-50/50">
                <h4 className="font-semibold text-gray-900">{chapter.name}</h4>
                {chapter.location && <p className="text-sm text-gray-600 mt-1">📍 {chapter.location}</p>}
                <div className="mt-3 flex gap-4 text-sm text-gray-600">
                  <span>{chapter.totalOrders || 0} orders</span>
                  <span>{chapter.totalProducts || 0} products</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Incoming Donation Submissions</h3>
        <p className="text-gray-600 mb-6">Review and confirm or reject donation requests from donors</p>
        
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending submissions. Confirmed donations appear under their drive on the Ongoing Drives tab.</p>
          ) : (
            pendingRequests.map((order) => renderPendingRequestCard(order))
          )}
        </div>
      </div>
    </div>
  );

  const renderOngoingDrivesContent = () => (
    <OngoingDrivesPanel
      drives={ongoingDriveEvents}
      showOrgLabel={isOrgAdmin}
      getToken={getToken}
    />
  );

  const renderAllDrivesContent = () => (
    <AllDrivesPanel
      drives={driveEvents}
      showOrgLabel={isOrgAdmin}
      getToken={getToken}
    />
  );

  const renderPendingApprovalContent = () => (
    <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-sm rounded-3xl p-10 shadow-lg border border-purple-200 text-center">
      <div className="text-6xl mb-6">{isRejected ? '❌' : '⏳'}</div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        {isRejected ? 'Registration Not Approved' : 'Awaiting Administrator Approval'}
      </h2>
      <p className="text-lg text-gray-600 mb-6">
        {isRejected
          ? 'Your organization administrator registration was not approved. Please contact the platform administrator for more information.'
          : 'Your organization administrator account has been submitted for review. The platform administrator will review your request on the admin portal. Once approved, your dashboard will unlock with visibility into all affiliated chapters, their orders, and ongoing drives.'}
      </p>
      {!isRejected && (
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
          Pending platform approval
        </div>
      )}
    </div>
  );

  const SettingsContent = () => {
    const currentTypes = organizationData?.acceptedDonationTypes || [];
    
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-pink-100">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Organization Settings</h2>
        
        <div className="space-y-8">
          {/* Donation Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Accepted Donation Categories
                </h3>
                <p className="text-gray-600 text-sm">
                  Select the types of donations your organization accepts. This helps donors find your organization when searching for specific donation types.
                </p>
              </div>
              {!editingCategories && (
                <button
                  onClick={() => setEditingCategories(true)}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {editingCategories ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.values(DONATION_TYPES).map((type) => {
                    const config = DONATION_TYPE_CONFIG[type];
                    const isSelected = currentTypes.includes(type);
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
                {currentTypes.length === 0 && (
                  <p className="text-sm text-red-600">
                    Please select at least one donation category
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveCategories}
                    disabled={savingCategories || currentTypes.length === 0}
                    className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingCategories ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategories(false);
                      loadData(); // Reset to original data
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentTypes.length > 0 ? (
                  currentTypes.map((type) => {
                    const config = DONATION_TYPE_CONFIG[type];
                    return (
                      <div
                        key={type}
                        className="p-4 rounded-lg border-2 border-pink-200 bg-pink-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{config.icon}</span>
                          <span className="font-medium text-sm text-pink-700">
                            {config.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm md:col-span-3">
                    No donation categories selected. Click "Edit" to add categories.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AboutContent = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-pink-100">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About GirlsWhoGive</h2>
      
      <div className="space-y-6 text-lg text-gray-700">
        <p>
          {MISSION_STATEMENT}
        </p>
        
        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">For Organizations</h3>
        <p>
          As a verified organization, you play a crucial role in our mission. Your dashboard 
          helps you track incoming donations, coordinate with donors, and monitor your impact 
          on the community you serve.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Dashboard Features</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📊 Analytics</h4>
            <p className="text-gray-600">Track total orders, products received, and monthly statistics</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📋 Order Management</h4>
            <p className="text-gray-600">View and manage incoming donation orders from verified donors</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">✅ Status Updates</h4>
            <p className="text-gray-600">Update order status and communicate with donors</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">💝 Impact Tracking</h4>
            <p className="text-gray-600">Monitor your organization's impact on the community</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Getting Started</h3>
        <p>
          Your organization has been verified and is now part of our network. Donors can 
          find you in their local search results and place orders directly through our platform. 
          Make sure to keep your profile information up to date and respond to donation orders promptly.
        </p>
      </div>
    </div>
  );

  if (!isLoaded || (isSignedIn && !userDataLoaded) || loading) {
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
            <p className="text-gray-600">Loading your dashboard...</p>
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
                  Organization Dashboard
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                <p className="text-lg text-gray-600">
                  Welcome,{' '}
                  <span className="font-semibold text-gray-900">
                    {organizationDisplayName || '...'}
                  </span>
                </p>
                {activeOrganization && (
                  <button
                    type="button"
                    onClick={() => setShowEditDetails(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit details
                  </button>
                )}
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isPendingApproval
                  ? 'bg-yellow-100 text-yellow-800'
                  : isRejected
                  ? 'bg-red-100 text-red-800'
                  : isOrgAdmin
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {isPendingApproval
                  ? '⏳ Pending Approval'
                  : isRejected
                  ? '❌ Not Approved'
                  : isOrgAdmin
                  ? '✓ Organization Administrator'
                  : activeOrganization?.parentOrganizationId
                  ? '✓ Chapter'
                  : '✓ Verified Organization'}
              </div>
          </div>

          {(isPendingApproval || isRejected) ? (
            renderPendingApprovalContent()
          ) : (
          <>
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-pink-100 flex flex-wrap justify-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeTab === 'dashboard'
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('ongoing-drives')}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeTab === 'ongoing-drives'
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ongoing Drives
              </button>
              <button
                onClick={() => setActiveTab('all-drives')}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeTab === 'all-drives'
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Drives
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'dashboard' ? renderDashboardContent() :
           activeTab === 'ongoing-drives' ? renderOngoingDrivesContent() :
           activeTab === 'all-drives' ? renderAllDrivesContent() :
           renderDashboardContent()}
          </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-gray-200 z-10"
            >
              ×
            </button>
            <div className="relative w-full h-full">
              <Image
                src={selectedImage}
                alt="Donation photo full size"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}

      <OrganizationEditDetailsModal
        isOpen={showEditDetails}
        onClose={() => setShowEditDetails(false)}
        organization={activeOrganization}
        getToken={getToken}
        onSaved={(updatedOrg) => {
          setOrganizationData(updatedOrg);
          loadData();
        }}
      />

      <Footer />
    </>
  );
};

export default OrganizationDashboard;







