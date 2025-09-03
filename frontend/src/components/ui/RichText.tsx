import { Block, BLOCKS, Inline, INLINES, MARKS } from '@contentful/rich-text-types'
import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer'
import ContentfulImage from '@/components/ui/ContentfulImage'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import { Content } from '@/features/blog/api/getBlogPosts'
import Link from '@mui/material/Link'
// Define types for the GraphQL response
interface ContentfulAsset {
  sys: {
    id: string;
  };
  url: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

interface ComponentRichImage {
  sys: {
    id: string;
  };
  __typename: 'ComponentRichImage';
  caption: string;
  image: {
    url: string;
    description: string;
    width: number;
    height: number
  }
}

// Union type for different entry types
type ContentfulEntry = ComponentRichImage | {
  sys: {
    id: string;
  };
  __typename: string;
  [key: string]: unknown;
};

interface RichTextProps {
  content: Content;
}

export function renderCaption(description: string) {
  // Check if the description contains source information
  if (description.includes('Source:')) {
    const [mainText, sourceInfo] = description.split('Source:');
    const urlMatch = sourceInfo?.trim().match(/(?:https?:\/\/)?([^\s]+)/);
    const sourceUrl = urlMatch ? `https://${urlMatch[1]}` : '#';

    return (
      <>
        {mainText}
        <Link href={sourceUrl} color="primary" target="_blank" rel="noopener noreferrer">
          Source
        </Link>
      </>
    );
  }
  // If no source information, just render the description
  return description;
}

interface GridNode {
  nodeType: 'grid';
  content: (Block | Inline)[];
}

const RichText: React.FC<RichTextProps> = ({ content }) => {
  // Create maps for easy asset/entry lookup by ID
  const assetMap: Record<string, ContentfulAsset> = {};
  const entryMap: Record<string, ContentfulEntry> = {};

  // Map assets by ID
  if (content?.links?.assets?.block) {
    content.links.assets.block.forEach((asset) => {
      if (asset) {
        assetMap[asset.sys.id] = asset as ContentfulAsset;
      }
    });
  }

  // Map entries by ID
  if (content?.links?.entries?.block) {
    content.links.entries.block.forEach((entry) => {
      if (entry) {
        entryMap[entry.sys.id] = entry as ContentfulEntry;
      }
    });
  }

  const isImageBlock = (block: Block | Inline) => {
    return block.nodeType === BLOCKS.EMBEDDED_ENTRY || block.nodeType === BLOCKS.EMBEDDED_ASSET;
  };

  const renderImage = (node: Block | Inline) => {
    if (node.nodeType === BLOCKS.EMBEDDED_ENTRY) {
      const entryId = node.data.target.sys.id;
      const entry = entryMap[entryId];

      if (!entry) {
        console.warn(`Embedded entry ${entryId} not found in entryMap`);
        return <p>Content not available</p>;
      }

      if (entry.__typename === 'ComponentRichImage') {
        const imageEntry = entry as ComponentRichImage;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '400px',
                my: 2
              }}
            >
              <ContentfulImage
                src={imageEntry.image.url}
                alt={imageEntry.caption || 'Embedded image'}
                fill
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center bottom'
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </Box>
            {imageEntry.image.description && (
              <Typography variant="caption" component="figcaption" sx={{ textAlign: 'center' }}>
                {renderCaption(imageEntry.image.description)}
              </Typography>
            )}
          </Box>
        );
      }
    } else if (node.nodeType === BLOCKS.EMBEDDED_ASSET) {
      const assetId = node.data.target.sys.id;
      const asset = assetMap[assetId];

      if (!asset) {
        console.warn(`Asset ${assetId} not found in assetMap`);
        return <p>Image not available</p>;
      }

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '300px'
            }}
          >
            <ContentfulImage
              src={asset.url}
              alt={asset.title || 'Embedded image'}
              fill
              style={{
                objectFit: 'contain',
                objectPosition: 'center bottom'
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Box>
        </Box>
      );
    }
    return null;
  };

  const options: Options = {
    renderMark: {
      [MARKS.CODE]: (text: React.ReactNode) => {
        return (
          <pre>
            <code>{text}</code>
          </pre>
        );
      }
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_node: Block | Inline, children: React.ReactNode) => {
        return <Typography variant='body1' sx={{ py: 2 }}>{children}</Typography>;
      },

      [BLOCKS.EMBEDDED_ENTRY]: (node: Block | Inline) => {
        const entryId = node.data.target.sys.id;
        const entry = entryMap[entryId];

        if (!entry) {
          console.warn(`Embedded entry ${entryId} not found in entryMap`);
          return <p>Content not available</p>;
        }

        // Handle different entry types based on __typename
        switch (entry.__typename) {
          case 'ComponentRichImage':
            return renderImage(node);
          default:
            return <p>Unknown entry type: {entry.__typename}</p>;
        }
      },

      [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline) => {
        return renderImage(node);
      },

      [INLINES.HYPERLINK]: (node, children) => {
        const url = node.data.uri;
        return (
          <Link href={url} color="primary" target="_blank" rel="noopener noreferrer">
            {children}
          </Link>
        );
      }
    }
  };

  // Process content to group consecutive images
  const processContent = (content: Content) => {
    if (!content?.json?.content) return null;

    const blocks = content.json.content;
    const processedBlocks = [];
    let currentImageGroup = [];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      if (isImageBlock(block)) {
        currentImageGroup.push(block);

        // If this is the last block or next block is not an image, render the group
        if (i === blocks.length - 1 || !isImageBlock(blocks[i + 1])) {
          if (currentImageGroup.length > 1) {
            // Render multiple images in a grid
            processedBlocks.push({
              nodeType: 'grid',
              content: currentImageGroup
            });
          } else {
            // Render single image
            processedBlocks.push(currentImageGroup[0]);
          }
          currentImageGroup = [];
        }
      } else {
        processedBlocks.push(block);
      }
    }

    return {
      ...content.json,
      content: processedBlocks
    };
  };

  const processedContent = processContent(content);

  return (
    <Box>
      {documentToReactComponents(processedContent, {
        ...options,
        renderNode: {
          ...options.renderNode,
          grid: (node: unknown) => {
            const gridNode = node as GridNode;
            return (
              <Grid container spacing={1} sx={{ my: 4 }}>
                {gridNode.content.map((block: Block | Inline, index: number) => (
                  <Grid key={index} size={{ xs: 12, md: 6 }}>
                    {renderImage(block)}
                  </Grid>
                ))}
              </Grid>
            );
          }
        }
      })}
    </Box>
  );
};

export default RichText;