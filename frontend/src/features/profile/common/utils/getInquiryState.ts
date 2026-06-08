export type InquiryState = 'opted_out' | 'verified' | 'unclaimed';

export const getInquiryState = (inquiriesOptedOutAt: string | null, verifiedAt: string | null): InquiryState => {
  if (inquiriesOptedOutAt) return 'opted_out';
  if (verifiedAt) return 'verified';
  return 'unclaimed';
};
