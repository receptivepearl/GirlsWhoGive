'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';

const OrganizationNeedsModal = ({ 
  isOpen, 
  onClose, 
  organizationNeed, 
  isAdmin, 
  onSave, 
  onDelete 
}) => {
  const router = useRouter();
  const { user } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNeed, setEditedNeed] = useState(null);
  const [isFindingOrg, setIsFindingOrg] = useState(false);

  React.useEffect(() => {
    if (organizationNeed) {
      setEditedNeed({
        ...organizationNeed,
        requiredItems: organizationNeed.requiredItems 
          ? [...organizationNeed.requiredItems] 
          : [{ name: '', notes: '' }]
      });
      // If it's a new need (no _id), start in edit mode
      if (!organizationNeed._id && isAdmin) {
        setIsEditing(true);
      }
    }
  }, [organizationNeed, isAdmin]);

  const handleAddItem = () => {
    if (!editedNeed) return;
    setEditedNeed({
      ...editedNeed,
      requiredItems: [...editedNeed.requiredItems, { name: '', notes: '' }]
    });
  };

  const handleRemoveItem = (index) => {
    if (!editedNeed) return;
    const newItems = editedNeed.requiredItems.filter((_, i) => i !== index);
    setEditedNeed({
      ...editedNeed,
      requiredItems: newItems
    });
  };

  const handleItemChange = (index, field, value) => {
    if (!editedNeed) return;
    const newItems = [...editedNeed.requiredItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditedNeed({
      ...editedNeed,
      requiredItems: newItems
    });
  };

  const handleSave = async () => {
    if (!editedNeed || !onSave) return;
    
    // Validate
    if (!editedNeed.organizationName.trim()) {
      alert('Organization name is required');
      return;
    }
    
    if (editedNeed.requiredItems.length === 0) {
      alert('At least one required item is needed');
      return;
    }

    const itemsWithNames = editedNeed.requiredItems.filter(item => item.name.trim());
    if (itemsWithNames.length === 0) {
      alert('At least one item with a name is required');
      return;
    }

    await onSave({
      ...editedNeed,
      requiredItems: itemsWithNames
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!organizationNeed || !onDelete) return;
    if (confirm(`Are you sure you want to delete needs for ${organizationNeed.organizationName}?`)) {
      await onDelete(organizationNeed._id);
      onClose();
    }
  };

  const handleDonate = async () => {
    if (!organizationNeed || !organizationNeed.organizationName) return;
    
    if (!user) {
      router.push('/connect?role=donor');
      return;
    }

    try {
      setIsFindingOrg(true);
      // Find organization by name
      const response = await axios.get('/api/organizations/all');
      if (response.data.success) {
        const organizations = response.data.organizations;
        const org = organizations.find(
          o => o.name.toLowerCase() === organizationNeed.organizationName.toLowerCase()
        );
        
        if (org && org.verified) {
          // Navigate to place order page
          router.push(`/donor/place-order?orgId=${org._id}`);
          onClose();
        } else if (org && !org.verified) {
          alert('This organization is not yet verified. Please contact them directly.');
        } else {
          alert('Organization not found. Please use the Discover page to find verified organizations.');
        }
      }
    } catch (error) {
      console.error('Error finding organization:', error);
      alert('Error finding organization. Please try again.');
    } finally {
      setIsFindingOrg(false);
    }
  };

  if (!isOpen || !organizationNeed) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isEditing 
                ? (organizationNeed._id ? 'Edit Organization Needs' : 'Add New Organization Needs')
                : organizationNeed.organizationName || 'Organization Needs'}
            </h2>
            <div className="flex items-center gap-2">
              {isAdmin && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description */}
          {isEditing ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                value={editedNeed?.organizationName || ''}
                onChange={(e) => setEditedNeed({ ...editedNeed, organizationName: e.target.value })}
                placeholder="Enter organization name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-4"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={editedNeed?.description || ''}
                onChange={(e) => setEditedNeed({ ...editedNeed, description: e.target.value })}
                placeholder="Brief description or category"
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          ) : (
            organizationNeed.description && (
              <p className="text-gray-600 mb-6">{organizationNeed.description}</p>
            )
          )}

          {/* Required Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Required Items
            </h3>
            
            {isEditing ? (
              <div className="space-y-3">
                {editedNeed?.requiredItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder="Item name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <textarea
                      value={item.notes}
                      onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                      placeholder="Notes (brand, size, urgency, etc.)"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                    />
                  </div>
                ))}
                <button
                  onClick={handleAddItem}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-pink-400 hover:text-pink-600 transition-colors"
                >
                  + Add Item
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {organizationNeed.requiredItems && organizationNeed.requiredItems.length > 0 ? (
                  organizationNeed.requiredItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-pink-600 mt-1">•</span>
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium">{item.name}</span>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 italic">No items listed</li>
                )}
              </ul>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            {/* Donate Button (shown when not editing and not admin) */}
            {!isAdmin && !isEditing && (
              <button
                onClick={handleDonate}
                disabled={isFindingOrg}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isFindingOrg ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647A7.962 7.962 0 0112 20a7.962 7.962 0 01-3-2.647z"></path>
                    </svg>
                    Finding...
                  </>
                ) : (
                  'Donate'
                )}
              </button>
            )}
            
            {/* Admin Edit Mode Buttons */}
            {isAdmin && isEditing && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedNeed({
                      ...organizationNeed,
                      requiredItems: [...organizationNeed.requiredItems]
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrganizationNeedsModal;

