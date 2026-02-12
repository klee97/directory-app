import { loadMarkdown } from '@/lib/markdown/loadMarkdown';
import MarkdownPage from '@/components/markdown/MarkdownPage';

export const metadata = {
  title: 'Vendor Terms of Service',
};

export default function VendorTermsPage() {
  const content = loadMarkdown('vendor-terms');
  return (
    <MarkdownPage content={content} />
  );
} 