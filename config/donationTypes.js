// Centralized donation type mapping configuration
// Maps donation types to organization categories for both internal filtering and Google Maps queries

export const DONATION_TYPES = {
    MENSTRUAL_PRODUCTS: 'menstrual_products',
    FOOD: 'food',
    CLOTHING: 'clothing',
    BOOKS: 'books',
    HYGIENE: 'hygiene',
    OTHER: 'other'
};

export const DONATION_TYPE_CONFIG = {
    [DONATION_TYPES.MENSTRUAL_PRODUCTS]: {
        label: 'Menstrual Products',
        icon: '🧼',
        // Google Maps search keywords (broadened for inclusivity)
        googleMapsKeywords: [
            "women's shelter",
            "domestic violence shelter",
            "homeless shelter",
            "transitional housing",
            "period poverty nonprofit",
            "women's resource center",
            "shelter",
            "women's organization"
        ],
        // Organization types/categories that accept this (broadened)
        organizationTypes: [
            "women's shelter",
            "domestic violence shelter",
            "homeless shelter",
            "transitional housing",
            "women's resource center",
            "period poverty organization",
            "shelter",
            "women's organization",
            "community center"
        ],
        // Keywords to match in descriptions
        descriptionKeywords: [
            "menstrual",
            "period",
            "hygiene",
            "women",
            "feminine",
            "sanitary",
            "personal care",
            "toiletries"
        ],
        // Default query string for Google Maps (more inclusive)
        defaultQuery: "women's shelter OR domestic violence shelter OR period poverty nonprofit"
    },
    [DONATION_TYPES.FOOD]: {
        label: 'Food / Canned Goods',
        icon: '🍽️',
        googleMapsKeywords: [
            "food bank",
            "food pantry",
            "food distribution center",
            "soup kitchen",
            "community food program",
            "church food program",
            "community kitchen"
        ],
        organizationTypes: [
            "food bank",
            "food pantry",
            "food distribution center",
            "soup kitchen",
            "community kitchen",
            "church",
            "community center"
        ],
        descriptionKeywords: [
            "food",
            "meals",
            "pantry",
            "hunger",
            "groceries",
            "canned",
            "nutrition",
            "feeding"
        ],
        defaultQuery: "food bank OR food pantry OR soup kitchen"
    },
    [DONATION_TYPES.CLOTHING]: {
        label: 'Clothing',
        icon: '👕',
        googleMapsKeywords: [
            "homeless shelter",
            "clothing donation center",
            "thrift store",
            "clothing bank",
            "shelter",
            "transitional housing"
        ],
        organizationTypes: [
            "homeless shelter",
            "clothing donation center",
            "thrift store",
            "clothing bank",
            "shelter",
            "transitional housing",
            "community center"
        ],
        descriptionKeywords: [
            "clothing",
            "apparel",
            "coats",
            "shoes",
            "donations",
            "thrift",
            "wardrobe"
        ],
        defaultQuery: "homeless shelter OR clothing donation center OR thrift store"
    },
    [DONATION_TYPES.BOOKS]: {
        label: 'Books / School Supplies',
        icon: '📚',
        googleMapsKeywords: [
            "school",
            "community center",
            "education nonprofit",
            "library",
            "after school program",
            "tutoring center",
            "youth program"
        ],
        organizationTypes: [
            "school",
            "community center",
            "education nonprofit",
            "library",
            "after school program",
            "tutoring center",
            "youth program"
        ],
        descriptionKeywords: [
            "books",
            "education",
            "school supplies",
            "learning",
            "reading",
            "library",
            "students",
            "youth"
        ],
        defaultQuery: "school OR community center OR education nonprofit OR library"
    },
    [DONATION_TYPES.HYGIENE]: {
        label: 'Hygiene / Toiletries',
        icon: '🧴',
        googleMapsKeywords: [
            "homeless shelter",
            "transitional housing",
            "shelter",
            "resource center",
            "health nonprofit",
            "community outreach"
        ],
        organizationTypes: [
            "homeless shelter",
            "transitional housing",
            "shelter",
            "resource center",
            "health nonprofit",
            "community outreach",
            "community center"
        ],
        descriptionKeywords: [
            "hygiene",
            "toiletries",
            "personal care",
            "essentials",
            "soap",
            "shampoo",
            "toothbrush",
            "health"
        ],
        defaultQuery: "homeless shelter OR transitional housing OR shelter OR health nonprofit"
    },
    [DONATION_TYPES.OTHER]: {
        label: 'Other / General',
        icon: '📦',
        googleMapsKeywords: [
            "nonprofit",
            "donation center",
            "charity",
            "community organization",
            "community center"
        ],
        organizationTypes: [
            "nonprofit",
            "donation center",
            "charity",
            "community organization",
            "community center"
        ],
        descriptionKeywords: [
            "donations",
            "nonprofit",
            "charity",
            "community",
            "help",
            "support"
        ],
        defaultQuery: "nonprofit OR donation center OR charity"
    }
};

