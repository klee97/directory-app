import Airtable from "airtable";

export const leadsBase = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN! }).base(process.env.AIRTABLE_APP_ID!);
export const feedbackBase = new Airtable({ apiKey: process.env.AIRTABLE_FEEDBACK_API_TOKEN! }).base(process.env.AIRTABLE_FEEDBACK_APP_ID!);
export const vendorInterestBase = new Airtable({ apiKey: process.env.AIRTABLE_VENDOR_INTEREST_API_TOKEN! }).base(process.env.AIRTABLE_VENDOR_INTEREST_APP_ID!);

export function getLeadsTable() {
  return leadsBase('Leads');
}

export function getPartialLeadsTable() {
  return leadsBase('Partial Leads');
}

export function getVendorsTable() {
  return leadsBase('Hubspot Vendors');
}

export function getVendorFeedbackTable() {
  return feedbackBase('Feedback');
}

export function getWebsiteInterestTable() {
  return vendorInterestBase('Website');
}

export function getPremiumInterestTable() {
  return vendorInterestBase('Premium');
}