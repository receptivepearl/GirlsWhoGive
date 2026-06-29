import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
    donorId: { type: String, default: 'guest', ref: 'user' },
    isGuestDonation: { type: Boolean, default: false },
    organizationId: {type: String, required: true, ref: 'organization'},
    items: [{
        productType: {type: String, required: true},
        name: {type: String, required: true},
        quantity: {type: Number, required: true},
        description: {type: String, default: ''}
    }],
    totalItems: {type: Number, required: true},
    status: {type: String, required: true, default: 'pending'}, // pending, confirmed, delivered, cancelled
    donorName: {type: String, required: true},
    donorEmail: {type: String, required: true},
    organizationName: {type: String, required: true},
    driveId: {type: String, default: null},
    date: {type: Number, required: true},
    notes: {type: String, default: ''},
    // SINGLE SOURCE OF TRUTH: Cloudinary image metadata
    // Images are uploaded ONLY at donation creation time via /api/donations/create
    // This field is the ONLY field used by all UIs (donor, organization, admin)
    // If null, no image was provided during creation
    image: {
        secure_url: {type: String, default: null},
        public_id: {type: String, default: null}
    },
    // Legacy GridFS fields (DEPRECATED - NEVER READ BY APPLICATION CODE)
    // These fields exist only for historical data and must never be used in new code
    imageFileId: {type: mongoose.Schema.Types.ObjectId, default: null},
    imageMimeType: {type: String, default: null},
    imageUploadedAt: {type: Date, default: null},
    imageOriginalName: {type: String, default: null},
    imageSizeBytes: {type: Number, default: null},
    // Legacy field (DEPRECATED - NEVER READ)
    imageUrl: {type: String, default: ''}
});

const Donation = mongoose.models.donation || mongoose.model('donation', donationSchema);
export default Donation;







