import { loadMarkdown } from '@/lib/markdown/loadMarkdown';
import MarkdownPage from '@/components/markdown/MarkdownPage';

export const metadata = {
  title: 'User Terms of Service',
};

export default function UserTermsPage() {
  const content = loadMarkdown('user-terms');
  return (
    <MarkdownPage content={content} />
  );
}