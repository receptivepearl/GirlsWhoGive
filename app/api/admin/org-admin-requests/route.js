import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Donation from "@/models/Donation";
import Organization from "@/models/Organization";
import User from "@/models/User";
import AdminNotification from "@/models/AdminNotification";
import { NextResponse } from "next/server";
import { isPlatformAdminEmail } from "@/lib/platformAdmin";

async function requirePlatformAdmin(userId) {
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
        return null;
    }
    const adminEmail = process.env.PLATFORM_ADMIN_EMAIL?.trim();
    if (adminEmail && !isPlatformAdminEmail(user.email)) {
        return null;
    }
    return user;
}

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const admin = await requirePlatformAdmin(userId);
        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const pendingOrganizations = await Organization.find({
            isOrgAdministrator: true,
            approvalStatus: 'pending',
        }).sort({ date: -1 });

        const pendingNotifications = await AdminNotification.find({
            type: 'org_admin_registration',
            status: 'pending',
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            requests: pendingOrganizations.map((org) => ({
                organizationId: org._id,
                organizationName: org.name,
                address: org.address,
                email: org.email,
                description: org.description,
                date: org.date,
                acceptedDonationTypes: org.acceptedDonationTypes,
            })),
            pendingCount: pendingOrganizations.length,
            notifications: pendingNotifications,
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId, action } = await request.json();

        if (!organizationId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({
                success: false,
                message: 'organizationId and action (approve|reject) are required',
            }, { status: 400 });
        }

        await connectDB();

        const admin = await requirePlatformAdmin(userId);
        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const organization = await Organization.findOne({
            _id: organizationId,
            isOrgAdministrator: true,
        });

        if (!organization) {
            return NextResponse.json({ success: false, message: 'Organization request not found' }, { status: 404 });
        }

        if (action === 'approve') {
            organization.verified = true;
            organization.approvalStatus = 'approved';
        } else {
            organization.verified = false;
            organization.approvalStatus = 'rejected';
        }

        await organization.save();

        await AdminNotification.updateMany(
            { organizationId, type: 'org_admin_registration', status: 'pending' },
            { status: action === 'approve' ? 'approved' : 'rejected', resolvedAt: new Date() }
        );

        return NextResponse.json({
            success: true,
            message: action === 'approve'
                ? 'Organization administrator approved successfully'
                : 'Organization administrator request rejected',
            organization,
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
