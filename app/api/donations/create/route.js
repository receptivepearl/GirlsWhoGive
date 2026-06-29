import { NextResponse } from "next/server";
import Donation from "@/models/Donation";
import Organization from "@/models/Organization";
import User from "@/models/User";
import { inngest } from "@/config/inngest";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Check if request is FormData (has image) or JSON
        const contentType = request.headers.get('content-type') || '';
        let organizationId, organizationName, items, totalItems, donorName, donorEmail, driveId;
        let imageData = null;

        // Try to parse as FormData first (if it contains multipart/form-data)
        if (contentType.includes('multipart/form-data')) {
            // Handle FormData with image
            const formData = await request.formData();
            organizationId = formData.get('organizationId');
            organizationName = formData.get('organizationName');
            const itemsString = formData.get('items');
            items = itemsString ? JSON.parse(itemsString) : [];
            totalItems = parseInt(formData.get('totalItems')) || 0;
            donorName = formData.get('donorName');
            donorEmail = formData.get('donorEmail');
            driveId = formData.get('driveId') || null;
            
            const imageFile = formData.get('image');
            
            // Upload image to Cloudinary if provided
            if (imageFile && imageFile.size > 0) {
                // Validate file type
                const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedMimeTypes.includes(imageFile.type)) {
                    return NextResponse.json({ 
                        success: false, 
                        message: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.' 
                    }, { status: 400 });
                }

                // Validate file size (5MB max)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (imageFile.size > maxSize) {
                    return NextResponse.json({ 
                        success: false, 
                        message: 'File size exceeds 5MB limit.' 
                    }, { status: 400 });
                }

                try {
                    const arrayBuffer = await imageFile.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    // Upload to Cloudinary in donations/ folder
                    const uploadResult = await new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            {
                                folder: 'donations',
                                resource_type: 'image',
                                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
                            },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        stream.end(buffer);
                    });

                    // Store only Cloudinary metadata
                    imageData = {
                        secure_url: uploadResult.secure_url,
                        public_id: uploadResult.public_id
                    };
                } catch (uploadError) {
                    console.error('Error uploading image to Cloudinary:', uploadError);
                    return NextResponse.json({ 
                        success: false, 
                        message: 'Failed to upload image. Please try again.' 
                    }, { status: 500 });
                }
            }
        } else {
            // Handle JSON (no image)
            const body = await request.json();
            organizationId = body.organizationId;
            organizationName = body.organizationName;
            items = body.items;
            totalItems = body.totalItems;
            donorName = body.donorName;
            donorEmail = body.donorEmail;
            driveId = body.driveId || null;
        }

        if (!organizationId || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid donation data' });
        }

        await connectDB();

        if (driveId) {
            const Drive = (await import('@/models/Drive')).default;
            const drive = await Drive.findById(driveId);
            if (!drive || drive.organizationId !== organizationId) {
                return NextResponse.json({ success: false, message: 'Invalid drive' }, { status: 400 });
            }
            const now = Date.now();
            if (now < drive.startDate || now > drive.endDate) {
                return NextResponse.json({ success: false, message: 'This drive is not currently active' }, { status: 400 });
            }
        }

        // INVARIANT: Images are uploaded ONLY at donation creation time
        // If image upload fails, donation is NOT created (error returned above)
        // If no image provided, imageData is null (donation created without image)
        // This is the ONLY place where donation images are set
        const donation = new Donation({
            donorId: userId,
            organizationId: organizationId,
            items: items,
            totalItems: totalItems,
            donorName: donorName,
            donorEmail: donorEmail,
            organizationName: organizationName,
            driveId: driveId || null,
            status: 'pending',
            date: Date.now(),
            image: imageData // Cloudinary metadata only (null if no image provided)
        });

        await donation.save();

        // Stats and drive progress update on org confirm/reject, not at submission time.

        // Send Inngest event for donation processing
        await inngest.send({
            name: 'donation/created',
            data: {
                donationId: donation._id,
                donorId: userId,
                organizationId: organizationId,
                totalItems: totalItems,
                status: 'pending',
                date: Date.now()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Donation commitment created successfully',
            donation: donation
        });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: error.message });
    }
}







