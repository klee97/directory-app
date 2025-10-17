import Airtable from "airtable";

export const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN! }).base(process.env.AIRTABLE_APP_ID!);

export function getLeadsTable() {
  return base('Leads');
}

export function getPartialLeadsTable() {
  return base('Partial Leads');
}

export function getVendorsTable() {
  return base('Hubspot Vendors');
}