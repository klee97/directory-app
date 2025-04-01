import ContentfulImage from '@/components/ui/ContentfulImage'
import { PageBlogPost } from '../api/getBlogPosts'
import { Box, Typography } from '@mui/material'

const SpotlightHeader = ({ post }: { post: PageBlogPost }) => {

  return (
    <>
      <Typography paddingY={3} variant="h1" component="h1">
        {post.title}
      </Typography>
      <Typography variant="h6" paddingBottom={2}>{post.shortDescription}</Typography>
      {post.featuredImage?.url && (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ 
            position: 'relative', 
            height: '600px', 
            width: '100%', 
            maxWidth: '500px', // Limit width for portrait photos
            margin: '0 auto' // Center the container
          }}>
            <ContentfulImage
              alt={`Cover Image: ${post.featuredImage.title}`}
              src={post.featuredImage.url}
              fill
              priority
              sizes="(max-width: 500px) 100vw, 500px"
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