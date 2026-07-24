import { getAllPosts, getValidPosts } from "@/features/blog/api/getBlogPosts";
import { FEATURED_CATEGORIES } from "./BlogSection";
import { BlogPostCarousel } from "@/features/blog/components/BlogPostCarousel";

export async function BlogCarouselData() {
  const posts = await getAllPosts();
  const publishedPosts = getValidPosts(posts).sort(
    (a, b) => new Date(b.publishedDate!).getTime() - new Date(a.publishedDate!).getTime()
  );
  const selectedSlugs = new Set<string>();
  const recentPosts = FEATURED_CATEGORIES
    .map((category) => publishedPosts.find((post) => post.categoryList?.includes(category)))
    .filter((post): post is NonNullable<typeof post> => {
      if (!post || !post.slug || selectedSlugs.has(post.slug)) return false;
      selectedSlugs.add(post.slug);
      return true;
    });
  if (recentPosts.length === 0) return null;

  return <BlogPostCarousel posts={recentPosts} />;
}