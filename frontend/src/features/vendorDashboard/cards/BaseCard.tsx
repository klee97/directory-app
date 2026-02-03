import Box, { BoxProps } from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { ReactNode } from "react";

interface BaseCardProps extends Omit<BoxProps, 'title'> {
  title?: string;
  titleHref?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  hoverable?: boolean;
}

export default function BaseCard({
  title,
  titleHref,
  icon,
  action,
  children,
  hoverable = false,
  sx = {},
}: BaseCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        height: '100%',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ...(hoverable && {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
          }
        }),
        ...sx,
      }}
    >
      {(title || action) && (
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {icon && (
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                {icon}
              </Box>
            )}
            {title && (
              titleHref ? (
                <Link
                  href={titleHref}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom={false}
                    sx={{
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: 'primary.main',
                      }
                    }}
                  >
                    {title}
                  </Typography>
                </Link>
              ) : (
                <Typography variant="h5" component="h2" gutterBottom={false}>
                  {title}
                </Typography>
              )
            )}
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}