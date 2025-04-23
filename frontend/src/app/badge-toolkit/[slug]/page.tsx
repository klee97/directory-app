'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Button, TextField, Card, CardContent } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useState } from 'react'

export default function VendorBadgeToolkit() {
  const { slug } = useParams()
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = 'https://www.asianweddingmakeup.com';
  const vendorUrl = `${baseUrl}/vendors/${slug}`;

  const badges = [
    {
      id: 'rectangle',
      label: 'Recommended Artist — Rectangle',
      imageUrl: `/badges/recommended-rectangle.svg`,
      embedCode: `<a href="${vendorUrl}" target="_blank" rel="noopener"><img src="${baseUrl}/badges/recommended-rectangle.svg" alt="Asian Wedding Makeup Recommended Artist" width="300"/></a>`,
    },
    {
      id: 'circle',
      label: 'Recommended Artist – Circle',
      imageUrl: `/badges/recommended-circle.svg`,
      embedCode: `<a href="${vendorUrl}" target="_blank" rel="noopener"><img src="${baseUrl}/badges/recommended-circle.svg" alt="Asian Wedding Makeup Recommended Artist" width="200"/></a>`,
    },
    {
      id: 'award',
      label: 'Recommended Artist – Award',
      imageUrl: `/badges/recommended-award.svg`,
      embedCode: `<a href="${vendorUrl}" target="_blank" rel="noopener"><img src="${baseUrl}/badges/recommended-circle.svg" alt="Asian Wedding Makeup Recommended Artist" width="200"/></a>`,
    },
  ];
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h1" gutterBottom>
        Your Badge Toolkit
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        As a featured vendor, you can proudly display these badges on your website and link visitors directly to your profile.
        It&apos;s also a great way to support our directory!
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        We&apos;ve provided options to download badge images for your socials, or to embed the code in your own website.
        For more information about how to embed badges, checkout these guides: 
      </Typography>

      <Grid container spacing={4}>
        {badges.map((badge) => (
          <Grid size={16} key={badge.id}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={6} display="flex" flexDirection="column" alignItems="center">
                    <Box
                      component="img"
                      src={badge.imageUrl}
                      alt={badge.label}
                      sx={{
                        width: '100%',
                        maxWidth: 300,
                        mb: 2
                      }}
                    />
                    <Button
                      href={badge.imageUrl}
                      target="_blank"
                      rel="noopener"
                      variant="contained"
                      size="medium"
                      download={badge.imageUrl}
                      sx={{
                        minWidth: 180,
                        maxWidth: 220
                      }}
                    >
                      DOWNLOAD IMAGE
                    </Button>
                  </Grid>
                  <Grid size={6} display="flex" flexDirection="column">
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }} sx={{ mb: 1, pl: 1 }}>
                      Embed Code
                    </Typography>
                    <TextField
                      multiline
                      size="small"
                      value={badge.embedCode}
                      sx={{ 
                        mb: 2,
                        '& .MuiInputBase-input': {
                          fontFamily: 'monospace'
                        }
                      }}
                      slotProps={{
                        input: {
                          readOnly: true
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleCopy(badge.embedCode, badge.id)}
                      variant="contained"
                      size="medium"
                      sx={{
                        minWidth: 180,
                        alignSelf: "center"
                      }}
                    >
                      {copied === badge.id ? 'COPIED!' : 'COPY CODE'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
