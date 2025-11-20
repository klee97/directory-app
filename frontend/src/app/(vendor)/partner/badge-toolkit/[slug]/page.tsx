'use client'

import Container from '@mui/material/Container'
import { Badges } from '@/features/badge-toolkit/components/Badges'
import { Toolbar } from '@mui/material'

export default function VendorBadgeToolkit() {

  return (
    <>
      <Toolbar />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Badges />
      </Container>
    </>
  )
}
