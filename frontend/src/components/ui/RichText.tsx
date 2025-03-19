import { Block, BLOCKS, Inline, MARKS } from '@contentful/rich-text-types'
import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer'
import React from 'react'
import Link from 'next/link'
import ContentfulImage from '@/components/ui/ContentfulImage'
import { Box, Typography } from '@mui/material'
import { Content } from '@/features/blog/api/getBlogPosts'

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
        return <Typography variant='body1' gutterBottom>{children}</Typography>;
      },

      // [INLINES.ENTRY_HYPERLINK]: (node: Block | Inline) => {
      //   const entryId = node.data.target.sys.id;
      //   const entry = entryMap[entryId];

      //   if (!entry) {
      //     console.warn(`Entry hyperlink ${entryId} not found in entryMap`);
      //     return node.content?.[0]?.data?.[0]?.value || 'Link';
      //   }

      //   if (entry.__typename === 'Post') {
      //     return (
      //       <Link href={`/posts/${node.data.target.fields.slug}`}>
      //         {entry.title || node.content?.[0]?.data?.[0]?.value || 'Post link'}
      //       </Link>
      //     );
      //   }

      //   return node.content?.[0]?.data?.[0]?.value || 'Link';
      // },

      [BLOCKS.EMBEDDED_ENTRY]: (node: Block | Inline) => {
        const entryId = node.data.target.sys.id;
        const entry = entryMap[entryId];

        if (!entry) {
          console.warn(`Embedded entry ${entryId} not found in entryMap`);
          return <p>Content not available</p>;
        }
        const renderCaption = (description: string) => {
          // Check if the description contains source information
          if (description.includes('Source:')) {
            const [mainText, sourceInfo] = description.split('Source:');
            const sourceUrl = sourceInfo?.includes('www.') ?
              `https://${sourceInfo.trim().match(/www\.[^\s]+/)?.[0]}` :
              '#';

            return (
              <>
                {mainText}
                <Link
                  href={sourceUrl}
                >
                  Source
                </Link>
              </>
            );
          }

          // If no source information, just render the description
          return description;
        };

        // Handle different entry types based on __typename
        switch (entry.__typename) {
          case 'ComponentRichImage':
            const imageEntry = entry as ComponentRichImage;
            return (
              <Box paddingY={1} maxWidth='800px'>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '400px'
                  }}
                >
                  <ContentfulImage
                    src={imageEntry.image.url}
                    alt={imageEntry.caption || 'Embedded image'}
                    fill
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'center top'
                    }}
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                </Box>
                {imageEntry.image.description && (
                  <Typography variant="caption" component="figcaption" sx={{ mt: 1, textAlign: 'center', display: 'block' }}>
                    {renderCaption(imageEntry.image.description)}
                  </Typography>
                )}
              </Box>

            );
          default:
            return <p>Unknown entry type: {entry.__typename}</p>;
        }
      },

      [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline) => {
        const assetId = node.data.target.sys.id;
        const asset = assetMap[assetId];

        if (!asset) {
          console.warn(`Asset ${assetId} not found in assetMap`);
          return <p>Image not available</p>;
        }

        return (
          <ContentfulImage
            src={asset.url}
            width={asset.width || 800}
            height={asset.height || 600}
            alt={asset.title || 'Embedded image'}
            className='h-auto w-full'
          />
        );
      }
    }
  };

  return <>{documentToReactComponents(content?.json, options)}</>;
};

export default RichText;