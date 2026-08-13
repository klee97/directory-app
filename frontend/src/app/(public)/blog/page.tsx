import { ArticleTable } from '@/features/blog/components/ArticleTable';
import { getAllPosts, getValidPosts, PageBlogPost } from '@/features/blog/api/getBlogPosts';
import Scroll from '@/components/ui/Scroll';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Metadata } from 'next';
import { CollectionPage } from 'schema-dts';
import { jsonLdGraph, sanitizeJsonLdHtml } from '@/seo/jsonLdHtml';
import { ORG_ID, SITE_URL, WEBSITE_ID } from '@/seo/constants';

export const metadata: Metadata = {
  title: 'Wedding Planning Resources for Asian Couples | Asian Wedding Makeup',
  description: 'Tips, guides, and inspiration for Asian couples planning their wedding. From bridal beauty to cultural traditions.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Wedding Planning Resources for Asian Couples | Asian Wedding Makeup',
    description: 'Tips, guides, and inspiration for Asian couples planning their wedding. From bridal beauty to cultural traditions.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function BlogIndex() {
  const posts: PageBlogPost[] = await getAllPosts();
  const validPosts = getValidPosts(posts);

  const collectionPage: CollectionPage = {
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/blog#webpage`,
    "url": `${SITE_URL}/blog`,
    "name": "Wedding Planning Resources for Asian Couples",
    "description": "Tips, guides, and inspiration for Asian couples planning their wedding. From bridal beauty to cultural traditions.",
    "isPartOf": { "@id": WEBSITE_ID },
    "publisher": { "@id": ORG_ID },
    "mainEntity": {
      "@type": "ItemList",
      "@id": `${SITE_URL}/blog#postlist`,
      "itemListElement": validPosts
        .filter((post) => post.title != null && post.slug != null)
        .map((post, index) => ({
          "@type": "ListItem" as const,
          "position": index + 1,
          "url": `${SITE_URL}/blog/${post.slug}`,
          "name": post.title ?? undefined,
        })),
    },
  };

  const jsonLd = jsonLdGraph([collectionPage]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLdHtml(jsonLd) }}
      />
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
          <ArticleTable posts={validPosts} />
        </Box>
        <br />
        <Scroll showBelow={300} />
      </Container>
    </>
  );
}