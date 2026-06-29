import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    _id: {type: String, required: true}, // Clerk user ID
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    address: {type: String, required: true},
    phone: {type: String, default: ''},
    website: {type: String, default: ''},
    description: {type: String, required: true},
    taxId: {type: String, default: ''},
    contactPerson: {type: String, default: ''},
    hours: {type: String, default: ''},
    productsNeeded: [String],
    // Accepted donation types (optional - if not specified, organization accepts "other/general" donations)
    acceptedDonationTypes: [String],
    lat: {type: Number, default: 0},
    lng: {type: Number, default: 0},
    verified: {type: Boolean, default: true}, // Organizations are auto-verified upon registration
    isOrgAdministrator: {type: Boolean, default: false}, // Oversees multiple chapters
    parentOrganizationId: {type: String, default: null}, // Chapter's parent org (Clerk user ID)
    location: {type: String, default: ''}, // Chapter city/region
    approvalStatus: {type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved'},
    imageUrl: {type: String, default: ''},
    totalOrders: {type: Number, default: 0},
    totalProducts: {type: Number, default: 0},
    date: {type: Number, required: true}
}, {minimize: false});

const Organization = mongoose.models.organization || mongoose.model('organization', organizationSchema);
export default Organization;







