import { NextResponse } from "next/server";

export async function submitForm( {
  firstname,
  lastname,
  email,
  reason,
  message
} : {
  firstname: string,
  lastname: string,
  email: string,
  reason: string,
  message: string
}) {
  try {
    const HUBSPOT_PORTAL_ID = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
    const HUBSPOT_FORM_GUID = process.env.NEXT_PUBLIC_HUBSPOT_FORM_GUID;

    const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;

    const response = await fetch(hubspotUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: [
          { name: "firstname", value: firstname },
          { name: "lastname", value: lastname },
          { name: "email", value: email },
          { name: "reason", value: reason },
          { name: "message", value: message },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit to HubSpot");
    }

    return NextResponse.json({ success: true, message: "Form submitted successfully!" });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ success: false, error: 'An unknown error occurred' }, { status: 500 });
    }  }
}
