import { loadMarkdown } from '@/lib/markdown/loadMarkdown';
import MarkdownPage from '@/components/markdown/MarkdownPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendor Terms of Service | Asian Wedding Makeup',
  description: 'Read the terms and conditions governing your use of Asian Wedding Makeup\'s platform.',
  alternates: {
    canonical: '/vendor-terms',
  },
  openGraph: {
    title: 'Vendor Terms of Service | Asian Wedding Makeup',
    url: '/vendor-terms',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true, // discourage caching of potentially outdated terms versions
  },
}

export default function VendorTermsPage() {
  const content = loadMarkdown('vendor-terms');
  return (
    <MarkdownPage content={content} />
  );
} 