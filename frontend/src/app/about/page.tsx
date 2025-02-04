import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import NextLink from 'next/link';

export default function About() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          About Us
        </Typography>
        <Typography variant="body1" component="p">
        As two Asian American women, we understand how overwhelming wedding planning can be—especially when you're straddling the line between different cultures. 
        </Typography>
        <Typography variant="body1" component="p">
        We're building this directory to help Asian couples find artists who are recommended within their local communities.
        We're asking our friends and family, scouring the web, and looking through Reddit and Facebook, so you don't have to.
        The artists here are people who other couples have recommended, and we're excited to share their knowledge with you.
        </Typography>
        <Typography variant="body1" component="p">
          Whether you’re a vendor looking to showcase your work or a couple planning your big day, we’re here to help.
        </Typography>
        <Box sx={{ maxWidth: 'sm' }}>
          <Button variant="contained" component={NextLink} href="/">
            Go to the directory
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
