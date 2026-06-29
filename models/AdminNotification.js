import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['org_admin_registration'] },
    organizationId: { type: String, required: true },
    organizationName: { type: String, required: true },
    requesterEmail: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
}, { minimize: false });

const AdminNotification = mongoose.models.adminnotification
    || mongoose.model('adminnotification', adminNotificationSchema);

export default AdminNotification;
