import { loadMarkdown } from '@/lib/markdown/loadMarkdown';
import MarkdownPage from '@/components/markdown/MarkdownPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Terms of Service | Asian Wedding Makeup',
  description: 'Read the terms and conditions governing your use of Asian Wedding Makeup\'s platform.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'User Terms of Service | Asian Wedding Makeup',
    url: '/terms',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true, // discourage caching of potentially outdated terms versions
  },
}

export default function UserTermsPage() {
  const content = loadMarkdown('user-terms');
  return (
    <MarkdownPage content={content} />
  );
}