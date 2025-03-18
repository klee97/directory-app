import { Typography, Card, CardContent, CardMedia, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { getAllPosts } from '@/features/blog/api/getBlogPosts';
import Link from 'next/link';
import ContentfulImage from '@/components/ui/ContentfulImage';

export async function ArticleTable() {
  const posts = await getAllPosts();
  const validPosts = posts.filter(post => post !== null && post !== undefined);

  return (
    <Grid container spacing={2}>
      {validPosts.map((post) => (
        <Grid key={post.slug} size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
          <Link href={`/blog/${post.slug}`} passHref style={{ textDecoration: 'none', display: 'block' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {post.featuredImage && (
                <Box sx={{ position: 'relative', height: '300px', width: '100%' }}>
                  <ContentfulImage
                    alt={`Cover Image for ${post.featuredImage.title}`}
                    src={post.featuredImage.url}
                    fill
                    style={{
                      objectFit: 'cover', objectPosition: 'center top'
                    }}
                    sizes="(max-width: 600px) 100vw, 600px"
                  />
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {post.shortDescription}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  )
}