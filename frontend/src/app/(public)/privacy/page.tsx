import { loadMarkdown } from '@/lib/markdown/loadMarkdown';
import MarkdownPage from '@/components/markdown/MarkdownPage';

export const metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  const content = loadMarkdown('privacy');
  return (
    <MarkdownPage content={content} />
  );
}