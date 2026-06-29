import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/config/db';
import Drive from '@/models/Drive';
import Organization from '@/models/Organization';
import User from '@/models/User';
import { getDriveStatus } from '@/lib/driveUtils';
import { getChapterIdsForParent } from '@/lib/orgChapters';
import { buildDriveDonationUrl } from '@/lib/driveQrCode';

function resolveAppBaseUrl(request) {
    return request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
}

function enrichDrive(drive, baseUrl, now = Date.now()) {
    const obj = {
        ...drive.toObject(),
        status: getDriveStatus(drive, now),
    };
    obj.donationLink = buildDriveDonationUrl(
        obj.organizationId,
        obj._id.toString(),
        baseUrl
    );
    return obj;
}

async function getOrganizationIdsForUser(userId) {
    const organization = await Organization.findById(userId);
    if (!organization) return [];

    if (organization.isOrgAdministrator && organization.approvalStatus === 'approved' && organization.verified) {
        const chapterIds = await getChapterIdsForParent(userId);
        return [userId, ...chapterIds];
    }

    return [userId];
}

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'all';

        await connectDB();

        if (filter === 'active') {
            const now = Date.now();
            const drives = await Drive.find({
                startDate: { $lte: now },
                endDate: { $gte: now },
            }).sort({ endDate: 1 });

            const orgIds = [...new Set(drives.map((d) => d.organizationId))];
            const orgs = await Organization.find({
                _id: { $in: orgIds },
                verified: true,
                approvalStatus: { $ne: 'rejected' },
            }).select('name location address phone email website');
            const orgMap = Object.fromEntries(orgs.map((o) => [o._id, o]));
            const verifiedIds = new Set(orgs.map((o) => o._id));

            const baseUrl = resolveAppBaseUrl(request);
            const activeDrives = drives
                .filter((d) => verifiedIds.has(d.organizationId))
                .map((d) => {
                    const org = orgMap[d.organizationId];
                    return {
                        ...enrichDrive(d, baseUrl, now),
                        organizationLocation: org?.location || org?.address || '',
                        organizationAddress: org?.address || '',
                        organizationPhone: org?.phone || '',
                        organizationEmail: org?.email || '',
                        organizationWebsite: org?.website || '',
                    };
                });

            return NextResponse.json({ success: true, drives: activeDrives });
        }

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== 'organization') {
            return NextResponse.json({ success: false, message: 'Organization access required' }, { status: 403 });
        }

        const orgIds = await getOrganizationIdsForUser(userId);
        if (orgIds.length === 0) {
            return NextResponse.json({ success: true, drives: [] });
        }

        const query = { organizationId: { $in: orgIds } };
        const now = Date.now();

        let drives = await Drive.find(query).sort({ startDate: -1 });

        if (filter === 'ongoing') {
            drives = drives.filter((d) => getDriveStatus(d, now) === 'ongoing');
        }

        const baseUrl = resolveAppBaseUrl(request);
        const drivesWithStatus = drives.map((d) => enrichDrive(d, baseUrl, now));

        return NextResponse.json({ success: true, drives: drivesWithStatus });
    } catch (error) {
        console.error('Error fetching drives:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { name, goalAmount, acceptedProducts, startDate, endDate, comments } = await request.json();

        if (!name?.trim() || !goalAmount || !startDate || !endDate) {
            return NextResponse.json({
                success: false,
                message: 'Drive name, goal amount, and dates are required',
            }, { status: 400 });
        }

        if (!acceptedProducts?.length) {
            return NextResponse.json({
                success: false,
                message: 'Select at least one product type to accept',
            }, { status: 400 });
        }

        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
            return NextResponse.json({
                success: false,
                message: 'Invalid drive dates. End date must be on or after start date.',
            }, { status: 400 });
        }

        await connectDB();

        const user = await User.findById(userId);
        if (!user || user.role !== 'organization') {
            return NextResponse.json({ success: false, message: 'Organization access required' }, { status: 403 });
        }

        const organization = await Organization.findById(userId);
        if (!organization) {
            return NextResponse.json({ success: false, message: 'Organization not found' }, { status: 404 });
        }

        if (organization.isOrgAdministrator && (organization.approvalStatus !== 'approved' || !organization.verified)) {
            return NextResponse.json({
                success: false,
                message: 'Organization administrator account must be approved before creating drives',
            }, { status: 403 });
        }

        const drive = new Drive({
            organizationId: userId,
            organizationName: organization.name,
            name: name.trim(),
            goalAmount: Number(goalAmount),
            acceptedProducts,
            startDate: start,
            endDate: end,
            comments: comments?.trim() || '',
            currentAmount: 0,
            date: Date.now(),
        });

        await drive.save();

        const baseUrl = resolveAppBaseUrl(request);
        drive.donationLink = buildDriveDonationUrl(userId, drive._id.toString(), baseUrl);
        await drive.save();

        return NextResponse.json({
            success: true,
            drive: enrichDrive(drive, baseUrl),
        });
    } catch (error) {
        console.error('Error creating drive:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
