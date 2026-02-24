"use client";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import NextLink from 'next/link';

export default function MarkdownContent({ content }: { content: string }) {
  return (
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
          <Typography component={"div"} gutterBottom>
            {children}
          </Typography>
        ),
        a: ({ href = '', children }) => {
          const isExternal = href.startsWith('http');

          const linkStyles = {
            fontWeight: 500, // slightly bold (normal is 400)
            textDecoration: 'underline',
          };

          if (isExternal) {
            return (
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                sx={linkStyles}
              >
                {children}
              </Link>
            );
          }

          return (
            <Link
              component={NextLink}
              href={href}
              sx={linkStyles}
            >
              {children}
            </Link>
          );
        },
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
  );
}
