import { apiSuccess } from '@/lib/api/respond';
import { getTags } from '@/features/profile/common/api/getTags';

export async function GET() {
  const tags = await getTags();
  return apiSuccess(tags);
}