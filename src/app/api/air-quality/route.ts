import { NextRequest, NextResponse, connection } from 'next/server';
import { fetchLiveAirQualityAndInversion } from '@/lib/open-meteo';

export async function GET(request: NextRequest) {
  await connection();
  try {
    const searchParams = request.nextUrl.searchParams;
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');
    const city = searchParams.get('city') || 'Detected Location';
    const country = searchParams.get('country') || '';

    const lat = latStr ? parseFloat(latStr) : 28.65;
    const lon = lonStr ? parseFloat(lonStr) : 77.30;

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const data = await fetchLiveAirQualityAndInversion(lat, lon, city, country);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Air quality route error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve air quality data' },
      { status: 500 }
    );
  }
}
