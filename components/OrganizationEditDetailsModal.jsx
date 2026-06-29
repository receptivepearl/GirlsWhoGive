'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { locationService } from '@/lib/locationService';

const EMPTY_FORM = {
  name: '',
  location: '',
  address: '',
  phone: '',
  website: '',
  taxId: '',
  description: '',
};

export default function OrganizationEditDetailsModal({
  isOpen,
  onClose,
  organization,
  getToken,
  onSaved,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const isChapter = organization && !organization.isOrgAdministrator;

  useEffect(() => {
    if (!isOpen || !organization) return;
    setForm({
      name: organization.name || '',
      location: organization.location || '',
      address: organization.address || '',
      phone: organization.phone || '',
      website: organization.website || '',
      taxId: organization.taxId || '',
      description: organization.description || '',
    });
  }, [isOpen, organization]);

  if (!isOpen || !organization) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      toast.error(isChapter ? 'Please enter your chapter name' : 'Please enter your organization name');
      return false;
    }
    if (isChapter && !form.location.trim()) {
      toast.error('Please enter your chapter location');
      return false;
    }
    if (!form.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      let lat = organization.lat || 0;
      let lng = organization.lng || 0;

      const geocodeTarget = [form.address, form.location].filter(Boolean).join(', ');
      if (geocodeTarget) {
        try {
          const coords = await locationService.geocodeAddress(geocodeTarget);
          lat = coords.lat;
          lng = coords.lng;
        } catch (geocodeError) {
          console.warn('Geocoding failed, saving without updated coordinates:', geocodeError);
        }
      }

      const token = await getToken();
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        website: form.website.trim(),
        taxId: form.taxId.trim(),
        description: form.description.trim(),
        location: isChapter ? form.location.trim() : (form.location.trim() || organization.location || ''),
        lat,
        lng,
      };

      const response = await axios.put('/api/organizations/me', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success('Organization details updated');
        onSaved?.(response.data.organization);
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to update details');
      }
    } catch (error) {
      console.error('Error updating organization details:', error);
      toast.error(error.response?.data?.message || 'Failed to update details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close edit details"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-pink-100">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 border-b border-pink-100 bg-white rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update your {isChapter ? 'chapter' : 'organization'} profile information
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isChapter ? 'Chapter Name *' : 'Organization Name *'}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              placeholder={isChapter ? 'e.g., Girls Who Give — Boston Chapter' : 'e.g., Girls Who Give National'}
            />
          </div>

          {isChapter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Location *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="e.g., Boston, MA"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isChapter ? 'Chapter Address *' : 'Organization Address *'}
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              placeholder="Full address"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="https://www.organization.org"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID / EIN</label>
            <input
              type="text"
              value={form.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              placeholder="12-3456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              placeholder="Describe your organization's mission..."
            />
          </div>

          {organization.email && (
            <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Email:</span> {organization.email}
              <p className="text-xs text-gray-500 mt-1">Contact email cannot be changed here.</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 border-t border-pink-100 bg-white rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
