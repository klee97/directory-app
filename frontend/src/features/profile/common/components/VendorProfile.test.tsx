import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VendorProfile from '@/features/profile/common/components/VendorProfile';
import { Vendor } from '@/types/vendor';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ isLoggedIn: false }),
}));

vi.mock('@/features/favorites/api/getUserFavorites', () => ({
  getFavoriteVendorIds: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/env/env', () => ({
  isClaimProfileEnabled: () => false,
}));

// Imports a server action that builds the Supabase admin client at module load.
vi.mock('@/features/vendorClaim/components/ManageProfilePrompt', () => ({
  default: () => null,
}));

vi.mock('@/features/contact/components/LeadCaptureForm', () => ({
  default: () => <div data-testid="lead-capture-form" />,
}));

// Pretend the viewport is below MUI's `md` breakpoint, i.e. the stacked layout.
function setStackedLayout(isStacked: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isStacked && query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

let observerCallback: IntersectionObserverCallback | null = null;

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn();
}

// Simulate where the inline contact card sits relative to the viewport.
function positionContactCard(position: 'below' | 'visible' | 'above') {
  const entry = {
    isIntersecting: position === 'visible',
    boundingClientRect: { top: position === 'below' ? 2000 : position === 'visible' ? 300 : -500 },
  } as IntersectionObserverEntry;
  act(() => {
    observerCallback?.([entry], {} as IntersectionObserver);
  });
}

const baseVendor = {
  id: 'vendor-1',
  business_name: 'Glam by Jane',
  slug: 'glam-by-jane',
  email: null,
  website: null,
  instagram: null,
  google_maps_place: null,
  region: null,
  city: 'Boston',
  state: 'MA',
  country: 'United States',
  metro: null,
  metro_region: null,
  travels_world_wide: false,
  bridal_hair_price: null,
  bridal_makeup_price: null,
  bridesmaid_hair_price: null,
  bridesmaid_makeup_price: null,
  bridal_hair_makeup_price: null,
  bridesmaid_hair_makeup_price: null,
  gis: null,
  profile_image: null,
  description: 'About Jane',
  latitude: null,
  longitude: null,
  inquiries_opted_out_at: null,
  verified_at: '2026-01-01T00:00:00Z',
  testimonials: [],
  tags: [],
  images: [],
  cover_image: null,
  is_premium: false,
} as unknown as Vendor;

const getBar = () => screen.queryByTestId('mobile-contact-bar');

describe('VendorProfile mobile contact bar', () => {
  beforeEach(() => {
    observerCallback = null;
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  it('shows the bar only while the inline contact card is below the viewport', async () => {
    setStackedLayout(true);
    render(<VendorProfile vendor={baseVendor} vendorDescription="About Jane" />);

    positionContactCard('below');
    expect(getBar()).toBeVisible();

    // Slide sets `visibility: hidden` once its exit transition finishes.
    positionContactCard('visible');
    await waitFor(() => expect(getBar()).not.toBeVisible());

    positionContactCard('below');
    await waitFor(() => expect(getBar()).toBeVisible());

    positionContactCard('above');
    await waitFor(() => expect(getBar()).not.toBeVisible());
  });

  it('opens the quote form from the bar', async () => {
    setStackedLayout(true);
    render(<VendorProfile vendor={baseVendor} vendorDescription="About Jane" />);
    positionContactCard('below');

    const barButton = screen.getAllByRole('button', { name: 'Get a Quote' })
      .find((button) => getBar()?.contains(button));
    await userEvent.click(barButton!);

    expect(await screen.findByTestId('lead-capture-form')).toBeInTheDocument();
  });

  it('is not rendered on the side-by-side desktop layout', () => {
    setStackedLayout(false);
    render(<VendorProfile vendor={baseVendor} vendorDescription="About Jane" />);
    expect(getBar()).not.toBeInTheDocument();
  });

  it('is not rendered when disabled for embedded previews', () => {
    setStackedLayout(true);
    render(<VendorProfile vendor={baseVendor} vendorDescription="About Jane" showMobileContactBar={false} />);
    expect(getBar()).not.toBeInTheDocument();
  });

  it('is not rendered when the vendor has opted out of inquiries', () => {
    setStackedLayout(true);
    render(
      <VendorProfile
        vendor={{ ...baseVendor, inquiries_opted_out_at: '2026-02-01T00:00:00Z' }}
        vendorDescription="About Jane"
      />
    );
    expect(getBar()).not.toBeInTheDocument();
  });
});
