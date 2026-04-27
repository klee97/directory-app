import Avatar from '@/components/ui/Avatar'
import ContentfulImage from '@/components/ui/ContentfulImage'
import { PageBlogPost } from '@/features/blog/api/getBlogPosts'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { renderCaption } from '@/components/ui/RichText'
import { getPostLabels } from './postLabels'

const PostHeader = ({ post }: { post: PageBlogPost }) => {
  const labels = getPostLabels(post);

  return (
    <>
      {post.featuredImage?.url && (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: '100%' }}>
          <Box sx={{ position: 'relative', aspectRatio: '4 / 3', width: '100%', maxHeight: { xs: '300px', md: '430px' }, mb: 1 }}>
            <ContentfulImage
              alt={`Cover Image: ${post.featuredImage.title}`}
              src={post.featuredImage.url}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              style={{
                objectPosition: 'center',
                objectFit: 'cover',
              }}
            />
          </Box>
          {post.featuredImage.description &&
            <Typography variant="caption" component="figcaption">
              {renderCaption(post.featuredImage.description)}
            </Typography>
          }
        </Box>
      )}

      {labels.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 3, mb: 1 }}>
          {labels.map((label) => (
            <Chip key={label} label={label} size="small" color="primary" variant="outlined" />
          ))}
        </Box>
      )}

      <Typography paddingTop={labels.length > 0 ? 1 : 3} variant="h2" component="h1">
        {post.title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {post.author?.avatar?.url && (
          <Avatar src={post.author?.avatar?.url} name={post.author?.name ?? ''} />
        )}
        <Typography variant="subtitle1">
          {post.author?.name} • {new Date(post.publishedDate).toLocaleDateString()}
        </Typography>
      </Box>
      <Typography variant="h6" color={'secondary'} fontWeight={600} gutterBottom>{post.shortDescription}</Typography>
    </>
  )
}

export default PostHeader
