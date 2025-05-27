import axios from 'axios';

type HubSpotContactProps = {
  email: string;
  firstname?: string;
  lastname?: string;
  slug?: string;
  company?: string;
};

/**
 * Creates a HMUA contact in HubSpot
 * @param contactProps - Contact properties to set in HubSpot
 * @returns The created contact ID or null if there was an error
 */
export async function createHubSpotContact(contactProps: HubSpotContactProps): Promise<string | null> {
  try {
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;
    
    if (!hubspotApiKey) {
      console.error('HubSpot API key is not configured');
      return null;
    }

    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      {
        properties: {
          email: contactProps.email,
          firstname: contactProps.firstname || '',
          lastname: contactProps.lastname || '',
          slug: contactProps.slug || '',
          company: contactProps.company || ''
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hubspotApiKey}`
        }
      }
    );

    console.log('HubSpot contact created:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('Error creating HubSpot contact:', error);
    return null;
  }
}


/**
 * Update a HMUA contact by email in HubSpot
 * @param contactProps - Contact properties to set in HubSpot
 * @returns The updated contact ID or null if there was an error
 */
export async function updateHubSpotContact(contactProps: HubSpotContactProps): Promise<string | null> {
  try {
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;
    
    if (!hubspotApiKey) {
      console.error('HubSpot API key is not configured');
      return null;
    }

    const response = await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactProps.email}?idProperty=email`,
      {
        properties: {
          firstname: contactProps.firstname,
          lastname: contactProps.lastname,
          slug: contactProps.slug,
          company: contactProps.company
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hubspotApiKey}`
        }
      }
    );

    console.log('HubSpot contact updated:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('Error updating HubSpot contact:', error);
    return null;
  }
}