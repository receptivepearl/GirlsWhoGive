'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const router = useRouter();
  const { user, userRole, getToken } = useAppContext();
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalDonations: 0,
    totalProductsDonated: 0
  });
  const [pendingOrgAdminRequests, setPendingOrgAdminRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/connect');
      return;
    }
    if (userRole && userRole !== 'admin') {
      // Redirect based on role to correct dashboard
      if (userRole === 'donor') {
        router.push('/donor/discover');
      } else if (userRole === 'organization') {
        router.push('/organization-dashboard');
      } else {
        router.push('/');
      }
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const token = await getToken();
        const [analyticsRes, requestsRes] = await Promise.all([
          axios.get('/api/admin/analytics', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/admin/org-admin-requests', {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);
        
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.analytics);
        } else {
          toast.error(analyticsRes.data.message);
        }

        if (requestsRes.data.success) {
          setPendingOrgAdminRequests(requestsRes.data.pendingCount || 0);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    
    // Refresh analytics every 30 seconds for real-time updates
    const interval = setInterval(fetchAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, [user, userRole, router, getToken]);

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
            <p className="text-xl text-gray-600">Loading admin dashboard...</p>
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
        className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 pt-16"
        style={{
          backgroundImage: 'url(/background/BackgroundUI.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
            <p className="text-xl text-gray-600">Platform Analytics & Management</p>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-pink-100 text-pink-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Organizations</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalOrganizations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalDonations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Products Donated</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalProductsDonated?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-pink-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-4">
                {pendingOrgAdminRequests > 0 && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-4">
                    <p className="text-purple-900 font-medium mb-2">
                      {pendingOrgAdminRequests} organization administrator request{pendingOrgAdminRequests !== 1 ? 's' : ''} awaiting review
                    </p>
                    <button
                      onClick={() => router.push('/admin/org-admin-requests')}
                      className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors duration-200 shadow-md"
                    >
                      Review Org Admin Requests
                    </button>
                  </div>
                )}
                <button
                  onClick={() => router.push('/admin/org-admin-requests')}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors duration-200 shadow-md"
                >
                  Organization Administrator Requests
                </button>
                <button
                  onClick={() => router.push('/admin/organizations')}
                  className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-pink-700 transition-colors duration-200 shadow-md"
                >
                  Manage Organizations
                </button>
                <button
                  onClick={() => router.push('/admin/donations')}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors duration-200 shadow-md"
                >
                  View All Donations
                </button>
                <button
                  onClick={async () => {
                    try {
                      const token = await getToken();
                      const response = await axios.get('/api/admin/analytics', {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      if (response.data.success) {
                        setAnalytics(response.data.analytics);
                        toast.success('Analytics refreshed');
                      }
                    } catch (error) {
                      toast.error('Failed to refresh analytics');
                    }
                  }}
                  className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-gray-700 transition-colors duration-200 shadow-md"
                >
                  Refresh Analytics
                </button>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-pink-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">System Status</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Authentication</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900 font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;



