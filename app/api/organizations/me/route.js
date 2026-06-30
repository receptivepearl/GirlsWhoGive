import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Organization from "@/models/Organization";
import { NextResponse } from "next/server";
import { serializeOrganization } from "@/lib/organizationUtils";

const EDITABLE_FIELDS = [
    'name',
    'address',
    'phone',
    'website',
    'description',
    'taxId',
    'contactPerson',
    'hours',
    'location',
    'acceptedDonationTypes',
    'lat',
    'lng',
];

function pickEditableFields(data) {
    const updates = {};
    for (const field of EDITABLE_FIELDS) {
        if (data[field] !== undefined) {
            updates[field] = data[field];
        }
    }
    return updates;
}

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        await connectDB();

        const organization = await Organization.findById(userId);
        if (!organization) {
            return NextResponse.json({
                success: false,
                message: 'Organization not found'
            });
        }

        return NextResponse.json({
            success: true,
            organization: serializeOrganization(organization)
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
        const body = await request.json();

        await connectDB();

        const existing = await Organization.findById(userId);
        if (!existing) {
            return NextResponse.json({
                success: false,
                message: 'Organization not found'
            });
        }

        const updates = pickEditableFields(body);

        if (updates.name !== undefined && !String(updates.name).trim()) {
            return NextResponse.json({
                success: false,
                message: 'Organization name is required',
            }, { status: 400 });
        }

        if (updates.address !== undefined && !String(updates.address).trim()) {
            return NextResponse.json({
                success: false,
                message: 'Address is required',
            }, { status: 400 });
        }

        if (!existing.isOrgAdministrator) {
            const location = updates.location !== undefined ? updates.location : existing.location;
            if (!String(location || '').trim()) {
                return NextResponse.json({
                    success: false,
                    message: 'Chapter location is required',
                }, { status: 400 });
            }
        }

        if (updates.acceptedDonationTypes !== undefined) {
            if (!Array.isArray(updates.acceptedDonationTypes) || updates.acceptedDonationTypes.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'Please select at least one donation category',
                }, { status: 400 });
            }
        }

        if (updates.name !== undefined) updates.name = String(updates.name).trim();
        if (updates.address !== undefined) updates.address = String(updates.address).trim();
        if (updates.phone !== undefined) updates.phone = String(updates.phone).trim();
        if (updates.website !== undefined) updates.website = String(updates.website).trim();
        if (updates.description !== undefined) updates.description = String(updates.description).trim();
        if (updates.taxId !== undefined) updates.taxId = String(updates.taxId).trim();
        if (updates.contactPerson !== undefined) updates.contactPerson = String(updates.contactPerson).trim();
        if (updates.hours !== undefined) updates.hours = String(updates.hours).trim();
        if (updates.location !== undefined) updates.location = String(updates.location).trim();

        const organization = await Organization.findByIdAndUpdate(
            userId,
            updates,
            { new: true }
        );

        return NextResponse.json({
            success: true,
            message: 'Organization updated successfully',
            organization: serializeOrganization(organization)
        });

    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        });
    }
}
