import PasswordGate from '@/components/ui/PasswordGate';

type Props = { searchParams: Promise<{ redirectTo?: string }> };

export default async function BlogPreviewAuthPage({ searchParams }: Props) {
  const { redirectTo } = await searchParams;
  return <PasswordGate redirectTo={redirectTo ?? '/blog'} />;
}