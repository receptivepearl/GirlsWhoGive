import { NextResponse } from "next/server";
import Organization from "@/models/Organization";
import User from "@/models/User";
import AdminNotification from "@/models/AdminNotification";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { 
            name, 
            address, 
            phone, 
            email, 
            description, 
            website, 
            taxId, 
            contactPerson = '',
            hours = '',
            productsNeeded = [],
            acceptedDonationTypes = [],
            isOrgAdministrator = false,
            parentOrganizationId = null,
            location = '',
            lat = 0,
            lng = 0
        } = await request.json();

        await connectDB();

        const existingOrg = await Organization.findById(userId);

        if (isOrgAdministrator && parentOrganizationId) {
            return NextResponse.json({
                success: false,
                message: 'Organization administrators cannot belong to a parent organization',
            }, { status: 400 });
        }

        if (!isOrgAdministrator && parentOrganizationId) {
            const parentOrg = await Organization.findOne({
                _id: parentOrganizationId,
                isOrgAdministrator: true,
                approvalStatus: { $ne: 'rejected' },
            });
            if (!parentOrg) {
                return NextResponse.json({
                    success: false,
                    message: 'Selected parent organization is not valid',
                }, { status: 400 });
            }
        }
        
        if (existingOrg) {
            return NextResponse.json({
                success: false,
                message: 'Organization already exists for this user'
            });
        }

        const user = await User.findById(userId);
        const resolvedEmail = email || user?.email || '';

        const requiresApproval = Boolean(isOrgAdministrator);
        const approvalStatus = requiresApproval ? 'pending' : 'approved';
        const verified = !requiresApproval;

        const organization = new Organization({
            _id: userId,
            name: name,
            email: resolvedEmail,
            address: address,
            phone: phone || '',
            website: website || '',
            description: description || '',
            taxId: taxId || '',
            contactPerson: contactPerson || '',
            hours: hours || '',
            productsNeeded: productsNeeded || [],
            acceptedDonationTypes: acceptedDonationTypes || [],
            isOrgAdministrator: Boolean(isOrgAdministrator),
            parentOrganizationId: isOrgAdministrator ? null : (parentOrganizationId || null),
            location: location || '',
            approvalStatus,
            lat: lat || 0,
            lng: lng || 0,
            verified,
            totalOrders: 0,
            totalProducts: 0,
            date: Date.now()
        });

        await organization.save();

        await User.findByIdAndUpdate(userId, {
            role: 'organization'
        }, { upsert: false });

        if (requiresApproval) {
            await AdminNotification.create({
                type: 'org_admin_registration',
                organizationId: userId,
                organizationName: name,
                requesterEmail: user?.email || resolvedEmail,
                status: 'pending',
            });
        }

        return NextResponse.json({
            success: true,
            message: requiresApproval
                ? 'Registration submitted. Your account will be activated after platform administrator approval.'
                : 'Organization created successfully',
            organization: organization,
            pendingApproval: requiresApproval,
        });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        });
    }
}
