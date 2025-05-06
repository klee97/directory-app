import { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '@/features/blog/api/getBlogPosts';
import previewImage from '@/assets/website_preview.jpeg';
import Article from '@/features/blog/components/Article';
import Button from '@mui/material/Button';
import Spotlight from '@/features/blog/components/Spotlight';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post?.slug,
  }));
}

// This function runs at build time for paths returned by generateStaticParams
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: 'Post not found' };
  }
  if (!post) {
    return {
      title: "Post not found",
      description: "This blog post could not be found.",
    };
  }

  const fullUrl = `https://www.asianweddingmakeup.com/blog/${post.slug}`;
  const imageUrl = post.featuredImage?.url || previewImage.src;

  return {
    title: `${post.title} | Asian Wedding Makeup`,
    description: post.shortDescription ?? "Read more on our blog!",
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: post.title || "Asian Wedding Makeup Blog Post",
      description: post.shortDescription ?? "",
      url: fullUrl,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title || "Asian Wedding Makeup Blog Preview",
        }
      ],
      siteName: "Asian Wedding Makeup",
      publishedTime: post.publishedDate,
      authors: post.author?.name ? [post.author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title || "Asian Wedding Makeup Blog Post",
      description: post.shortDescription ?? "",
      images: [imageUrl],
    },
  };
}

// Page component - will be statically generated with the data
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  let jsonLd = {};
  
  // Check if post is scheduled for the future and we're in production
  const isFuturePost = post?.publishedDate && 
    new Date(post.publishedDate) > new Date() && 
    process.env.NODE_ENV === 'production';
  
  if (post && !isFuturePost) {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://www.asianweddingmakeup.com/blog/${slug}`
      },
      "headline": post.title,
      "description": post.shortDescription ?? "",
      "url": `https://www.asianweddingmakeup.com/blog/${slug}`,
      "datePublished": post.publishedDate,
      "author": {
        "@type": "Person",
        "name": post.author?.name ?? "Unknown",
        "image": post.author?.avatar?.url ? `https:${post.author.avatar.url}` : undefined
      },
      "publisher": {
        "@type": "Organization",
        "name": "Asian Wedding Makeup",
        "logo": {
          "@type": "ImageObject",
          "url": previewImage.src
        }
      },
      "image": post.featuredImage?.url ?? previewImage.src,
      "articleBody": post.content?.json ? post.content.json : ""
    };
  }
  const isSpotlight = post?.contentfulMetadata?.tags?.some(tag => tag?.id === "makeupArtistSpotlight");
  return (
    <>
      <section>
        {post && !isFuturePost && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </section>
      <Button variant="text" href="/blog" color='secondary'>
        ← Back
      </Button>
      {isFuturePost ? (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
            }}
          >
            <Typography variant="h2" component="h1" gutterBottom>
              Coming Soon!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              This post will be available on {new Date(post.publishedDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Container>
      ) : isSpotlight ? (
        <Spotlight post={post} />
      ) : (
        <Article post={post} />
      )}
    </>
  )
}