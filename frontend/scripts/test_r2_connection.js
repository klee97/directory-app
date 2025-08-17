import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function testR2Connection() {
  console.log('🧪 Testing R2 connection...');
  
  try {
    // Test 1: List objects in bucket
    console.log('\n1. Testing bucket access...');
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });
    
    const listResult = await s3.send(listCommand);
    console.log('✅ Bucket access successful');
    console.log(`   Objects in bucket: ${listResult.Contents?.length || 0}`);

    // Test 2: Upload a test file
    console.log('\n2. Testing file upload...');
    const testContent = 'Hello from R2 test!';
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: 'test-file.txt',
      Body: testContent,
      ContentType: 'text/plain',
    });

    await s3.send(uploadCommand);
    console.log('✅ File upload successful');
    
    // Test 3: Generate public URL
    console.log('\n3. Testing public URL generation...');
    const publicUrl = `${process.env.R2_PUBLIC_URL}/test-file.txt`;
    console.log(`✅ Public URL: ${publicUrl}`);
    console.log('   Try accessing this URL in your browser');

    console.log('\n🎉 All tests passed! R2 is configured correctly.');
    console.log('\n📝 Next steps:');
    console.log('   1. Try accessing the public URL above');
    console.log('   2. If it works, you\'re ready to run the migration');
    console.log('   3. If not, check your custom domain DNS settings');

  } catch (error) {
    console.error('❌ R2 connection test failed:', error);
    
    if (error.name === 'CredentialsProviderError') {
      console.log('\n🔧 Check your environment variables:');
      console.log('   - R2_ACCESS_KEY_ID');
      console.log('   - R2_SECRET_ACCESS_KEY');
      console.log('   - CLOUDFLARE_ACCOUNT_ID');
    }
    
    if (error.name === 'NoSuchBucket') {
      console.log('\n🔧 Check your bucket name:');
      console.log('   - R2_BUCKET_NAME');
    }
  }
}

// Run the test
testR2Connection();