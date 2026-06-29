import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Donation from '@/models/Donation';
import Organization from '@/models/Organization';
import Drive from '@/models/Drive';
import { DONATION_TYPES, DONATION_TYPE_CONFIG } from '@/config/donationTypes';

const GUEST_PRODUCT_TYPES = new Set([
    DONATION_TYPES.BOOKS,
    DONATION_TYPES.MENSTRUAL_PRODUCTS,
    DONATION_TYPES.CLOTHING,
    DONATION_TYPES.HYGIENE,
    DONATION_TYPES.FOOD,
    DONATION_TYPES.OTHER,
]);

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            organizationId,
            driveId,
            donorName,
            donorEmail,
            productType,
            customProductName,
            quantity,
        } = body;

        const trimmedName = donorName?.trim();
        const trimmedEmail = donorEmail?.trim()?.toLowerCase();
        const qty = parseInt(quantity, 10);

        if (!organizationId || !driveId) {
            return NextResponse.json({ success: false, message: 'Invalid drive link' }, { status: 400 });
        }
        if (!trimmedName) {
            return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
        }
        if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
            return NextResponse.json({ success: false, message: 'A valid email is required' }, { status: 400 });
        }
        if (!productType || !GUEST_PRODUCT_TYPES.has(productType)) {
            return NextResponse.json({ success: false, message: 'Please select a product type' }, { status: 400 });
        }
        if (!Number.isFinite(qty) || qty < 1) {
            return NextResponse.json({ success: false, message: 'Donation amount must be at least 1' }, { status: 400 });
        }

        const customName = customProductName?.trim();
        if (productType === DONATION_TYPES.OTHER && !customName) {
            return NextResponse.json({ success: false, message: 'Please describe the product you are donating' }, { status: 400 });
        }

        await connectDB();

        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return NextResponse.json({ success: false, message: 'Organization not found' }, { status: 404 });
        }

        const drive = await Drive.findById(driveId);
        if (!drive || drive.organizationId !== organizationId) {
            return NextResponse.json({ success: false, message: 'Invalid drive' }, { status: 400 });
        }

        const now = Date.now();
        if (now < drive.startDate || now > drive.endDate) {
            return NextResponse.json({ success: false, message: 'This drive is not currently accepting donations' }, { status: 400 });
        }

        const productLabel = productType === DONATION_TYPES.OTHER
            ? customName
            : (DONATION_TYPE_CONFIG[productType]?.label || productType);

        const items = [{
            productType,
            name: productLabel,
            quantity: qty,
            description: productType === DONATION_TYPES.OTHER ? customName : '',
        }];

        const donation = new Donation({
            donorId: 'guest',
            isGuestDonation: true,
            organizationId,
            organizationName: organization.name,
            driveId,
            items,
            totalItems: qty,
            donorName: trimmedName,
            donorEmail: trimmedEmail,
            status: 'pending',
            date: now,
        });

        await donation.save();

        return NextResponse.json({
            success: true,
            message: 'Donation submitted successfully',
            donation: {
                _id: donation._id,
                driveName: drive.name,
                organizationName: organization.name,
            },
        });
    } catch (error) {
        console.error('Guest donation error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
