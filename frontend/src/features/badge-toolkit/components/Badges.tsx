'use client'

import { useParams } from 'next/navigation'
import { Typography, Box, Button, TextField, Card, CardContent, CircularProgress } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useEffect, useState } from 'react'
import { fetchVendorBySlug } from '@/features/badge-toolkit/api/fetchVendor'

export function Badges() {
  const { slug } = useParams()
  const [copied, setCopied] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = 'https://www.asianweddingmakeup.com';
  const vendorUrl = `${baseUrl}/vendors/${slug}`;

  useEffect(() => {
    async function loadVendor() {
      if (!slug) return;
      const result = await fetchVendorBySlug(slug as string);
      setVendorId(result);
      setLoading(false);
    }
    loadVendor();
  }, [slug]);

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!vendorId) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h2">Artist not found</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          We could not find a badge toolkit for this artist. Please check the URL or contact us for assistance.
        </Typography>
      </Box>
    );
  }

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
    <Box>
      <Typography variant="h1" gutterBottom>
        Your Badge Toolkit
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        As a featured vendor, you can proudly display these badges on your website.
        It&apos;s also a great way to support our directory!
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        For more information about how to embed badges, check out our <a href="#guides">guides</a> at the bottom of the page.
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
      <br />

      <Box my={3} id="guides">
        <Typography variant="h2" my={2}>
          How to Embed Badges
        </Typography>
        <Typography variant="body1" my={2}>
          Click on &quot;Copy Code&quot; for the desired badge above. Then follow these instructions for different website builders.
        </Typography>
        {[
          {
            title: 'Squarespace',
            steps: [
              '1. Log into your Squarespace site.',
              '2. Go to the page where you want the badge.',
              '3. Click "Edit" on the section.',
              '4. Click the "+" icon and choose "Code".',
              '5. Paste the copied badge code into the box.',
              '6. Click "Apply", then "Save" the page.',
              '7. (Optional) You can also add the badge to your footer if you want it on every page!'
            ]
          },
          {
            title: 'Wix',
            steps: [
              '1. Log into Wix and open the Editor.',
              '2. Click "Add Elements" → "Embed Code" → "Popular Embeds" → "Embed HTML".',
              '3. Paste the copied badge code into the box.',
              '4. Drag and place it where you’d like it.',
              '5. Click "Publish" to go live.',
            ],
          },
          {
            title: 'WordPress (Gutenberg Editor)',
            steps: [
              '1. Add a new "Custom HTML" block.',
              '2. Paste the copied badge code.',
              '3. Click "Preview" to check it.',
              '4. Click "Publish".',
            ],
          },
        ].map((section) => (
          <Box key={section.title} mb={4}>
            <Typography variant='h3' style={{ fontWeight: 600 }}>{section.title}</Typography>

            {section.steps.map((step, i) => (
              <Typography variant="body1" key={i}>{step}</Typography>
            ))}
          </Box>
        ))}
      </Box>


      <Box mt={4}>
        <Typography variant="body1">
          Need help? Shoot us an email and we&apos;ll walk you through it!
        </Typography>
      </Box>
    </Box>
  );
}