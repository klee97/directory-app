import { ArticleTable } from '@/features/blog/components/ArticleTable';
import Scroll from '@/components/ui/Scroll';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Planning Resources for Asian Couples | Asian Wedding Makeup',
  description: 'Tips, guides, and inspiration for Asian couples planning their wedding. From bridal beauty to cultural traditions.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Wedding Planning Resources for Asian Couples | Asian Wedding Makeup',
    description: 'Tips, guides, and inspiration for Asian couples planning their wedding. From bridal beauty to cultural traditions.',
    url: '/blog',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function BlogIndex() {

  return (
    <Container maxWidth="lg">
      <br />
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'left',
          '& > p': { marginBottom: 2 },
        }}
      >
        <ArticleTable />

      </Box>
      <br />
      <Scroll showBelow={300} />
    </Container>

  );
}