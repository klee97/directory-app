import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { isTestVendor } from '@/lib/env/env';
import { requireAuth, requireVendorAccess } from '@/lib/auth/serverAuth';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(request: NextRequest) {
  try {
    const { user, error: authError, supabase } = await requireAuth();
    if (authError) return authError;

    const { imageUrl, vendorSlug } = await request.json();

    if (!imageUrl || !vendorSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { vendor, error: accessError } = await requireVendorAccess(vendorSlug, user, supabase);

    if (accessError) return accessError;

    // Extract filename from URL
    const url = new URL(imageUrl);
    const filename = url.pathname.substring(1); // Remove leading slash

    // Determine bucket
    const isTestData = isTestVendor(vendor.id);
    const r2Bucket = isTestData
      ? process.env.R2_TEST_BUCKET_NAME
      : process.env.R2_BUCKET_NAME!;

    // Delete from R2
    const deleteCommand = new DeleteObjectCommand({
      Bucket: r2Bucket,
      Key: filename,
    });

    await s3.send(deleteCommand);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}