import Airtable from "airtable";

let _leadsBase: Airtable.Base | null = null;
function getLeadsBase() {
  if (!_leadsBase) {
    _leadsBase = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN! }).base(process.env.AIRTABLE_APP_ID!);
  }
  return _leadsBase;
}

let _feedbackBase: Airtable.Base | null = null;
function getFeedbackBase() {
  if (!_feedbackBase) {
    _feedbackBase = new Airtable({ apiKey: process.env.AIRTABLE_FEEDBACK_API_TOKEN! }).base(process.env.AIRTABLE_FEEDBACK_APP_ID!);
  }
  return _feedbackBase;
}

let _vendorInterestBase: Airtable.Base | null = null;
function getVendorInterestBase() {
  if (!_vendorInterestBase) {
    _vendorInterestBase = new Airtable({ apiKey: process.env.AIRTABLE_VENDOR_INTEREST_API_TOKEN! }).base(process.env.AIRTABLE_VENDOR_INTEREST_APP_ID!);
  }
  return _vendorInterestBase;
}

export function getLeadsTable() {
  return getLeadsBase()('Leads');
}

export function getPartialLeadsTable() {
  return getLeadsBase()('Partial Leads');
}

export function getVendorsTable() {
  return getLeadsBase()('Hubspot Vendors');
}

export function getVendorFeedbackTable() {
  return getFeedbackBase()('Feedback');
}

export function getWebsiteInterestTable() {
  return getVendorInterestBase()('Website');
}

export function getPremiumInterestTable() {
  return getVendorInterestBase()('Premium');
}