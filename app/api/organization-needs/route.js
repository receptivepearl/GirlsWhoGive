import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import OrganizationNeed from "@/models/OrganizationNeed";
import User from "@/models/User";

// GET - All users can view organization needs
export async function GET(request) {
    try {
        await connectDB();
        
        // Ensure test organizations exist
        const testOrg1 = await OrganizationNeed.findOne({ organizationName: 'Test Organization 1' });
        if (!testOrg1) {
            const newTestOrg1 = new OrganizationNeed({
                organizationName: 'Test Organization 1',
                description: 'A test organization that helps provide essential items to those in need in our community.',
                requiredItems: [
                    { name: 'Menstrual Products', notes: 'Pads and tampons of all sizes needed' },
                    { name: 'Food / Canned Goods', notes: 'Non-perishable food items preferred' },
                    { name: 'Clothing', notes: 'All sizes, especially winter clothing' }
                ],
                isActive: true
            });
            await newTestOrg1.save();
        }

        const testOrg2 = await OrganizationNeed.findOne({ organizationName: 'Test Organization 2' });
        if (!testOrg2) {
            const newTestOrg2 = new OrganizationNeed({
                organizationName: 'Test Organization 2',
                description: 'A test organization that helps provide essential items to those in need in our community.',
                requiredItems: [
                    { name: 'Menstrual Products', notes: 'Pads and tampons of all sizes needed' },
                    { name: 'Food / Canned Goods', notes: 'Non-perishable food items preferred' },
                    { name: 'Clothing', notes: 'All sizes, especially winter clothing' }
                ],
                isActive: true
            });
            await newTestOrg2.save();
        }
        
        const needs = await OrganizationNeed.find({ isActive: true })
            .sort({ organizationName: 1 });
        
        return NextResponse.json({
            success: true,
            needs: needs
        });
    } catch (error) {
        console.error('Error fetching organization needs:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

// POST - Only admins can create organization needs
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        await connectDB();

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized - Admin access required'
            }, { status: 403 });
        }

        const body = await request.json();
        const { organizationName, description, requiredItems } = body;

        if (!organizationName || !requiredItems || requiredItems.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Organization name and at least one required item are needed'
            }, { status: 400 });
        }

        const newNeed = new OrganizationNeed({
            organizationName,
            description: description || '',
            requiredItems: requiredItems.map(item => ({
                name: item.name,
                notes: item.notes || ''
            })),
            isActive: true
        });

        await newNeed.save();

        return NextResponse.json({
            success: true,
            need: newNeed
        });
    } catch (error) {
        console.error('Error creating organization need:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

// PUT - Only admins can update organization needs
export async function PUT(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        await connectDB();

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized - Admin access required'
            }, { status: 403 });
        }

        const body = await request.json();
        const { id, organizationName, description, requiredItems, isActive } = body;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'Organization need ID is required'
            }, { status: 400 });
        }

        const updateData = {
            updatedAt: new Date()
        };

        if (organizationName) updateData.organizationName = organizationName;
        if (description !== undefined) updateData.description = description;
        if (requiredItems) {
            updateData.requiredItems = requiredItems.map(item => ({
                name: item.name,
                notes: item.notes || ''
            }));
        }
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedNeed = await OrganizationNeed.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedNeed) {
            return NextResponse.json({
                success: false,
                message: 'Organization need not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            need: updatedNeed
        });
    } catch (error) {
        console.error('Error updating organization need:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

// DELETE - Only admins can delete organization needs
export async function DELETE(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        await connectDB();

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized - Admin access required'
            }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'Organization need ID is required'
            }, { status: 400 });
        }

        const deletedNeed = await OrganizationNeed.findByIdAndDelete(id);

        if (!deletedNeed) {
            return NextResponse.json({
                success: false,
                message: 'Organization need not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Organization need deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting organization need:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

