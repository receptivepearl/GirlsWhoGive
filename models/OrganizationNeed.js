import mongoose from "mongoose";

const organizationNeedSchema = new mongoose.Schema({
    organizationName: { type: String, required: true },
    description: { type: String, default: '' },
    requiredItems: [{
        name: { type: String, required: true },
        notes: { type: String, default: '' }
    }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { minimize: false });

const OrganizationNeed = mongoose.models.organizationneed || mongoose.model('organizationneed', organizationNeedSchema);
export default OrganizationNeed;





