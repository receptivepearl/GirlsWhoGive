'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EnhancedNavbar from '@/components/EnhancedNavbar';
import Footer from '@/components/Footer';
import { DONATION_TYPES, DONATION_TYPE_CONFIG } from '@/config/donationTypes';
import toast from 'react-hot-toast';

const GUEST_PRODUCT_OPTIONS = [
  DONATION_TYPES.MENSTRUAL_PRODUCTS,
  DONATION_TYPES.BOOKS,
  DONATION_TYPES.CLOTHING,
  DONATION_TYPES.HYGIENE,
  DONATION_TYPES.FOOD,
  DONATION_TYPES.OTHER,
];

function GuestDonateContent() {
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');
  const driveId = searchParams.get('driveId');

  const [loading, setLoading] = useState(true);
  const [drive, setDrive] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [productType, setProductType] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!orgId || !driveId) {
        setLoadError('This donation link is invalid. Please scan a valid drive QR code.');
        setLoading(false);
        return;
      }

      try {
        const [orgRes, driveRes] = await Promise.all([
          fetch(`/api/organizations/${orgId}`),
          fetch(`/api/drives/${driveId}`),
        ]);
        const orgData = await orgRes.json();
        const driveData = await driveRes.json();

        if (!orgData.success || !driveData.success) {
          setLoadError('This drive could not be found.');
          return;
        }
        if (driveData.drive.organizationId !== orgId) {
          setLoadError('This donation link is invalid.');
          return;
        }
        if (driveData.drive.status !== 'ongoing') {
          setLoadError('This drive is not currently accepting donations.');
          return;
        }

        setOrganization(orgData.organization);
        setDrive(driveData.drive);
      } catch {
        setLoadError('Unable to load drive information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orgId, driveId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!donorName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!donorEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!productType) {
      toast.error('Please select a product type');
      return;
    }
    if (productType === DONATION_TYPES.OTHER && !customProductName.trim()) {
      toast.error('Please describe the product you are donating');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      toast.error('Please enter how many products you are donating');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/donations/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          driveId,
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim(),
          productType,
          customProductName: customProductName.trim(),
          quantity: qty,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        toast.error(data.message || 'Failed to submit donation');
      }
    } catch {
      toast.error('Failed to submit donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Unable to Continue</h1>
        <p className="text-gray-600">{loadError}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg border border-green-200">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Completed Donation!</h1>
          <p className="text-gray-600 mb-2">
            Thank you, <span className="font-semibold text-gray-900">{donorName}</span>!
          </p>
          <p className="text-gray-600">
            Your donation to <span className="font-semibold">{drive?.name}</span> at{' '}
            <span className="font-semibold">{organization?.name}</span> has been submitted.
            The chapter will review and confirm your contribution shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-purple-600 uppercase tracking-wide mb-2">Guest Donation</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{drive?.name}</h1>
          <p className="text-gray-600">{organization?.name}</p>
          {drive?.comments && (
            <p className="text-sm text-gray-500 mt-3 bg-gray-50 rounded-lg p-3">{drive.comments}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type <span className="text-red-500">*</span>
            </label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">Select a product type...</option>
              {GUEST_PRODUCT_OPTIONS.map((type) => {
                const config = DONATION_TYPE_CONFIG[type];
                return (
                  <option key={type} value={type}>
                    {config?.icon} {type === DONATION_TYPES.OTHER ? 'Other (type your own)' : config?.label}
                  </option>
                );
              })}
            </select>
          </div>

          {productType === DONATION_TYPES.OTHER && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Product <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customProductName}
                onChange={(e) => setCustomProductName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                placeholder="e.g., Blankets, Toys, Diapers..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Products Donating <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
              placeholder="e.g., 10"
            />
            <p className="mt-1 text-sm text-gray-500">How many items are you donating?</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-pink-600 text-white rounded-2xl font-semibold text-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Donation'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          No account required. Your submission will be reviewed by the organization before it is counted.
        </p>
      </div>
    </div>
  );
}

export default function GuestDonateDrivePage() {
  return (
    <>
      <EnhancedNavbar />
      <div
        className="min-h-screen"
        style={{
          backgroundImage: 'url(/background/BackgroundUI.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
            </div>
          }
        >
          <GuestDonateContent />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
