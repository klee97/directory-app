import { getAllPosts, getValidPosts } from "@/features/blog/api/getBlogPosts";
import { FEATURED_CATEGORIES } from "./BlogSection";
import { BlogPostCarousel } from "@/features/blog/components/BlogPostCarousel";

export async function BlogCarouselData() {
  const posts = await getAllPosts();
  const publishedPosts = getValidPosts(posts).sort(
    (a, b) => new Date(b.publishedDate!).getTime() - new Date(a.publishedDate!).getTime()
  );

  const recentPosts = FEATURED_CATEGORIES
    .map((category) => publishedPosts.find((post) => post.categoryList?.includes(category)))
    .filter((post): post is NonNullable<typeof post> => post != null);

  if (recentPosts.length === 0) return null;

  return <BlogPostCarousel posts={recentPosts} />;
}