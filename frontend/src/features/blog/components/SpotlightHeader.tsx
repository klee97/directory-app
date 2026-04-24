import ContentfulImage from '@/components/ui/ContentfulImage'
import { PageBlogPost } from '@/features/blog/api/getBlogPosts'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

const SpotlightHeader = ({ post }: { post: PageBlogPost }) => {
  const tags = (post.contentfulMetadata?.tags ?? []).filter(
    (t): t is NonNullable<typeof t> => t !== null && !!t.id && t.id !== 'featured'
  );

  return (
    <>
      {tags.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', pt: 3, mb: 1 }}>
          {tags.map((tag) => (
            <Chip key={tag.id} label={tag.name} size="small" color="primary" variant="outlined" />
          ))}
        </Box>
      )}
      <Typography paddingY={2} variant="h1" component="h1" align="center">
        {post.title}
      </Typography>
      <Typography variant="h6" paddingBottom={2} align="center">{post.shortDescription}</Typography>
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