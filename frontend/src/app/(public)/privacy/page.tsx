import { loadMarkdown } from '@/lib/markdown/loadMarkdown';
import MarkdownPage from '@/components/markdown/MarkdownPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Asian Wedding Makeup collects, uses, and protects your personal data.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Asian Wedding Makeup',
    description: 'Learn how Asian Wedding Makeup collects, uses, and protects your personal data.',
    url: '/privacy',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true, // discourage caching of potentially outdated policy versions
  },
};

export default function PrivacyPage() {
  const content = loadMarkdown('privacy');
  return (
    <MarkdownPage content={content} />
  );
}