// Get Google Maps query string for a donation type (inclusive, no verification terms)
export function getGoogleMapsQuery(donationType, userQuery = '') {
    if (!donationType || donationType === DONATION_TYPES.OTHER) {
        return userQuery || "nonprofit, donation center, charity";
    }
    
    const config = DONATION_TYPE_CONFIG[donationType];
    if (!config) {
        return userQuery || "nonprofit";
    }
    
    // Use keywords array to create OR query for better results
    const keywords = config.googleMapsKeywords || [config.defaultQuery];
    const queryString = keywords.slice(0, 3).join(' OR '); // Limit to 3 to avoid query length issues
    
    // Combine user query with donation type query
    if (userQuery) {
        return `${userQuery} ${queryString}`;
    }
    return queryString;
}

// Get organization types that accept a donation type
export function getOrganizationTypesForDonationType(donationType) {
    if (!donationType) return [];
    const config = DONATION_TYPE_CONFIG[donationType];
    return config ? config.organizationTypes : [];
}

// Check if an organization accepts a donation type (PERMISSIVE - errs on side of inclusion)
export function organizationAcceptsDonationType(organization, donationType) {
    if (!donationType) return true; // No filter = show all
    
    const config = DONATION_TYPE_CONFIG[donationType];
    if (!config) return true; // Unknown type = show all
    
    // If organization has explicit acceptedDonationTypes field, check it first
    if (organization.acceptedDonationTypes && Array.isArray(organization.acceptedDonationTypes)) {
        // If explicitly includes the type, definitely match
        if (organization.acceptedDonationTypes.includes(donationType)) {
            return true;
        }
        // If explicitly includes "other" or "general", also match
        if (organization.acceptedDonationTypes.includes(DONATION_TYPES.OTHER)) {
            return true;
        }
        // For menstrual products, also check if they accept hygiene
        if (donationType === DONATION_TYPES.MENSTRUAL_PRODUCTS && 
            organization.acceptedDonationTypes.includes(DONATION_TYPES.HYGIENE)) {
            return true;
        }
    }
    
    // Check organization description for relevant keywords
    const description = (organization.description || '').toLowerCase();
    if (config.descriptionKeywords) {
        const hasKeyword = config.descriptionKeywords.some(keyword => 
            description.includes(keyword.toLowerCase())
        );
        if (hasKeyword) return true;
    }
    
    // For Google Places, check types array (broad matching)
    if (organization.isGooglePlace && organization.types) {
        const orgTypes = organization.types.map(t => t.toLowerCase());
        const acceptedTypes = getOrganizationTypesForDonationType(donationType);
        const matchesType = acceptedTypes.some(type => 
            orgTypes.some(ot => ot.includes(type.toLowerCase()))
        );
        if (matchesType) return true;
    }
    
    // For registered organizations, check name and description
    if (!organization.isGooglePlace) {
        const name = (organization.name || '').toLowerCase();
        const orgText = `${name} ${description}`.toLowerCase();
        
        // Check if name/description contains relevant keywords
        if (config.descriptionKeywords) {
            const hasKeyword = config.descriptionKeywords.some(keyword => 
                orgText.includes(keyword.toLowerCase())
            );
            if (hasKeyword) return true;
        }
        
        // Check if name/description contains organization type keywords
        const acceptedTypes = getOrganizationTypesForDonationType(donationType);
        const matchesType = acceptedTypes.some(type => 
            orgText.includes(type.toLowerCase())
        );
        if (matchesType) return true;
    }
    
    // For "other" category, always match (general donations)
    if (donationType === DONATION_TYPES.OTHER) {
        return true;
    }
    
    // PERMISSIVE FALLBACK: For all donation types, if organization mentions
    // common shelter/community keywords, be inclusive (especially for early-stage platforms)
    const orgText = `${organization.name || ''} ${organization.description || ''}`.toLowerCase();
    const commonKeywords = ['shelter', 'housing', 'resource', 'center', 'community', 'nonprofit', 'charity', 'donation'];
    
    // For specific donation types, add type-specific permissive matching
    if (donationType === DONATION_TYPES.MENSTRUAL_PRODUCTS || 
        donationType === DONATION_TYPES.HYGIENE) {
        // Shelters and community centers typically accept hygiene/personal care items
        if (commonKeywords.some(keyword => orgText.includes(keyword))) {
            return true;
        }
    }
    
    if (donationType === DONATION_TYPES.CLOTHING) {
        // Shelters and community centers typically accept clothing
        if (commonKeywords.some(keyword => orgText.includes(keyword))) {
            return true;
        }
    }
    
    if (donationType === DONATION_TYPES.FOOD) {
        // Community centers and churches often distribute food
        const foodKeywords = ['community', 'church', 'center', 'pantry', 'kitchen'];
        if (foodKeywords.some(keyword => orgText.includes(keyword))) {
            return true;
        }
    }
    
    if (donationType === DONATION_TYPES.BOOKS) {
        // Community centers, schools, and youth programs accept educational materials
        const educationKeywords = ['community', 'school', 'youth', 'education', 'learning', 'library'];
        if (educationKeywords.some(keyword => orgText.includes(keyword))) {
            return true;
        }
    }
    
    // Default: if we can't determine, err on the side of inclusion for early-stage platforms
    // Only exclude if we're very confident it doesn't match
    // For "other" category, always include
    if (donationType === DONATION_TYPES.OTHER) {
        return true;
    }
    
    return false;
}

