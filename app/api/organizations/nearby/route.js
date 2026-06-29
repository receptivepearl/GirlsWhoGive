// src/app/api/organizations/nearby/route.js

import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Organization from "@/models/Organization";
import { locationService } from "@/lib/locationService";
import { getGoogleMapsQuery, organizationAcceptsDonationType, getOrganizationTypesForDonationType } from "@/config/donationTypes";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = parseFloat(searchParams.get('lat'));
        const lng = parseFloat(searchParams.get('lng'));
        const query = searchParams.get('query') || '';
        // FIX: Ensure verifiedOnly is checked as boolean
        const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
        const donationType = searchParams.get('donationType') || null;
        const radius = parseInt(searchParams.get('radius')) || 50000;

        if (!lat || !lng) {
            return NextResponse.json({
                success: false,
                message: "Latitude and longitude are required"
            }, { status: 400 });
        }

        await connectDB();

        // 1. FIX: Update MongoDB Query to conditionally filter by 'verified'
        const mongoQuery = {
            lat: { $exists: true, $ne: null },
            lng: { $exists: true, $ne: null }
        };
        if (verifiedOnly) {
            mongoQuery.verified = true;
        }
        
        const mongoOrganizations = await Organization.find(mongoQuery);

        let allOrganizations = [];
        let googlePlaces = [];

        // 2. INTEGRATION: If not 'verifiedOnly', fetch Google Places
        if (!verifiedOnly) {
            try {
                // Check if API key is configured
                if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
                    console.warn('⚠️ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. Google Places results will not be available.');
                } else {
                    // Modify query based on donation type
                    const mapsQuery = donationType 
                        ? getGoogleMapsQuery(donationType, query)
                        : (query || 'women shelter, homeless shelter, community center, food bank, donation center');
                    
                    // Search for nearby places, using the modified query
                    const nearbyPlaces = await locationService.searchNearbyPlaces(
                        { lat, lng }, 
                        mapsQuery, 
                        radius
                    );

                    // Fetch details and format (limit to 15 to reduce load)
                    const placePromises = nearbyPlaces.slice(0, 15).map(async (place) => {
                        try {
                            const details = await locationService.getPlaceDetails(place.place_id);
                            return locationService.formatPlaceData(details);
                        } catch (error) {
                            return locationService.formatPlaceData(place);
                        }
                    });

                    googlePlaces = await Promise.all(placePromises);
                    
                    // Filter Google Places by donation type (permissive matching)
                    if (donationType) {
                        googlePlaces = googlePlaces.filter(place => 
                            organizationAcceptsDonationType(place, donationType)
                        );
                        
                        // FALLBACK: If filtering results in zero Google Places, be more permissive
                        // This ensures we show relevant results even if exact matching fails
                        if (googlePlaces.length === 0 && nearbyPlaces.length > 0) {
                            const acceptedTypes = getOrganizationTypesForDonationType(donationType);
                            
                            // Fallback: show places that match any of the organization types
                            googlePlaces = await Promise.all(
                                nearbyPlaces.slice(0, 15).map(async (place) => {
                                    try {
                                        const details = await locationService.getPlaceDetails(place.place_id);
                                        return locationService.formatPlaceData(details);
                                    } catch (error) {
                                        return locationService.formatPlaceData(place);
                                    }
                                })
                            );
                            
                            // Filter by type matching (more permissive)
                            googlePlaces = googlePlaces.filter(place => {
                                if (!place.types) return false;
                                const orgTypes = place.types.map(t => t.toLowerCase());
                                return acceptedTypes.some(type => 
                                    orgTypes.some(ot => ot.includes(type.toLowerCase()))
                                );
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Error fetching Google Places:', error.message || error);
                // Continue execution - we'll still show MongoDB organizations
            }
        }

        // Format MongoDB organizations and filter by donation type
        let mongoFormatted = mongoOrganizations
            .map(org => ({
                id: org._id.toString(), 
                name: org.name,
                address: org.address,
                lat: org.lat, // CRITICAL: Needed for distance calculation
                lng: org.lng, // CRITICAL: Needed for distance calculation
                description: org.description,
                photoUrl: org.imageUrl, // Ensure property name matches page.jsx
                verified: org.verified,
                isGooglePlace: false, 
                rating: 0, 
                userRatingsTotal: 0,
                types: ['Registered Organization'],
                email: org.email || null,
                phone: org.phone || null,
                acceptedDonationTypes: org.acceptedDonationTypes || null
            }));
        
        // Apply donation type filter
        if (donationType) {
            mongoFormatted = mongoFormatted.filter(org => 
                organizationAcceptsDonationType(org, donationType)
            );
            
            // FALLBACK: If filtering results in zero organizations, use category-based matching instead
            // This is critical for early-stage platforms with sparse data
            if (mongoFormatted.length === 0 && mongoOrganizations.length > 0) {
                const acceptedTypes = getOrganizationTypesForDonationType(donationType);
                
                // Fallback to category-based matching
                mongoFormatted = mongoOrganizations
                    .map(org => ({
                        id: org._id.toString(), 
                        name: org.name,
                        address: org.address,
                        lat: org.lat,
                        lng: org.lng,
                        description: org.description,
                        photoUrl: org.imageUrl,
                        verified: org.verified,
                        isGooglePlace: false, 
                        rating: 0, 
                        userRatingsTotal: 0,
                        types: ['Registered Organization'],
                        email: org.email || null,
                        phone: org.phone || null,
                        acceptedDonationTypes: org.acceptedDonationTypes || null
                    }))
                    .filter(org => {
                        // Check if name or description contains any of the accepted type keywords
                        const orgText = `${org.name || ''} ${org.description || ''}`.toLowerCase();
                        return acceptedTypes.some(type => 
                            orgText.includes(type.toLowerCase())
                        );
                    });
            }
        }

        // Combine all organizations
        allOrganizations = [...mongoFormatted, ...googlePlaces];

        // 3. DISTANCE CALCULATION: Apply distances and sort
        if (allOrganizations.length > 0) {
            try {
                // Create destinations list from organizations with valid coordinates
                const destinations = allOrganizations
                    .filter(org => org.lat && org.lng)
                    .map(org => ({ lat: org.lat, lng: org.lng }));

                if (destinations.length > 0) {
                    const distances = await locationService.calculateDistances(
                        { lat, lng },
                        destinations
                    );

                    // Re-apply distance information to the original array
                    let distanceIndex = 0;
                    allOrganizations = allOrganizations.map(org => {
                        // Only organizations with valid coordinates were in the destinations array
                        if (org.lat && org.lng) {
                            const distanceInfo = distances[distanceIndex];
                            distanceIndex++;
                            return {
                                ...org,
                                // FIX: Ensure we use 'text' and 'value' fields from the Distance Matrix API
                                distance: distanceInfo?.distance?.text || 'Unknown distance',
                                distanceValue: distanceInfo?.distance?.value || Infinity,
                                duration: distanceInfo?.duration?.text || 'Unknown duration'
                            };
                        }
                        return org;
                    });
                }

                // Sort by distance (closest first)
                allOrganizations.sort((a, b) => {
                    const distanceA = a.distanceValue || Infinity;
                    const distanceB = b.distanceValue || Infinity;
                    return distanceA - distanceB;
                });
                
            } catch (error) {
                console.error('Error calculating distances:', error);
            }
        }

        // Limit to 15 results (after sorting)
        allOrganizations = allOrganizations.slice(0, 15);

        return NextResponse.json({
            success: true,
            organizations: allOrganizations,
            count: allOrganizations.length
        });

    } catch (error) {
        console.error('Error in nearby organizations API:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}


