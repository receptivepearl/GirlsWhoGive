
import User from "@/models/User";
import Organization from "@/models/Organization";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { serializeOrganization } from "@/lib/organizationUtils";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        await connectDB();
        
        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json({
                success: false, 
                message: "User Not Found"
            });
        }

        let organizationData = null;
        if (user.role === 'organization') {
            organizationData = await Organization.findById(userId);
        }

        if (!organizationData) {
            organizationData = await Organization.findById(userId);
        }

        return NextResponse.json({
            success: true, 
            user: user,
            organization: serializeOrganization(organizationData)
        });
    } catch (error) {
        return NextResponse.json({
            success: false, 
            message: error.message
        });
    }
}