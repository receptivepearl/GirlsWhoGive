import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import connectDB from "@/config/db";

const BUCKET_NAME = "donation_images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Get GridFS bucket for donation images
 */
async function getBucket() {
    await connectDB();
    const db = mongoose.connection.db;
    return new GridFSBucket(db, { bucketName: BUCKET_NAME });
}

/**
 * Upload image to GridFS
 * @param {Buffer} buffer - Image buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - MIME type
 * @returns {Promise<{fileId: ObjectId, size: number}>}
 */
export async function uploadImageToGridFS(buffer, filename, mimeType) {
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
        throw new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`);
    }

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const bucket = await getBucket();
    
    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: mimeType,
        });

        uploadStream.on("finish", () => {
            resolve({
                fileId: uploadStream.id,
                size: uploadStream.length,
            });
        });

        uploadStream.on("error", (error) => {
            reject(error);
        });

        uploadStream.end(buffer);
    });
}

/**
 * Retrieve image from GridFS
 * @param {ObjectId} fileId - GridFS file ID
 * @returns {Promise<{stream: Readable, metadata: {filename: string, contentType: string, length: number}}>}
 */
export async function getImageFromGridFS(fileId) {
    const bucket = await getBucket();
    
    // Check if file exists
    const files = await bucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
        throw new Error("Image not found");
    }

    const file = files[0];
    const downloadStream = bucket.openDownloadStream(fileId);

    return {
        stream: downloadStream,
        metadata: {
            filename: file.filename,
            contentType: file.contentType || "image/jpeg",
            length: file.length,
        },
    };
}

/**
 * Delete image from GridFS
 * @param {ObjectId} fileId - GridFS file ID
 */
export async function deleteImageFromGridFS(fileId) {
    if (!fileId) return;
    
    const bucket = await getBucket();
    
    return new Promise((resolve, reject) => {
        bucket.delete(fileId, (error) => {
            if (error) {
                // If file doesn't exist, that's okay
                if (error.code === "FileNotFound") {
                    resolve();
                } else {
                    reject(error);
                }
            } else {
                resolve();
            }
        });
    });
}





