import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Donation from "@/models/Donation";
import Organization from "@/models/Organization";
import Drive from "@/models/Drive";
import { NextResponse } from "next/server";
import { getChapterIdsForParent, getChaptersForParent } from "@/lib/orgChapters";

const CONFIRMED_STATUSES = ['confirmed', 'in_transit', 'completed'];

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status');

        await connectDB();

        const organization = await Organization.findById(userId);
        if (!organization) {
            return NextResponse.json({
                success: false,
                message: 'Organization not found'
            });
        }

        let organizationIds = [userId];
        let chapterNameMap = {};

        if (organization.isOrgAdministrator && organization.approvalStatus === 'approved' && organization.verified) {
            const chapters = await getChaptersForParent(userId);
            organizationIds = chapters.map((chapter) => chapter._id);
            chapterNameMap = Object.fromEntries(chapters.map((chapter) => [chapter._id, chapter.name]));
        }

        const query = { organizationId: { $in: organizationIds } };

        if (statusFilter === 'pending') {
            query.status = 'pending';
        } else if (statusFilter === 'confirmed') {
            query.status = { $in: CONFIRMED_STATUSES };
        }

        const donations = await Donation.find(query).sort({ date: -1 });

        const driveIds = [...new Set(donations.filter((d) => d.driveId).map((d) => d.driveId))];
        const drives = driveIds.length
            ? await Drive.find({ _id: { $in: driveIds } }).select('name')
            : [];
        const driveNameMap = Object.fromEntries(drives.map((d) => [d._id.toString(), d.name]));

        const donationsWithChapter = donations.map((donation) => ({
            ...donation.toObject(),
            chapterName: chapterNameMap[donation.organizationId] || organization.name,
            driveName: donation.driveId ? driveNameMap[donation.driveId] : null,
        }));
        
        return NextResponse.json({
            success: true,
            donations: donationsWithChapter,
            organization: organization,
            isOrgAdministrator: organization.isOrgAdministrator,
        });

    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        });
    }
}

export async function PUT(request) {
    try {
        const { userId } = getAuth(request);
        const { donationId, status, action, notes } = await request.json();

        await connectDB();

        const organization = await Organization.findById(userId);
        if (!organization) {
            return NextResponse.json({
                success: false,
                message: 'Organization not found'
            });
        }

        let allowedOrgIds = [userId];

        if (organization.isOrgAdministrator && organization.approvalStatus === 'approved' && organization.verified) {
            const chapterIds = await getChapterIdsForParent(userId);
            allowedOrgIds = [...allowedOrgIds, ...chapterIds];
        }

        const donation = await Donation.findOne({ 
            _id: donationId, 
            organizationId: { $in: allowedOrgIds },
        });

        if (!donation) {
            return NextResponse.json({
                success: false,
                message: 'Donation not found or unauthorized'
            });
        }

        const resolvedAction = action || (status === 'cancelled' ? 'reject' : status === 'confirmed' ? 'confirm' : null);

        if (resolvedAction === 'confirm') {
            if (donation.status !== 'pending') {
                return NextResponse.json({
                    success: false,
                    message: 'Only pending submissions can be confirmed',
                }, { status: 400 });
            }

            donation.status = 'confirmed';
            if (notes) donation.notes = notes;
            await donation.save();

            await Organization.findByIdAndUpdate(donation.organizationId, {
                $inc: {
                    totalOrders: 1,
                    totalProducts: donation.totalItems,
                },
            });

            if (donation.driveId) {
                await Drive.findByIdAndUpdate(donation.driveId, {
                    $inc: { currentAmount: donation.totalItems },
                });
            }

            return NextResponse.json({
                success: true,
                message: 'Donation confirmed successfully',
                donation,
            });
        }

        if (resolvedAction === 'reject') {
            if (donation.status !== 'pending') {
                return NextResponse.json({
                    success: false,
                    message: 'Only pending submissions can be rejected',
                }, { status: 400 });
            }

            donation.status = 'cancelled';
            if (notes) donation.notes = notes;
            await donation.save();

            return NextResponse.json({
                success: true,
                message: 'Donation rejected',
                donation,
            });
        }

        // Legacy status updates (in_transit, completed)
        if (status && CONFIRMED_STATUSES.includes(status)) {
            donation.status = status;
            if (notes) donation.notes = notes;
            await donation.save();

            return NextResponse.json({
                success: true,
                message: 'Donation status updated successfully',
                donation,
            });
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid action. Use confirm or reject.',
        }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        });
    }
}
