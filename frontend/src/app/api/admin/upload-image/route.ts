import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { isTestVendor, shouldIncludeTestVendors } from '@/lib/env/env';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const STANDARD_WIDTH = 800;
const AUTOSCALE_HEIGHT = null; // Maintain aspect ratio
const JPEG_QUALITY = 90;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const vendorSlug = formData.get('vendorSlug') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!vendorSlug) {
      return NextResponse.json({ error: 'No vendor slug provided' }, { status: 400 });
    }

    let query = supabase
      .from('vendors')
      .select('id, slug');

    if (!shouldIncludeTestVendors()) {
      query = query.not('id', 'like', 'TEST-%');
    }

    console.log("Uploading image for vendor:", vendorSlug);

    // Get vendor by slug to verify it exists and get the ID
    const { data: vendor, error: vendorError } = await query
      .eq('slug', vendorSlug)
      .single();


    if (!vendor) {
      console.error("Vendor not found for slug:", vendorSlug);
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    if (vendorError) {
      console.error("Vendor fetch error:", vendorError);
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const isTestData = isTestVendor(vendor.id);
    let r2Bucket;
    if (isTestData) {
      if (!shouldIncludeTestVendors()) {
        console.error("Cannot upload images for test vendors in production");
        return NextResponse.json(
          { error: "Test vendor images can only be uploaded in development environment" },
          { status: 403 }
        );
      }
      console.log("⚠️  Uploading image for TEST vendor (development only)");
      r2Bucket = process.env.R2_TEST_BUCKET_NAME;
    } else {
      r2Bucket = process.env.R2_BUCKET_NAME!;
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Get original image info
    const originalMeta = await sharp(imageBuffer).metadata();
    console.log(`Processing image: ${originalMeta.width}x${originalMeta.height}, ${originalMeta.format}`);

    // Process image with Sharp
    const processedBuffer = await sharp(imageBuffer)
      .resize(STANDARD_WIDTH, AUTOSCALE_HEIGHT, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    // Generate filename
    const timestamp = Date.now();
    const filename = `vendor-photos/${vendorSlug}-${timestamp}.jpg`;



    // Upload to R2
    const uploadCommand = new PutObjectCommand({
      Bucket: r2Bucket,
      Key: filename,
      Body: processedBuffer,
      ContentType: 'image/jpeg',
    });

    await s3.send(uploadCommand);

    const r2Url = isTestData ? `${process.env.R2_TEST_URL}/${filename}`: `${R2_PUBLIC_URL}/${filename}`;

    return NextResponse.json({
      success: true,
      url: r2Url,
      originalSize: imageBuffer.length,
      processedSize: processedBuffer.length,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}