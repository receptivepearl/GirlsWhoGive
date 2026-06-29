import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Organization from '@/models/Organization';

export async function GET() {
    try {
        await connectDB();

        const parentOrganizations = await Organization.find({
            isOrgAdministrator: true,
            approvalStatus: { $ne: 'rejected' },
        })
            .select('_id name approvalStatus verified')
            .sort({ name: 1 });

        return NextResponse.json({
            success: true,
            organizations: parentOrganizations,
        });
    } catch (error) {
        console.error('Error fetching parent organizations:', error);
        return NextResponse.json({
            success: false,
            message: error.message,
        }, { status: 500 });
    }
}
