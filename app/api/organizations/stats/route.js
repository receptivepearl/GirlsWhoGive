import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Donation from "@/models/Donation";
import Organization from "@/models/Organization";
import { NextResponse } from "next/server";
import { getChapterIdsForParent } from "@/lib/orgChapters";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        await connectDB();

        const organization = await Organization.findById(userId);
        if (!organization) {
            return NextResponse.json({
                success: false,
                message: 'Organization not found'
            }, { status: 404 });
        }

        let organizationIds = [userId];

        if (organization.isOrgAdministrator && organization.approvalStatus === 'approved' && organization.verified) {
            const chapterIds = await getChapterIdsForParent(userId);
            organizationIds = chapterIds;
        }

        const totalOrders = await Donation.countDocuments({ 
            organizationId: { $in: organizationIds },
            status: { $in: ['confirmed', 'in_transit', 'completed'] },
        });

        const totalProducts = await Donation.aggregate([
            {
                $match: {
                    organizationId: { $in: organizationIds },
                    status: { $in: ['confirmed', 'in_transit', 'completed'] },
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalItems" }
                }
            }
        ]);

        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        const thisMonthOrders = await Donation.countDocuments({
            organizationId: { $in: organizationIds },
            date: { $gte: thisMonth.getTime() },
            status: { $in: ['confirmed', 'in_transit', 'completed'] },
        });

        const chapterCount = organization.isOrgAdministrator
            ? organizationIds.length
            : 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalOrders,
                totalProducts: totalProducts[0]?.total || 0,
                thisMonthOrders,
                chapterCount,
                isOrgAdministrator: organization.isOrgAdministrator,
            }
        });

    } catch (error) {
        console.error('Error fetching organization stats:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        }, { status: 500 });
    }
}
