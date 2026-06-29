// src/lib/locationService.js

// Location service for Google Maps API integration
export class LocationService {
    constructor() {
        this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        this.placesService = null;
        this.geocoder = null;
        this.distanceMatrixService = null;
        this.map = null;
        
        // Validate API key on initialization
        if (typeof window === 'undefined' && !this.apiKey) {
            console.error('⚠️ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set in environment variables');
        }
    }

    // Initialize Google Maps services (browser-only)
    async initializeServices() {
        if (typeof window === 'undefined') return false; // Guard on the server
        
        if (!window.google || !window.google.maps) {
            await this.loadGoogleMapsScript();
        }

        if (typeof window !== 'undefined') {
            if (!this.placesService) {
                // Ensure we only initialize services if we're in the browser environment
                this.placesService = new window.google.maps.places.PlacesService(
                    document.createElement('div')
                );
            }

            if (!this.geocoder) {
                this.geocoder = new window.google.maps.Geocoder();
            }

            if (!this.distanceMatrixService) {
                this.distanceMatrixService = new window.google.maps.DistanceMatrixService();
            }
        }

        return typeof window !== 'undefined';
    }

    // Load Google Maps script
    async loadGoogleMapsScript() {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve();
                return;
            }

            if (!this.apiKey) {
                const error = new Error('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.');
                console.error('❌', error.message);
                reject(error);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&callback=initMap`;
            script.async = true;
            script.defer = true;

            window.initMap = () => resolve();

            script.onerror = () => {
                const error = new Error('Failed to load Google Maps script. Please check if your API key is valid and has the required APIs enabled (Places API, Distance Matrix API).');
                console.error('❌', error.message);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    // Get user's current location
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error(`Geolocation Error (${error.code}): ${error.message}`, error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    // FIX: Increased timeout to 20 seconds
                    timeout: 20000, 
                    maximumAge: 300000 
                }
            );
        });
    }

    // Search for nearby places using Google Places API
    async searchNearbyPlaces(location, query = '', radius = 50000) {
        // Server-side implementation (using Web Services API)
        if (typeof window === 'undefined') {
            if (!this.apiKey) {
                const error = new Error('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.');
                console.error('❌', error.message);
                throw error;
            }
            
            const keyword = query || 'women shelter, homeless shelter, community center, food bank, donation center';
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${this.apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
                return data.results;
            } else if (data.status === 'REQUEST_DENIED') {
                const error = new Error(`Google Places API error: ${data.status}. ${data.error_message || 'Please check if your API key is valid and has Places API enabled.'}`);
                console.error('❌', error.message);
                throw error;
            } else {
                const error = new Error(`Google Places API error: ${data.status}. ${data.error_message || ''}`);
                console.error('❌', error.message);
                throw error;
            }
        } 
        
        // Client-side implementation (using JS API)
        await this.initializeServices();

        const request = {
            location: new window.google.maps.LatLng(location.lat, location.lng),
            radius: radius,
            type: ['establishment'],
            keyword: query || 'women shelter, homeless shelter, community center, food bank, donation center'
        };

        return new Promise((resolve, reject) => {
            this.placesService.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    resolve(results);
                } else {
                    reject(new Error(`Places API error: ${status}`));
                }
            });
        });
    }

    // Search places by text query (kept for completeness, original logic remains)
    async searchPlacesByText(query, location) {
        if (typeof window === 'undefined') {
            // For the API route, you should use Nearby Search or Find Place (which requires a different structure). 
            // We rely on searchNearbyPlaces in the API route for simplicity.
            throw new Error('Text Search is not implemented for server-side use via LocationService.');
        }

        await this.initializeServices();

        const request = {
            query: query,
            location: new window.google.maps.LatLng(location.lat, location.lng),
            radius: 50000
        };

        return new Promise((resolve, reject) => {
            this.placesService.textSearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    resolve(results);
                } else {
                    reject(new Error(`Places API error: ${status}`));
                }
            });
        });
    }

    // Get place details
    async getPlaceDetails(placeId) {
        // Server-side implementation
        if (typeof window === 'undefined') {
            if (!this.apiKey) {
                const error = new Error('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.');
                console.error('❌', error.message);
                throw error;
            }
            
            const fields = ['name', 'formatted_address', 'geometry', 'photos', 'rating', 'user_ratings_total', 'types', 'formatted_phone_number', 'website', 'international_phone_number'];
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields.join(',')}&key=${this.apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK') {
                return data.result;
            } else if (data.status === 'REQUEST_DENIED') {
                const error = new Error(`Google Places API error: ${data.status}. ${data.error_message || 'Please check if your API key is valid and has Places API enabled.'}`);
                console.error('❌', error.message);
                throw error;
            } else {
                const error = new Error(`Place details error: ${data.status}. ${data.error_message || ''}`);
                console.error('❌', error.message);
                throw error;
            }
        }

        // Client-side implementation
        await this.initializeServices();

        const request = {
            placeId: placeId,
            fields: ['name', 'formatted_address', 'geometry', 'photos', 'rating', 'user_ratings_total', 'opening_hours', 'formatted_phone_number', 'website', 'types']
        };

        return new Promise((resolve, reject) => {
            this.placesService.getDetails(request, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    resolve(place);
                } else {
                    reject(new Error(`Place details error: ${status}`));
                }
            });
        });
    }

    // Calculate distances using Distance Matrix API
    async calculateDistances(origin, destinations) {
        // Server-side implementation
        if (typeof window === 'undefined') {
            if (!this.apiKey) {
                const error = new Error('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.');
                console.error('❌', error.message);
                throw error;
            }
            
            const originsParam = `${origin.lat},${origin.lng}`;
            const destinationsParam = destinations.map(dest => `${dest.lat},${dest.lng}`).join('|');
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsParam}&destinations=${destinationsParam}&mode=driving&units=imperial&key=${this.apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK') {
                // Ensure we have results before mapping
                if (data.rows && data.rows.length > 0) {
                    const distances = data.rows[0].elements.map((element, index) => ({
                        index: index,
                        distance: element.distance,
                        duration: element.duration
                    }));
                    return distances;
                }
                return []; // Return empty array if no rows
            } else if (data.status === 'REQUEST_DENIED') {
                const error = new Error(`Google Distance Matrix API error: ${data.status}. ${data.error_message || 'Please check if your API key is valid and has Distance Matrix API enabled.'}`);
                console.error('❌', error.message);
                throw error;
            } else {
                const error = new Error(`Distance Matrix error: ${data.status}. ${data.error_message || ''}`);
                console.error('❌', error.message);
                throw error;
            }
        }
        
        // Client-side implementation
        await this.initializeServices();

        const request = {
            origins: [new window.google.maps.LatLng(origin.lat, origin.lng)],
            destinations: destinations.map(dest => 
                new window.google.maps.LatLng(dest.lat, dest.lng)
            ),
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.IMPERIAL
        };

        return new Promise((resolve, reject) => {
            this.distanceMatrixService.getDistanceMatrix(request, (response, status) => {
                if (status === window.google.maps.DistanceMatrixStatus.OK) {
                    const distances = response.rows[0].elements.map((element, index) => ({
                        index: index,
                        distance: element.distance,
                        duration: element.duration
                    }));
                    resolve(distances);
                } else {
                    reject(new Error(`Distance Matrix error: ${status}`));
                }
            });
        });
    }

    // Geocode address to coordinates (retains original logic)
    async geocodeAddress(address) {
        try {
            await this.initializeServices();

            return new Promise((resolve, reject) => {
                this.geocoder.geocode({ address }, (results, status) => {
                    if (status === window.google.maps.GeocoderStatus.OK) {
                        const location = results[0].geometry.location;
                        resolve({
                            lat: location.lat(),
                            lng: location.lng(),
                            formatted_address: results[0].formatted_address
                        });
                    } else {
                        reject(new Error(`Geocoding error: ${status}`));
                    }
                });
            });
        } catch (error) {
            console.error('Error geocoding address:', error);
            throw error;
        }
    }

    // Get photo URL from place photo reference
    getPhotoUrl(photoReference, maxWidth = 400) {
        if (!photoReference) return null;
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
    }

    // Format place data for our app
    formatPlaceData(place, distance = null) {
        // CORRECTED FIX: Handle different location object structure (function vs raw value)
        const location = place.geometry.location;

        const lat = location && location.lat 
            ? (typeof location.lat === 'function' ? location.lat() : location.lat) 
            : null;
            
        const lng = location && location.lng 
            ? (typeof location.lng === 'function' ? location.lng() : location.lng) 
            : null;

        return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity || place.formatted_address || (place.plus_code ? place.plus_code.compound_code : 'Address not available'),
            lat: lat,
            lng: lng,
            rating: place.rating || 0,
            userRatingsTotal: place.user_ratings_total || 0,
            types: place.types || [],
            photoUrl: place.photos && place.photos[0] && place.photos[0].photo_reference ? this.getPhotoUrl(place.photos[0].photo_reference) : null,
            verified: false, 
            distance: distance,
            isGooglePlace: true,
            phone: place.formatted_phone_number || place.international_phone_number || null,
            email: null, // Google Places API doesn't provide email, but we can use website
            website: place.website || null
        };
    }
}

// Create a singleton instance
export const locationService = new LocationService();


