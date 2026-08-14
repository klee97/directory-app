import PasswordGate from '@/components/ui/PasswordGate';
import { safeRedirectTarget } from '@/lib/blogPreview/guardBlogPreview';

type Props = { searchParams: Promise<{ redirectTo?: string }> };

export default async function BlogPreviewAuthPage({ searchParams }: Props) {
  const { redirectTo } = await searchParams;
  const { pathname, search } = safeRedirectTarget(redirectTo);
  return <PasswordGate redirectTo={pathname + search} />;
}