import Avatar from '@/components/ui/Avatar'
import ContentfulImage from '@/components/ui/ContentfulImage'
import { PageBlogPost } from '../api/getBlogPosts'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { renderCaption } from '@/components/ui/RichText'

const PostHeader = ({ post }: { post: PageBlogPost }) => {

  return (
    <>

      {post.featuredImage?.url && (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ position: 'relative', height: '500px', width: '100%', mb: 1 }}>
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


      <Typography paddingTop={3} variant="h3" component="h1">
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
      <Typography variant="h6" color={'secondary'} gutterBottom>{post.shortDescription}</Typography>


    </>
  )
}

export default PostHeader