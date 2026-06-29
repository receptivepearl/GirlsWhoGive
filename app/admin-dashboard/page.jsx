'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingOrganizations, setPendingOrganizations] = useState([]);
  const [verifiedOrganizations, setVerifiedOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for admin dashboard
  const mockPendingOrganizations = [
    {
      id: 101,
      name: "Youth Empowerment Center",
      address: "789 Pine St, Uptown",
      phone: "(555) 345-6789",
      email: "admin@youthempowerment.org",
      description: "Supporting young women with education, mentorship, and essential supplies.",
      submittedDate: "2024-01-10",
      website: "https://youthempowerment.org",
      taxId: "12-3456789",
      contactPerson: "Jennifer Martinez"
    },
    {
      id: 102,
      name: "Senior Women's Support Group",
      address: "987 Cedar Blvd, Northside",
      phone: "(555) 678-9012",
      email: "info@seniorwomensupport.org",
      description: "Supporting elderly women with dignity and access to essential health products.",
      submittedDate: "2024-01-08",
      website: "https://seniorwomensupport.org",
      taxId: "98-7654321",
      contactPerson: "Margaret Thompson"
    },
    {
      id: 103,
      name: "Teen Parent Program",
      address: "258 Spruce St, Central",
      phone: "(555) 890-1234",
      email: "support@teenparentprogram.org",
      description: "Supporting young parents with resources, education, and essential supplies.",
      submittedDate: "2024-01-05",
      website: "https://teenparentprogram.org",
      taxId: "45-6789012",
      contactPerson: "Sarah Davis"
    }
  ];

  const mockVerifiedOrganizations = [
    {
      id: 1,
      name: "Hope Women's Shelter",
      address: "123 Main St, Downtown",
      phone: "(555) 123-4567",
      email: "donations@hopewomensshelter.org",
      verifiedDate: "2023-12-15",
      totalOrders: 47,
      totalProducts: 284
    },
    {
      id: 2,
      name: "Community Health Center",
      address: "456 Oak Ave, Midtown",
      phone: "(555) 234-5678",
      email: "donations@communityhealth.org",
      verifiedDate: "2023-12-10",
      totalOrders: 32,
      totalProducts: 198
    },
    {
      id: 4,
      name: "Family Resource Center",
      address: "321 Elm St, Westside",
      phone: "(555) 456-7890",
      email: "donations@familyresource.org",
      verifiedDate: "2023-11-28",
      totalOrders: 58,
      totalProducts: 342
    },
    {
      id: 5,
      name: "Domestic Violence Safe House",
      address: "654 Maple Dr, Eastside",
      phone: "(555) 567-8901",
      email: "donations@dvsafehouse.org",
      verifiedDate: "2023-11-20",
      totalOrders: 41,
      totalProducts: 267
    },
    {
      id: 7,
      name: "LGBTQ+ Community Center",
      address: "147 Birch Ln, Southside",
      phone: "(555) 789-0123",
      email: "donations@lgbtqcenter.org",
      verifiedDate: "2023-11-15",
      totalOrders: 29,
      totalProducts: 156
    }
  ];

  const systemStats = {
    totalOrganizations: 8,
    verifiedOrganizations: 5,
    pendingOrganizations: 3,
    totalUsers: 1247,
    totalProductsDonated: 1247,
    totalOrders: 207,
    thisMonthOrders: 23,
    thisMonthProducts: 156
  };

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setPendingOrganizations(mockPendingOrganizations);
      setVerifiedOrganizations(mockVerifiedOrganizations);
      setLoading(false);
    }, 1000);
  }, []);

  const approveOrganization = (orgId) => {
    const org = pendingOrganizations.find(o => o.id === orgId);
    if (org) {
      // Remove from pending and add to verified
      setPendingOrganizations(prev => prev.filter(o => o.id !== orgId));
      setVerifiedOrganizations(prev => [...prev, {
        ...org,
        verifiedDate: new Date().toISOString().split('T')[0],
        totalOrders: 0,
        totalProducts: 0
      }]);
    }
  };

  const rejectOrganization = (orgId) => {
    setPendingOrganizations(prev => prev.filter(o => o.id !== orgId));
  };

  const OverviewContent = () => (
    <div className="space-y-8">
      {/* System Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Organizations</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats.totalOrganizations}</p>
              <p className="text-xs text-gray-500">{systemStats.verifiedOrganizations} verified</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats.totalUsers}</p>
              <p className="text-xs text-gray-500">Active donors</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats.totalOrders}</p>
              <p className="text-xs text-gray-500">{systemStats.thisMonthOrders} this month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Products Donated</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats.totalProductsDonated}</p>
              <p className="text-xs text-gray-500">{systemStats.thisMonthProducts} this month</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💝</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Organizations */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Pending Organization Approvals</h3>
        
        {pendingOrganizations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-gray-600">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingOrganizations.map((org) => (
              <div key={org.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{org.name}</h4>
                    <p className="text-gray-600 mb-2">📍 {org.address}</p>
                    <p className="text-gray-600 mb-2">📞 {org.phone}</p>
                    <p className="text-gray-600 mb-2">✉️ {org.email}</p>
                    <p className="text-gray-600 mb-2">👤 Contact: {org.contactPerson}</p>
                    <p className="text-gray-600 mb-2">🌐 Website: {org.website}</p>
                    <p className="text-gray-600 mb-2">🆔 Tax ID: {org.taxId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Submitted: {org.submittedDate}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{org.description}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => approveOrganization(org.id)}
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => rejectOrganization(org.id)}
                    className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    ✗ Reject
                  </button>
                  <button className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-700 transition-colors">
                    📧 Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const OrganizationsContent = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Verified Organizations</h3>
      
      <div className="space-y-4">
        {verifiedOrganizations.map((org) => (
          <div key={org.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-bold text-gray-900">{org.name}</h4>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Verified
                  </span>
                </div>
                <p className="text-gray-600 mb-2">📍 {org.address}</p>
                <p className="text-gray-600 mb-2">📞 {org.phone}</p>
                <p className="text-gray-600 mb-2">✉️ {org.email}</p>
                <p className="text-gray-600 mb-2">📅 Verified: {org.verifiedDate}</p>
              </div>
              <div className="text-right">
                <div className="bg-pink-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-pink-600">{org.totalOrders}</p>
                </div>
                <div className="bg-purple-100 rounded-lg p-4 mt-2">
                  <p className="text-sm text-gray-600 mb-1">Products Received</p>
                  <p className="text-2xl font-bold text-purple-600">{org.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm">
                📊 View Analytics
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors text-sm">
                ✏️ Edit
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm">
                🚫 Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AboutContent = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-pink-100">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Administrator Dashboard</h2>
      
      <div className="space-y-6 text-lg text-gray-700">
        <p>
          Welcome to the GirlsWhoGive administrator dashboard. This is your central hub for 
          managing the platform, approving organizations, and monitoring the overall impact of 
          our community.
        </p>
        
        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Your Responsibilities</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">✅ Organization Verification</h4>
            <p className="text-gray-600">Review and approve new organization applications to ensure they meet our standards</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📊 Platform Analytics</h4>
            <p className="text-gray-600">Monitor platform usage, donation statistics, and community impact</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🔧 System Management</h4>
            <p className="text-gray-600">Manage verified organizations, handle disputes, and maintain platform quality</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📈 Growth Tracking</h4>
            <p className="text-gray-600">Track the growth of our community and the impact of in-kind giving</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Verification Process</h3>
        <p>
          When organizations apply for verification, review their documentation including tax ID, 
          website, contact information, and mission statement. Only approve organizations that 
          clearly serve underserved communities and have legitimate nonprofit status.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Platform Statistics</h3>
        <p>
          Monitor key metrics including total organizations, active users, donation orders, 
          and products distributed. These statistics help measure our impact and identify 
          areas for growth.
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
            <p className="text-gray-600">Loading admin dashboard...</p>
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
              Administrator Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Manage the GirlsWhoGive platform
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-pink-100">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
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
          {activeTab === 'overview' && <OverviewContent />}
          {activeTab === 'organizations' && <OrganizationsContent />}
          {activeTab === 'about' && <AboutContent />}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;













