import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Typography, Box, Link, Toolbar } from '@mui/material';

export default function MarkdownPage({ content }: { content: string }) {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, py: 4 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography variant="h3" gutterBottom sx={{ mt: 4 }}>
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
              {children}
            </Typography>
          ),
          p: ({ children }) => (
            <Typography component={"p"} gutterBottom>
              {children}
            </Typography>
          ),
          a: ({ href, children }) => (
            <Link href={href}>{children}</Link>
          ),
          li: ({ children }) => (
            <li>
              <Typography component="span">
                {children}
              </Typography>
            </li>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}
