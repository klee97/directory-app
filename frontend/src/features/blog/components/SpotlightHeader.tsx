import ContentfulImage from '@/components/ui/ContentfulImage'
import { PageBlogPost } from '@/features/blog/api/getBlogPosts'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const SpotlightHeader = ({ post }: { post: PageBlogPost }) => {

  return (
    <>
      <Typography paddingY={3} variant="h1" component="h1" align="center">
        {post.title}
      </Typography>
      <Typography variant="h6" paddingBottom={2} align="center">{post.shortDescription}</Typography>
      {post.featuredImage?.url && (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: '100%', mb: 4 }}>
          <Box sx={{
            position: 'relative',
            aspectRatio: '4 / 3',
            width: '100%',
            maxHeight: { xs: '400px', md: '600px' },
            mb: 4
          }}>
            <ContentfulImage
              alt={`Cover Image: ${post.featuredImage.title}`}
              src={post.featuredImage.url}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              style={{
                objectPosition: 'center top', // Focus on the top portion
                objectFit: 'cover',
              }}
            />
          </Box>
        </Box>
      )}
    </>
  )
}

export default SpotlightHeader;