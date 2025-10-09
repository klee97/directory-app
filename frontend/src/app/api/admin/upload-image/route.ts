import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server'; // Your server client

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const STANDARD_WIDTH = 800;
const JPEG_QUALITY = 90;
const R2_BUCKET = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with cookies - await to get the actual client
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

    // Get vendor by slug to verify it exists and get the ID
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, slug')
      .eq('slug', vendorSlug)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Get original image info
    const originalMeta = await sharp(imageBuffer).metadata();
    console.log(`Processing image: ${originalMeta.width}x${originalMeta.height}, ${originalMeta.format}`);

    // Process image with Sharp
    const processedBuffer = await sharp(imageBuffer)
      .resize(STANDARD_WIDTH, null, {
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
      Bucket: R2_BUCKET,
      Key: filename,
      Body: processedBuffer,
      ContentType: 'image/jpeg',
    });

    await s3.send(uploadCommand);

    const r2Url = `${R2_PUBLIC_URL}/${filename}`;

    // Update vendor record with new cover image URL
    const { error: updateError } = await supabase
      .from('vendors')
      .update({ cover_image: r2Url })
      .eq('id', vendor.id);

    if (updateError) {
      console.error('Failed to update vendor:', updateError);
      return NextResponse.json({ error: 'Failed to update vendor record' }, { status: 500 });
    }

    // Add entry to vendor_media table
    // The unique index will prevent duplicates if the same URL is uploaded again
    const { error: mediaError } = await supabase
      .from('vendor_media')
      .insert({
        media_url: r2Url,
        vendor_id: vendor.id,
      });

    if (mediaError) {
      // Log the error but don't fail the entire operation
      // The unique constraint might prevent duplicate inserts, which is fine
      console.warn('Failed to add to vendor_media (might be duplicate):', mediaError);
    }


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