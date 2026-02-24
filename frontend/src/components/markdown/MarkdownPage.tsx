import Box from '@mui/material/Box';
import MarkdownContent from './MarkdownContent';

export default function MarkdownPage({ content }: { content: string }) {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, py: 4 }}>
      <MarkdownContent content={content} />
    </Box>
  );
}
