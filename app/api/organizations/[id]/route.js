import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Organization from '@/models/Organization';

export async function GET(request, { params }) {
    try {
        await connectDB();
        
        const { id } = await params;
        const organization = await Organization.findById(id);
        
        if (!organization) {
            return NextResponse.json({
                success: false,
                message: 'Organization not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            organization: organization
        });

    } catch (error) {
        console.error('Error fetching organization:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}




