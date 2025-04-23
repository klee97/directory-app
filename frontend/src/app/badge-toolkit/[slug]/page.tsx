'use client'

import { Container, Typography, Box } from '@mui/material'
import { Badges } from '@/features/badge-toolkit/components/Badges'

export default function VendorBadgeToolkit() {

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Badges/>
    </Container>
  )
}
