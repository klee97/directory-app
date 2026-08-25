import { Metadata } from 'next';
import { getPostBySlug } from '@/features/blog/api/getBlogPosts';
import { isPublishedInEasternTime } from '@/lib/dateUtils';
import Article from '@/features/blog/components/Article';
import Scroll from '@/components/ui/Scroll';
import BackToBlogsButton from '@/components/ui/BackToBlogsButton';
import Spotlight from '@/features/blog/components/Spotlight';
import { graphQLClient } from '@/lib/contentful/graphqlClient';
import { GetAllBlogPostsDocument, GetAllBlogPostsQuery } from '@/lib/generated/graphql';
import { ORG_ID, PHOTO_WEBSITE_PREVIEW_URL, SITE_URL } from '@/seo/constants';
import { richTextToPlainText } from '@/seo/articlePlaintext';
import { jsonLdGraph, sanitizeJsonLdHtml } from '@/seo/jsonLdHtml';
import { BlogPosting } from 'schema-dts';
import { notFound } from 'next/dist/client/components/navigation';
import ReactDOM from 'react-dom';
import { CONTENTFUL_ASSET_ORIGIN } from '@/lib/contentful/constants';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { pageBlogPostCollection } = await graphQLClient.request<GetAllBlogPostsQuery>(GetAllBlogPostsDocument);
  const posts = pageBlogPostCollection?.items || [];
  return posts
    .filter(post => post && isPublishedInEasternTime(post.publishedDate))
    .map(post => ({ slug: post?.slug }));
}

// This function runs at build time for paths returned by generateStaticParams
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return {
      title: "Post not found",
      description: "This blog post could not be found.",
    };
  }

  const isFuture = !isPublishedInEasternTime(post.publishedDate);
  const fullUrl = `${SITE_URL}/blog/${post.slug}`;
  const imageUrl = post.featuredImage?.url || PHOTO_WEBSITE_PREVIEW_URL;

  return {
    title: `${post.title} | Asian Wedding Makeup`,
    description: post.shortDescription ?? "Read more on our blog!",
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: `${post.title} | Asian Wedding Makeup`,
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
      publishedTime: post.publishedDate ?? undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title || "Asian Wedding Makeup Blog Post",
      description: post.shortDescription ?? "",
      images: [imageUrl],
    },
    ...(isFuture && {
      robots: { index: false, follow: false },
    }),
  };
}

// Page component - will be statically generated with the data
export default async function BlogPostPage({ params }: Props) {
  // Preconnect to the image CDN
  ReactDOM.preconnect(CONTENTFUL_ASSET_ORIGIN);

  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  let jsonLd = {};

  if (post) {
    const blogPosting: BlogPosting = {
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${SITE_URL}/blog/${slug}`
      },
      "headline": post.title ?? "",
      "description": post.shortDescription ?? "",
      "url": `${SITE_URL}/blog/${slug}`,
      "datePublished": post.publishedDate ?? undefined,
      "author": {
        "@type": "Person",
        "name": post.author?.name ?? "Unknown",
        "image": post.author?.avatar?.url ? `https:${post.author.avatar.url}` : undefined
      },
      "isPartOf": {
        "@id": `${SITE_URL}/blog#webpage`
      },
      "publisher": {
        "@id": ORG_ID
      },
      "image": post.featuredImage?.url ?? PHOTO_WEBSITE_PREVIEW_URL,
      "articleBody": richTextToPlainText(post.content?.json)
    };

    jsonLd = jsonLdGraph([blogPosting]);

    const isSpotlight = post?.contentfulMetadata?.tags?.some(tag => tag?.id === "makeupArtistSpotlight");
    return (
      <>
        <section>
          {post && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: sanitizeJsonLdHtml(jsonLd) }}
            />
          )}
        </section>
        <BackToBlogsButton />
        {isSpotlight ? (
          <Spotlight post={post} />
        ) : (
          <Article post={post} />
        )}
        <Scroll showBelow={300} />
      </>
    )
  }
}