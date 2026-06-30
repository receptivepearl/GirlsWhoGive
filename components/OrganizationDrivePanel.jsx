'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DONATION_TYPES, DONATION_TYPE_CONFIG } from '@/config/donationTypes';
import { formatDriveDate, parseLocalDateStart, parseLocalDateEnd } from '@/lib/driveUtils';
import { buildDriveDonationUrl, buildDriveQrCodeImageUrl } from '@/lib/driveQrCode';

function useAbsoluteDriveQrCode(drive, { size = '200x200' } = {}) {
  const [donationUrl, setDonationUrl] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState(null);

  useEffect(() => {
    const id = drive?._id?.toString?.() || drive?._id || drive?.id;
    if (!drive?.organizationId || !id) {
      setDonationUrl(null);
      setQrImageUrl(null);
      return;
    }

    const absoluteUrl = buildDriveDonationUrl(
      drive.organizationId,
      id,
      window.location.origin
    );
    setDonationUrl(absoluteUrl);
    setQrImageUrl(buildDriveQrCodeImageUrl(absoluteUrl, { size }));
  }, [drive?.organizationId, drive?._id, drive?.id, size]);

  return { donationUrl, qrImageUrl, ready: Boolean(donationUrl && qrImageUrl) };
}

async function downloadDriveQrCode(drive) {
  const id = drive?._id?.toString?.() || drive?._id || drive?.id;
  if (!drive?.organizationId || !id) throw new Error('Invalid drive');

  const donationUrl = buildDriveDonationUrl(
    drive.organizationId,
    id,
    window.location.origin
  );
  const qrUrl = buildDriveQrCodeImageUrl(donationUrl, { size: '500x500' });
  const response = await fetch(qrUrl);
  if (!response.ok) throw new Error('Failed to fetch QR code');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  const safeName = (drive.name || 'drive').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  link.download = `${safeName}-qr-code.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function DriveQrCodeThumb({ drive, onClick }) {
  const { qrImageUrl, ready } = useAbsoluteDriveQrCode(drive, { size: '100x100' });

  if (!ready) {
    return (
      <div className="flex-shrink-0 flex flex-col items-center gap-1 p-2 w-[96px]">
        <div className="w-20 h-20 rounded-lg bg-gray-100 animate-pulse" />
        <span className="text-xs text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl border border-purple-200 bg-white hover:border-purple-400 hover:shadow-md transition-all"
      title="View or download QR code"
    >
      <img
        src={qrImageUrl}
        alt={`QR code for ${drive.name}`}
        width={80}
        height={80}
        className="rounded-lg"
      />
      <span className="text-xs font-medium text-purple-600">QR Code</span>
    </button>
  );
}

export function DriveQrCodeModal({ drive, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const { donationUrl, qrImageUrl, ready } = useAbsoluteDriveQrCode(drive, { size: '400x400' });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadDriveQrCode(drive);
      toast.success('QR code downloaded');
    } catch {
      toast.error('Failed to download QR code');
    } finally {
      setDownloading(false);
    }
  };

  if (!ready) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Drive QR Code</h2>
            <p className="text-sm text-gray-600 mt-1">{drive.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Donors can scan this code to contribute directly to this drive.
        </p>

        <div className="flex justify-center mb-4">
          <img
            src={qrImageUrl}
            alt={`QR code for ${drive.name}`}
            width={400}
            height={400}
            className="rounded-xl border border-gray-200"
          />
        </div>

        {donationUrl && (
          <p className="text-xs text-gray-500 break-all bg-gray-50 rounded-lg p-3 mb-4">{donationUrl}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 px-5 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {downloading ? 'Downloading...' : 'Download PNG'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const emptyForm = {
  name: '',
  goalAmount: '',
  acceptedProducts: [],
  startDate: '',
  endDate: '',
  comments: '',
};

export function CreateDriveForm({ getToken, onSuccess, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const toggleProduct = (type) => {
    setForm((prev) => ({
      ...prev,
      acceptedProducts: prev.acceptedProducts.includes(type)
        ? prev.acceptedProducts.filter((t) => t !== type)
        : [...prev.acceptedProducts, type],
    }));
  };

  const handleStartDateChange = (value) => {
    setForm((prev) => {
      const next = { ...prev, startDate: value };
      if (value && prev.endDate && prev.endDate < value) {
        next.endDate = value;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.goalAmount || !form.startDate || !form.endDate) {
      toast.error('Please fill in drive name, goal, and dates');
      return;
    }
    if (form.acceptedProducts.length === 0) {
      toast.error('Select at least one product type');
      return;
    }

    const start = parseLocalDateStart(form.startDate);
    const end = parseLocalDateEnd(form.endDate);
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
      toast.error('End date must be on or after start date');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const { data } = await axios.post('/api/drives', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const isUpcoming = data.drive?.status === 'upcoming';
        toast.success(
          isUpcoming
            ? `Drive scheduled! It goes live on ${formatDriveDate(data.drive.startDate)}.`
            : 'Drive event created! QR code is ready.'
        );
        setForm(emptyForm);
        onSuccess?.(data.drive);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create drive');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border-2 border-purple-200 rounded-2xl bg-purple-50/50 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-gray-900">New Drive Event</h4>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-sm">
            Cancel
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Drive Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
          placeholder="e.g., Spring Period Product Drive"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Goal Donation Amount (items) *</label>
        <input
          type="number"
          min="1"
          value={form.goalAmount}
          onChange={(e) => setForm({ ...form, goalAmount: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
          placeholder="e.g., 500"
        />
        <p className="mt-1 text-sm text-gray-500">Total number of items you aim to collect during this drive</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Products Accepting *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(DONATION_TYPES).map((type) => {
            const config = DONATION_TYPE_CONFIG[type];
            const selected = form.acceptedProducts.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleProduct(type)}
                className={`p-3 rounded-lg border-2 text-left text-sm ${
                  selected ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white hover:border-pink-300'
                }`}
              >
                {config.icon} {config.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <p className="mt-1 text-sm text-gray-500">You can schedule a drive to start on a future date</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
          <input
            type="date"
            value={form.endDate}
            min={form.startDate || undefined}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
        <textarea
          value={form.comments}
          onChange={(e) => setForm({ ...form, comments: e.target.value })}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
          placeholder="Drop-off instructions, special notes for donors..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 disabled:opacity-50"
      >
        {saving ? 'Creating...' : 'Create Drive Event'}
      </button>
    </form>
  );
}

export function DashboardDriveSection({
  getToken,
  onRefresh,
  onViewAllDrives,
  pastDriveCount,
  upcomingDrives = [],
  canCreateDrives = true,
}) {
  const [showForm, setShowForm] = useState(false);
  const [newDriveForQr, setNewDriveForQr] = useState(null);

  return (
    <>
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Donation Drives</h3>
          <p className="text-sm text-gray-600">
            {canCreateDrives
              ? pastDriveCount > 0
                ? `${pastDriveCount} past drive${pastDriveCount !== 1 ? 's' : ''} on record`
                : 'Create a drive for donors to contribute to'
              : 'View drive progress across your affiliated chapters'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canCreateDrives && !showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors text-sm"
            >
              + Create New Drive
            </button>
          )}
          {(pastDriveCount > 0 || !canCreateDrives) && onViewAllDrives && (
            <button
              type="button"
              onClick={onViewAllDrives}
              className="px-5 py-2.5 border-2 border-purple-300 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors text-sm"
            >
              {canCreateDrives ? 'View Past Drives' : 'View All Drives'}
            </button>
          )}
        </div>
      </div>

      {upcomingDrives.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Scheduled drives</h4>
          {upcomingDrives.map((drive) => (
            <UpcomingDriveCard key={drive._id} drive={drive} />
          ))}
        </div>
      )}

      {showForm && canCreateDrives && (
        <div className="mt-6">
          <CreateDriveForm
            getToken={getToken}
            onSuccess={(drive) => {
              setShowForm(false);
              onRefresh();
              if (drive) setNewDriveForQr(drive);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      </div>

      {newDriveForQr && (
        <DriveQrCodeModal drive={newDriveForQr} onClose={() => setNewDriveForQr(null)} />
      )}
    </>
  );
}

function UpcomingDriveCard({ drive, showOrgLabel, onClick }) {
  const [showQr, setShowQr] = useState(false);

  return (
    <>
      <div className="w-full border border-blue-200 rounded-2xl p-5 bg-blue-50/50 hover:border-blue-400 hover:shadow-md transition-all flex gap-4">
        <button
          type="button"
          onClick={onClick}
          className="flex-1 text-left min-w-0"
          disabled={!onClick}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {showOrgLabel && drive.organizationName && (
                <span className="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  {drive.organizationName}
                </span>
              )}
              <h4 className="text-lg font-bold text-gray-900">{drive.name}</h4>
              <p className="text-sm text-gray-500 mt-1">
                {formatDriveDate(drive.startDate)} — {formatDriveDate(drive.endDate)}
              </p>
              <p className="text-xs text-blue-700 font-medium mt-2">
                Goes live on {formatDriveDate(drive.startDate)}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Scheduled
            </span>
          </div>
          {onClick && (
            <p className="text-xs text-blue-700 font-medium mt-3">Click to view details →</p>
          )}
        </button>

        <DriveQrCodeThumb drive={drive} onClick={() => setShowQr(true)} />
      </div>

      {showQr && <DriveQrCodeModal drive={drive} onClose={() => setShowQr(false)} />}
    </>
  );
}

function OngoingDriveCard({ drive, showOrgLabel, onClick }) {
  const [showQr, setShowQr] = useState(false);
  const progress = drive.goalAmount > 0
    ? Math.min(100, Math.round((drive.currentAmount / drive.goalAmount) * 100))
    : 0;

  return (
    <>
      <div className="w-full border border-green-200 rounded-2xl p-6 bg-white/80 hover:border-green-400 hover:shadow-md transition-all flex gap-4">
        <button
          type="button"
          onClick={onClick}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              {showOrgLabel && drive.organizationName && (
                <span className="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  {drive.organizationName}
                </span>
              )}
              <h4 className="text-xl font-bold text-gray-900">{drive.name}</h4>
              <p className="text-sm text-gray-500 mt-1">
                {formatDriveDate(drive.startDate)} — {formatDriveDate(drive.endDate)}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Ongoing
            </span>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress toward goal</span>
              <span>{drive.currentAmount} / {drive.goalAmount} items ({progress}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-pink-600 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <p className="text-xs text-green-700 font-medium">Click to view donors →</p>
        </button>

        <DriveQrCodeThumb drive={drive} onClick={() => setShowQr(true)} />
      </div>

      {showQr && <DriveQrCodeModal drive={drive} onClose={() => setShowQr(false)} />}
    </>
  );
}

export function DriveDetailModal({ driveId, getToken, onClose, showOrgLabel }) {
  const [loading, setLoading] = useState(true);
  const [drive, setDrive] = useState(null);
  const [donations, setDonations] = useState([]);
  const [showQr, setShowQr] = useState(false);

  React.useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get(`/api/drives/${driveId}?includeDonations=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setDrive(data.drive);
          setDonations(data.donations || []);
        }
      } catch (error) {
        toast.error('Failed to load drive details');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [driveId, getToken, onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto" />
        </div>
      </div>
    );
  }

  if (!drive) return null;

  const progress = drive.goalAmount > 0
    ? Math.min(100, Math.round((drive.currentAmount / drive.goalAmount) * 100))
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            {showOrgLabel && drive.organizationName && (
              <span className="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                {drive.organizationName}
              </span>
            )}
            <h2 className="text-2xl font-bold text-gray-900">{drive.name}</h2>
            <p className="text-gray-500 mt-1">
              {formatDriveDate(drive.startDate)} — {formatDriveDate(drive.endDate)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Products raised</span>
            <span className="font-semibold">{drive.currentAmount} / {drive.goalAmount} items ({progress}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-pink-600 h-3 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Products accepted:</p>
          <div className="flex flex-wrap gap-2">
            {drive.acceptedProducts?.map((type) => {
              const config = DONATION_TYPE_CONFIG[type];
              return config ? (
                <span key={type} className="px-2 py-1 bg-pink-50 text-pink-700 rounded-lg text-xs font-medium">
                  {config.icon} {config.label}
                </span>
              ) : null;
            })}
          </div>
        </div>

        {drive.comments && (
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4 mb-6">{drive.comments}</p>
        )}

        <div className="mb-6 p-4 border border-purple-100 rounded-2xl bg-purple-50/40">
          <p className="text-sm font-medium text-gray-700 mb-3">Share this drive</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <DriveQrCodeThumb drive={drive} onClick={() => setShowQr(true)} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-gray-600 mb-2">
                Scan or download the QR code so donors can contribute to this drive.
              </p>
              <button
                type="button"
                onClick={() => setShowQr(true)}
                className="text-sm font-semibold text-purple-600 hover:text-purple-800"
              >
                View / export QR code →
              </button>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4">Donors ({donations.length})</h3>
        {donations.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No donations were made during this drive.</p>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <div key={donation._id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{donation.donorName}</p>
                    <p className="text-sm text-gray-500">{donation.donorEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-pink-600">{donation.totalItems} items</p>
                    <p className="text-xs text-gray-400">
                      {new Date(donation.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {donation.items?.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600">
                      {item.name} × {item.quantity}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQr && drive && (
        <DriveQrCodeModal drive={drive} onClose={() => setShowQr(false)} />
      )}
    </div>
  );
}

function PastDriveRow({ drive, showOrgLabel, onClick }) {
  const [showQr, setShowQr] = useState(false);

  return (
    <>
      <div className="w-full border border-gray-200 rounded-2xl p-5 bg-white/80 hover:border-purple-300 hover:shadow-md transition-all flex gap-4">
        <button type="button" onClick={onClick} className="flex-1 text-left min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {showOrgLabel && drive.organizationName && (
                <span className="inline-block mb-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  {drive.organizationName}
                </span>
              )}
              <h4 className="text-lg font-bold text-gray-900">{drive.name}</h4>
              <p className="text-sm text-gray-500 mt-1">
                {formatDriveDate(drive.startDate)} — {formatDriveDate(drive.endDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-pink-600">{drive.currentAmount}</p>
              <p className="text-sm text-gray-500">products raised</p>
              <p className="text-xs text-gray-400 mt-1">Goal: {drive.goalAmount}</p>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-3 font-medium">Click to view donors and details →</p>
        </button>

        <DriveQrCodeThumb drive={drive} onClick={() => setShowQr(true)} />
      </div>

      {showQr && <DriveQrCodeModal drive={drive} onClose={() => setShowQr(false)} />}
    </>
  );
}

export function OngoingDrivesPanel({ drives, showOrgLabel, getToken }) {
  const [selectedDriveId, setSelectedDriveId] = useState(null);

  return (
    <>
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ongoing Drives</h3>
        <p className="text-gray-600 mb-6">Active drives — click a drive to see confirmed donor contributions</p>
        <div className="space-y-4">
          {drives.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-500">No ongoing drives at this time.</p>
            </div>
          ) : (
            drives.map((drive) => (
              <OngoingDriveCard
                key={drive._id}
                drive={drive}
                showOrgLabel={showOrgLabel}
                onClick={() => setSelectedDriveId(drive._id)}
              />
            ))
          )}
        </div>
      </div>

      {selectedDriveId && (
        <DriveDetailModal
          driveId={selectedDriveId}
          getToken={getToken}
          showOrgLabel={showOrgLabel}
          onClose={() => setSelectedDriveId(null)}
        />
      )}
    </>
  );
}

export function OngoingDrivesSummary({ drives, showOrgLabel, getToken, onViewAll, isOrgAdminViewer = false }) {
  const [selectedDriveId, setSelectedDriveId] = useState(null);
  const preview = drives.slice(0, 3);

  return (
    <>
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Ongoing Drives</h3>
            <p className="text-gray-600 text-sm">
              {isOrgAdminViewer
                ? `${drives.length} active drive${drives.length !== 1 ? 's' : ''} across your chapters`
                : `${drives.length} active drive${drives.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {drives.length > 0 && onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm font-semibold text-purple-600 hover:text-purple-800"
            >
              View all →
            </button>
          )}
        </div>
        {preview.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            {isOrgAdminViewer
              ? 'No ongoing drives across your chapters right now.'
              : 'No ongoing drives. Create one below to get started.'}
          </p>
        ) : (
          <div className="space-y-4">
            {preview.map((drive) => (
              <OngoingDriveCard
                key={drive._id}
                drive={drive}
                showOrgLabel={showOrgLabel}
                onClick={() => setSelectedDriveId(drive._id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedDriveId && (
        <DriveDetailModal
          driveId={selectedDriveId}
          getToken={getToken}
          showOrgLabel={showOrgLabel}
          onClose={() => setSelectedDriveId(null)}
        />
      )}
    </>
  );
}

export function AllDrivesPanel({ drives, showOrgLabel, getToken }) {
  const [selectedDriveId, setSelectedDriveId] = useState(null);
  const upcomingDrives = drives.filter((d) => d.status === 'upcoming');
  const ongoingDrives = drives.filter((d) => d.status === 'ongoing');
  const pastDrives = drives.filter((d) => d.status === 'completed');

  return (
    <>
      <div className="space-y-8">
        {upcomingDrives.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Scheduled Drives</h3>
            <p className="text-gray-600 mb-6">Upcoming drives that haven&apos;t started yet</p>
            <div className="space-y-4">
              {upcomingDrives.map((drive) => (
                <UpcomingDriveCard
                  key={drive._id}
                  drive={drive}
                  showOrgLabel={showOrgLabel}
                  onClick={() => setSelectedDriveId(drive._id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Ongoing Drives</h3>
          <p className="text-gray-600 mb-6">Active drives that haven&apos;t reached their end date</p>
          <div className="space-y-4">
            {ongoingDrives.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No ongoing drives right now.</p>
            ) : (
              ongoingDrives.map((drive) => (
                <OngoingDriveCard
                  key={drive._id}
                  drive={drive}
                  showOrgLabel={showOrgLabel}
                  onClick={() => setSelectedDriveId(drive._id)}
                />
              ))
            )}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Past Drives</h3>
          <p className="text-gray-600 mb-6">Completed drives — products raised and donor history</p>
          <div className="space-y-4">
            {pastDrives.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No past drive events yet.</p>
            ) : (
              pastDrives.map((drive) => (
                <PastDriveRow
                  key={drive._id}
                  drive={drive}
                  showOrgLabel={showOrgLabel}
                  onClick={() => setSelectedDriveId(drive._id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {selectedDriveId && (
        <DriveDetailModal
          driveId={selectedDriveId}
          getToken={getToken}
          showOrgLabel={showOrgLabel}
          onClose={() => setSelectedDriveId(null)}
        />
      )}
    </>
  );
}

export default OngoingDriveCard;
