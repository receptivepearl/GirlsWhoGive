'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const AdminOrgAdminRequests = () => {
  const router = useRouter();
  const { user, userRole, getToken } = useAppContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const token = await getToken();
      const response = await axios.get('/api/admin/org-admin-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRequests(response.data.requests);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching org admin requests:", error);
      toast.error("Failed to load organization administrator requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/connect');
      return;
    }
    if (userRole && userRole !== 'admin') {
      router.push('/');
      return;
    }

    fetchRequests();
  }, [user, userRole, router]);

  const handleDecision = async (organizationId, action) => {
    setProcessingId(organizationId);
    try {
      const token = await getToken();
      const response = await axios.put('/api/admin/org-admin-requests',
        { organizationId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setRequests(prev => prev.filter(req => req.organizationId !== organizationId));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error("Failed to process request.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <EnhancedNavbar />
        <div className="relative min-h-screen flex items-center justify-center pt-16"
          style={{ backgroundImage: 'url(/background/BackgroundUI.png)', backgroundSize: 'cover', minHeight: '100vh' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading requests...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <EnhancedNavbar />
      <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 pt-16"
        style={{ backgroundImage: 'url(/background/BackgroundUI.png)', backgroundSize: 'cover', minHeight: '100vh' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Organization Administrator Requests</h1>
            <p className="text-xl text-gray-600">
              Review organizations that oversee multiple chapters and approve or reject their registration
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-pink-100 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending requests</h3>
              <p className="text-gray-600">New organization administrator registration requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((req) => (
                <div key={req.organizationId} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{req.organizationName}</h3>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          Org Administrator
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">📍 {req.address}</p>
                      {req.email && <p className="text-gray-600 mb-1">✉️ {req.email}</p>}
                      {req.description && <p className="text-gray-700 mt-3">{req.description}</p>}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-6">
                    Requested on {new Date(req.date).toLocaleDateString()}
                  </div>

                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={() => handleDecision(req.organizationId, 'reject')}
                      disabled={processingId === req.organizationId}
                      className="px-6 py-2 rounded-full font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDecision(req.organizationId, 'approve')}
                      disabled={processingId === req.organizationId}
                      className="px-6 py-2 rounded-full font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {processingId === req.organizationId ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-pink-700 transition-colors shadow-md"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminOrgAdminRequests;
