import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { isTestVendor } from '@/lib/env/env';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function deleteImageServer(imageUrl: string, vendorId: string): Promise<void> {
  console.debug(`Attempting to delete image from R2: ${imageUrl} for vendor ID: ${vendorId}`);
  const url = new URL(imageUrl);
  const filename = url.pathname.substring(1);
  const isTestData = isTestVendor(vendorId);
  const r2Bucket = isTestData ? process.env.R2_TEST_BUCKET_NAME : process.env.R2_BUCKET_NAME;

  if (!r2Bucket) throw new Error('No R2 bucket configured');

  console.debug(`Deleting image from R2 bucket: ${r2Bucket} with filename: ${filename}`);
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: filename }));
  } catch (error) {
    console.error('Error deleting image from R2:', error);
    // Don't throw error to avoid blocking vendor update
  }
}