import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });
  }

  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
    const res = await fetch(photonUrl);

    if (!res.ok) {
      throw new Error(`Photon error: ${res.statusText}`);
    }

    const data = await res.json();
    const topResult = data.features?.[0];

    if (!topResult) {
      return NextResponse.json({ error: 'No results found' }, { status: 404 });
    }

    const props = topResult.properties || {};
    // todo: use standardized display name function
    const displayName = [
      props.name,
      props.city,
      props.state,
      props.country
    ].filter(Boolean).join(', ');

    const locationResult = {
      display_name: displayName,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      address: props
    };

    return NextResponse.json(locationResult);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to resolve location' }, { status: 500 });
  }
}
