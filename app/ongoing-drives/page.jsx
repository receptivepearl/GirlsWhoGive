'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import EnhancedNavbar from '@/components/EnhancedNavbar';
import Footer from '@/components/Footer';
import { formatDriveDate } from '@/lib/driveUtils';
import { DONATION_TYPE_CONFIG } from '@/config/donationTypes';

export default function OngoingDrivesPage() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const response = await fetch('/api/drives?filter=active');
        const data = await response.json();
        if (data.success) {
          setDrives(data.drives || []);
        }
      } catch (error) {
        console.error('Error fetching ongoing drives:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrives();
  }, []);

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
          minHeight: '100vh',
        }}
      >
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Ongoing Drives
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Browse active donation drives from organizations and chapters. Contribute in person or submit a donation through our guest portal.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-pink-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading ongoing drives...</p>
              </div>
            ) : drives.length === 0 ? (
              <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-pink-100 shadow-lg">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No ongoing drives right now</h3>
                <p className="text-gray-600">Check back soon for new chapter and organization drive events.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {drives.map((drive) => {
                  const progress = drive.goalAmount > 0
                    ? Math.min(100, Math.round((drive.currentAmount / drive.goalAmount) * 100))
                    : 0;
                  const donateHref = `/donate/drive?orgId=${drive.organizationId}&driveId=${drive._id}`;

                  return (
                    <div
                      key={drive._id}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg border border-purple-100 flex flex-col"
                    >
                      <div className="mb-4">
                        <span className="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                          {drive.organizationName}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">{drive.name}</h2>
                        <p className="text-sm text-gray-500 mt-2">
                          {formatDriveDate(drive.startDate)} — {formatDriveDate(drive.endDate)}
                        </p>
                      </div>

                      {drive.organizationLocation && (
                        <p className="text-sm text-gray-700 mb-3 flex items-start gap-2">
                          <span className="flex-shrink-0">📍</span>
                          <span>{drive.organizationLocation}</span>
                        </p>
                      )}

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Products collected</span>
                          <span className="font-semibold text-gray-900">
                            {drive.currentAmount} / {drive.goalAmount} ({progress}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-pink-600 h-3 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {drive.acceptedProducts?.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-2">Products accepted</p>
                          <div className="flex flex-wrap gap-2">
                            {drive.acceptedProducts.slice(0, 4).map((type) => {
                              const config = DONATION_TYPE_CONFIG[type];
                              return config ? (
                                <span
                                  key={type}
                                  className="px-2 py-1 bg-pink-50 text-pink-700 rounded-lg text-xs font-medium"
                                >
                                  {config.icon} {config.label}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {drive.comments && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{drive.comments}</p>
                      )}

                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contact</p>
                        <div className="space-y-1 text-sm text-gray-700 mb-5">
                          {drive.organizationEmail && (
                            <p>
                              <a href={`mailto:${drive.organizationEmail}`} className="text-purple-600 hover:text-purple-800">
                                ✉️ {drive.organizationEmail}
                              </a>
                            </p>
                          )}
                          {drive.organizationPhone && (
                            <p>
                              <a href={`tel:${drive.organizationPhone}`} className="text-purple-600 hover:text-purple-800">
                                📞 {drive.organizationPhone}
                              </a>
                            </p>
                          )}
                          {!drive.organizationEmail && !drive.organizationPhone && (
                            <p className="text-gray-500">Contact info not provided</p>
                          )}
                        </div>

                        <Link
                          href={donateHref}
                          className="block w-full text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md"
                        >
                          Donate to This Drive
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
