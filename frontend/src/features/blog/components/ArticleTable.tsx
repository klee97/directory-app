import { Typography, Card, CardContent, CardMedia } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { getAllPosts } from '@/features/blog/api/getBlogPosts';
import Link from 'next/link';

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
                <CardMedia
                  component="img"
                  height="200"
                  sx={{ objectFit: 'cover' }}
                  src={post.featuredImage?.url ?? ''}
                  alt={post.title ?? ''}
                />
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