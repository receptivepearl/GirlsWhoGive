import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/config/db';
import Drive from '@/models/Drive';
import Donation from '@/models/Donation';
import User from '@/models/User';
import { getDriveStatus } from '@/lib/driveUtils';
import { getOrganizationIdsForUser } from '@/lib/orgChapters';
import { buildDriveDonationUrl } from '@/lib/driveQrCode';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const includeDonations = searchParams.get('includeDonations') === 'true';

        await connectDB();

        const drive = await Drive.findById(id);
        if (!drive) {
            return NextResponse.json({ success: false, message: 'Drive not found' }, { status: 404 });
        }

        const driveData = {
            ...drive.toObject(),
            status: getDriveStatus(drive),
        };

        const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
        driveData.donationLink = buildDriveDonationUrl(
            drive.organizationId,
            drive._id.toString(),
            baseUrl
        );

        if (!includeDonations) {
            return NextResponse.json({ success: true, drive: driveData });
        }

        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== 'organization') {
            return NextResponse.json({ success: false, message: 'Organization access required' }, { status: 403 });
        }

        const orgIds = await getOrganizationIdsForUser(userId);
        if (!orgIds.includes(drive.organizationId)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const donations = await Donation.find({
            driveId: id,
            status: { $in: ['confirmed', 'in_transit', 'completed'] },
        }).sort({ date: -1 });

        return NextResponse.json({
            success: true,
            drive: driveData,
            donations: donations.map((d) => ({
                _id: d._id,
                donorName: d.donorName,
                donorEmail: d.donorEmail,
                totalItems: d.totalItems,
                items: d.items,
                status: d.status,
                date: d.date,
                notes: d.notes,
            })),
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
