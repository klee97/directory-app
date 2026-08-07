import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LocationResult } from '@/types/location';
import { LocationStats } from '@/lib/location/computeLocationStats';

export function LocationFAQ({
  location,
  stats,
}: {
  location: LocationResult;
  stats: LocationStats;
}) {
  const faqs = [
    {
      q: `Are there makeup artists near ${location.display_name} who specialize in South Asian or Thai makeup?`,
      a: stats.southAsianMakeupCount || stats.thaiMakeupCount
        ? `Yes! Near ${location.display_name}, ${stats.southAsianMakeupCount} artist${stats.southAsianMakeupCount === 1 ? '' : 's'} specialize in South Asian makeup and ${stats.thaiMakeupCount} in Thai makeup, in addition to broader Asian-features expertise.`
        : `While specific Thai and South Asian makeup specialists near ${location.display_name} may be limited, all listed artists are recommended by the Asian diaspora community for experience with Asian skin tones and features.`,
    },
    {
      q: `How much do wedding makeup artists near ${location.display_name} charge?`,
      a: stats.priceRange
        ? `Bridal service prices near ${location.display_name} typically range from $${stats.priceRange.min} to $${stats.priceRange.max}, depending on the artist and services included.`
        : `Pricing varies by artist — contact vendors near ${location.display_name} directly for a quote.`,
    },
    {
      q: `Are the profiles of these makeup artists ${location.display_name} verified by the HMUAs?`,
      a: `${stats.verifiedCount} of the ${stats.vendorCount} artist${stats.vendorCount === 1 ? '' : 's'} listed near ${location.display_name} ${stats.verifiedCount === 1 ? 'has' : 'have'} been verified by the HMUA. Our team does its best to keep information up to date, but we cannot guarantee accuracy.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  };

  return (
    <Box sx={{ mt: 4 }} data-testid="location-faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Typography variant="h3" gutterBottom>Frequently Asked Questions</Typography>
      {faqs.map(({ q, a }) => (
        <Box key={q} sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>{q}</Typography>
          <Typography>{a}</Typography>
        </Box>
      ))}
    </Box>
  );
}