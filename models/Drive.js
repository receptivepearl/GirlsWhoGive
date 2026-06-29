import mongoose from "mongoose";

const driveSchema = new mongoose.Schema({
    organizationId: { type: String, required: true, ref: 'organization' },
    organizationName: { type: String, required: true },
    name: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    acceptedProducts: [String],
    startDate: { type: Number, required: true },
    endDate: { type: Number, required: true },
    comments: { type: String, default: '' },
    currentAmount: { type: Number, default: 0 },
    donationLink: { type: String, default: '' },
    date: { type: Number, default: Date.now },
}, { minimize: false });

const Drive = mongoose.models.drive || mongoose.model('drive', driveSchema);
export default Drive;
