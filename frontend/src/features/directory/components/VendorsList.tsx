"use client";

import { useMemo } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
import { Vendor } from "@/types/vendor";

const VendorsList = ({ vendors }: { vendors: Vendor[] }) => {
  // Group vendors by location
  const groupedVendors = useMemo(() => {
    const groups = vendors.reduce((acc, vendor) => {
      const location = vendor.metro_region ?? "Other";
      if (!acc[location]) acc[location] = [];
      acc[location].push(vendor);
      return acc;
    }, {} as Record<string, Vendor[]>);
    // Sort locations alphabetically
    return Object.keys(groups)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = groups[key];
        return sorted;
      }, {} as Record<string, Vendor[]>);
  }, [vendors]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" gutterBottom >
        Browse Wedding Makeup Artists by Location
      </Typography>

      <Typography variant="h4" gutterBottom>
        Find makeup artists skilled with Asian wedding makeup in New York, Los Angeles, Toronto, and more.
      </Typography>

      <Typography variant="h4" gutterBottom>
        These artists know how to highlight your natural beauty on your wedding day, and they understand Asian features
        like monolids, olive undertones, and hair texture.
      </Typography>

      <br />

      {Object.entries(groupedVendors).map(([location, vendors]) => (
        <Box key={location} sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {location}
          </Typography>

          <Grid container spacing={2}>
            {vendors.map((vendor) => (
              <Grid key={vendor.slug} size={{ xs: 12, md: 4 }}>
                <Link href={`/vendors/${vendor.slug}`} style={{ textDecoration: "none", color: "inherit" }}>

                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6">
                        {vendor.business_name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>

              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );
};

export default VendorsList;
