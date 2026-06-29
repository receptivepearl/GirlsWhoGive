import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Organization from "@/models/Organization";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getChapterIdsForParent } from "@/lib/orgChapters";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        await connectDB();

        const organization = await Organization.findById(userId);
        if (!organization) {
            return NextResponse.json({
                success: false,
                message: 'Organization not found'
            }, { status: 404 });
        }

        if (!organization.isOrgAdministrator) {
            return NextResponse.json({
                success: false,
                message: 'Only organization administrators can view chapters'
            }, { status: 403 });
        }

        if (organization.approvalStatus !== 'approved' || !organization.verified) {
            return NextResponse.json({
                success: false,
                message: 'Organization administrator account is not yet approved'
            }, { status: 403 });
        }

        const chapters = await Organization.find({
            parentOrganizationId: userId,
            approvalStatus: 'approved',
        }).select('_id name location address totalOrders totalProducts date').sort({ name: 1 });

        return NextResponse.json({
            success: true,
            chapters,
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}
