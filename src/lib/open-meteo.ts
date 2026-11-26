import { AirQualityResponse, HourlyReading, InversionAnalysis, PollutantValues } from '@/types';
import { getAQIMeta } from './aqi-utils';

export async function fetchLiveAirQualityAndInversion(
  latitude: number,
  longitude: number,
  cityName: string = 'Current Location',
  countryName: string = ''
): Promise<AirQualityResponse> {
  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&timezone=auto&forecast_days=2`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto&forecast_days=2`;

  const [aqRes, weatherRes] = await Promise.all([
    fetch(aqUrl, { next: { revalidate: 1800 } }), // 30 mins cache
    fetch(weatherUrl, { next: { revalidate: 1800 } }),
  ]);

  if (!aqRes.ok || !weatherRes.ok) {
    throw new Error(`Failed to fetch Open-Meteo data: AQ (${aqRes.status}), Weather (${weatherRes.status})`);
  }

  const aqData = await aqRes.json();
  const weatherData = await weatherRes.json();

  const hourlyAq = aqData.hourly || {};
  const hourlyWeather = weatherData.hourly || {};
  const times: string[] = hourlyAq.time || [];

  const now = new Date();
  const currentIsoHourPrefix = now.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"

  // Find index corresponding to current hour or closest
  let currentIndex = times.findIndex((t) => t.startsWith(currentIsoHourPrefix));
  if (currentIndex === -1) currentIndex = 0;

  // Build hourly items for the next 24 hours
  const hourlyReadings: HourlyReading[] = [];
  const hoursToSlice = Math.min(times.length, currentIndex + 24);

  for (let i = currentIndex; i < hoursToSlice; i++) {
    const timeStr = times[i];
    const dateObj = new Date(timeStr);
    const hour = dateObj.getHours();

    const pm25 = hourlyAq.pm2_5?.[i] ?? 0;
    const pm10 = hourlyAq.pm10?.[i] ?? 0;
    const usAqi = hourlyAq.us_aqi?.[i] ?? Math.round(pm25 * 2.1);
    const temp = hourlyWeather.temperature_2m?.[i] ?? 18;
    const rh = hourlyWeather.relative_humidity_2m?.[i] ?? 65;
    const wind = hourlyWeather.wind_speed_10m?.[i] ?? 5;

    // Thermal inversion logic:
    // Smog traps occur when surface air is colder than upper air + wind is calm (< 8 km/h).
    // In diurnal winter cycles, overnight and early mornings (20:00 - 09:30) have severe inversion.
    // Solar maximum heating (12:30 - 16:00) causes convective mixing and breaks the inversion lid.
    const isColdAndCalm = temp < 18 && wind < 8;
    const isNightOrMorning = hour < 10 || hour >= 19;
    const isInversionSevere = isColdAndCalm && isNightOrMorning;
    const isSafeWindow = hour >= 12 && hour <= 16 && pm25 < 180;

    hourlyReadings.push({
      time: timeStr,
      hour,
      pm25: Math.round(pm25),
      pm10: Math.round(pm10),
      usAqi: Math.round(usAqi),
      temperature: Math.round(temp),
      relativeHumidity: Math.round(rh),
      windSpeed: Math.round(wind),
      isInversionSevere,
      isSafeWindow,
    });
  }

  // Current readings
  const curPm25 = Math.round(hourlyAq.pm2_5?.[currentIndex] ?? 75);
  const curPm10 = Math.round(hourlyAq.pm10?.[currentIndex] ?? 130);
  const curUsAqi = Math.round(hourlyAq.us_aqi?.[currentIndex] ?? Math.round(curPm25 * 2.1));
  const curNo2 = Math.round(hourlyAq.nitrogen_dioxide?.[currentIndex] ?? 25);
  const curSo2 = Math.round(hourlyAq.sulphur_dioxide?.[currentIndex] ?? 12);
  const curCo = Math.round(hourlyAq.carbon_monoxide?.[currentIndex] ?? 400);
  const curO3 = Math.round(hourlyAq.ozone?.[currentIndex] ?? 40);

  const curTemp = Math.round(hourlyWeather.temperature_2m?.[currentIndex] ?? 18);
  const curHumidity = Math.round(hourlyWeather.relative_humidity_2m?.[currentIndex] ?? 60);
  const curWind = Math.round(hourlyWeather.wind_speed_10m?.[currentIndex] ?? 5);

  const aqiMeta = getAQIMeta(curUsAqi);

  // Inversion analysis
  const inversion: InversionAnalysis = {
    safeWindowStart: '12:30 PM',
    safeWindowEnd: '4:00 PM',
    peakTrapHours: ['06:00 AM - 09:30 AM', '08:00 PM - 11:30 PM'],
    inversionStrength: curWind < 6 && curTemp < 16 ? 'High' : curWind < 10 ? 'Moderate' : 'Low',
    explanation:
      curWind < 8
        ? 'Ground-level nocturnal cooling has created a thermal boundary lid, locking particulate emissions close to breathing height. Maximum atmospheric mixing occurs between 12:30 PM and 4:00 PM when solar radiation warms the surface.'
        : 'Moderate surface wind turbulence is assisting with atmospheric dispersion, though micro-particulates remain concentrated in street canyons.',
  };

  const currentPollutants: PollutantValues = {
    pm25: curPm25,
    pm10: curPm10,
    no2: curNo2,
    so2: curSo2,
    co: curCo,
    ozone: curO3,
    usAqi: curUsAqi,
  };

  return {
    city: cityName,
    country: countryName,
    latitude,
    longitude,
    current: {
      ...currentPollutants,
      temperature: curTemp,
      humidity: curHumidity,
      windSpeed: curWind,
      timestamp: times[currentIndex] || new Date().toISOString(),
      category: aqiMeta.category,
      headline: `${aqiMeta.label} - Dominant: Fine Particulate (PM2.5)`,
      dominantPollutant: 'PM2.5',
    },
    inversion,
    hourly: hourlyReadings,
  };
}
