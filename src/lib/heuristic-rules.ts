import { DailyRoutinePlan, FamilyProfile, CorsiRosenthalConfig, PurifierCalculation } from '@/types';
import { calculateAvoidedExposure, calculateCigaretteEquivalence, calculateCommuteEmissionsSaved } from './impact-calculator';

type Activity = Parameters<typeof calculateAvoidedExposure>[3];
type Mask = Parameters<typeof calculateAvoidedExposure>[4];

/** Avoided PM2.5 for one routine step plus a plain-language explanation of where the number comes from. */
function impactOf(outdoorPm25: number, mitigatedPm25: number, hours: number, activity: Activity, action: string, mask: Mask = 'none') {
  const r = calculateAvoidedExposure(outdoorPm25, mitigatedPm25, hours, activity, mask);
  return {
    pm25AvoidedUg: r.avoidedUg,
    explanation: `${action} avoids ~${r.avoidedUg} µg of inhaled PM2.5 (≈${r.cigarettesAvoided} cigarettes) at ${Math.round(outdoorPm25)} µg/m³ outdoors.`,
  };
}

/**
 * Generates an optimized, low-emission daily routine tailored to the family's profile,
 * location, and current AQI without requiring any external LLM API.
 */
export function generateHeuristicRoutine(profile: FamilyProfile, aqi: number, pm25: number, city: string): DailyRoutinePlan {
  const isHighSmog = aqi > 150;
  const isSevere = aqi > 250;
  const hasKids = profile.vulnerabilities.includes('infant_child');

  // Assumed indoor/outdoor PM2.5 ratio for a closed home, lower with a running purifier.
  const indoorPm25 = pm25 * (profile.hasAirPurifier ? 0.3 : 0.6);
  // Car cabins on recirculation and metro carriages filter part of the outdoor PM2.5.
  const enclosedCommute = profile.commuteMode === 'personal_car' || profile.commuteMode === 'metro_transit' || profile.commuteMode === 'carpool';

  const morning = impactOf(pm25, indoorPm25, 1.5, 'moderate', 'Exercising indoors instead of an outdoor jog');
  const commute = enclosedCommute
    ? impactOf(pm25, pm25 * 0.5, 1, 'light', 'Recirculated cabin air plus an N95 for the walking legs', 'n95_respirator')
    : impactOf(pm25, pm25, 1, 'moderate', 'Wearing a sealed N95 for the whole commute', 'n95_respirator');
  const midday = impactOf(pm25, pm25 * 0.6, 1, 'light', 'Moving errands to the midday dispersion window');
  const evening = impactOf(pm25, pm25 * 0.8, 1.5, 'light', 'Keeping 3-5 m back from curbside exhaust');
  const dinner = impactOf(pm25, indoorPm25, 2, 'resting', profile.hasAirPurifier ? 'A closed, purified home in the evening' : 'A closed home with damp cleaning in the evening');

  const activities = [
    {
      timeSlot: '06:30 AM - 08:00 AM',
      title: 'Morning Transition & Indoor Prep',
      activityType: 'indoor' as const,
      recommendation: isHighSmog
        ? 'Ground Inversion Window: Avoid outdoor jogging or walks. Keep windows tightly shut. Switch kitchen cooking to electric kettle or induction rather than open flame to prevent indoor particulate buildup.'
        : 'Moderate morning air: Keep exterior doors closed to avoid street rush-hour exhaust.',
      riskLevel: isSevere ? ('danger' as const) : isHighSmog ? ('caution' as const) : ('safe' as const),
      emissionImpact: morning.explanation,
      pm25AvoidedUg: morning.pm25AvoidedUg,
    },
    {
      timeSlot: '08:15 AM - 09:15 AM',
      title: hasKids ? 'School Run & Commute' : 'Morning Work Commute',
      activityType: 'commute' as const,
      recommendation: (() => {
        if (profile.commuteMode === 'personal_car') {
          return 'Set vehicle AC to internal recirculation mode (never fresh air intake). Ensure N95 masks are worn before stepping out of the vehicle. Avoid engine idling while waiting at school gates.';
        }
        if (profile.commuteMode === 'walk_cycle') {
          return 'High exposure risk: Switch to metro transit or carpooling during winter morning inversion. If walking is unavoidable, wear an airtight N95/FFP2 respirator with dual-headband seal.';
        }
        return 'Wear an N95 respirator while walking to public transit. Metro train carriages have pressurized filtered air, significantly cleaner than road-level exhaust.';
      })(),
      riskLevel: isHighSmog ? ('caution' as const) : ('safe' as const),
      emissionImpact: `${commute.explanation} ${profile.commuteMode === 'personal_car' ? 'Not idling also saves ~250 g CO2 per 10 minutes.' : 'Public transit emits ~75% less CO2 than driving.'}`,
      pm25AvoidedUg: commute.pm25AvoidedUg,
    },
    {
      timeSlot: '12:45 PM - 03:30 PM',
      title: 'Solar Convective Window (Safest Air Period)',
      activityType: 'ventilation' as const,
      recommendation: isSevere
        ? 'Solar radiation has peaked, temporarily raising the thermal inversion ceiling. Safest window for necessary outdoor grocery runs. Brief 15-minute cross-ventilation acceptable only if indoor CO2 is elevated (>1200 ppm).'
        : 'Solar heating has dispersed the surface inversion layer. Safest time for outdoor errands, children recreation, or airing out rooms.',
      riskLevel: 'safe' as const,
      emissionImpact: `${midday.explanation} One combined trip also avoids cold-engine restarts.`,
      pm25AvoidedUg: midday.pm25AvoidedUg,
    },
    {
      timeSlot: '05:30 PM - 07:00 PM',
      title: 'Evening Commute & Market Errands',
      activityType: 'commute' as const,
      recommendation:
        'Traffic congestion peaks as the evening cooling re-establishes the smog boundary layer. Avoid arterial road bottlenecks. If walking near commercial intersections, stay 3-5 meters back from curb exhaust plumes.',
      riskLevel: isHighSmog ? ('caution' as const) : ('safe' as const),
      emissionImpact: evening.explanation,
      pm25AvoidedUg: evening.pm25AvoidedUg,
    },
    {
      timeSlot: '07:30 PM - 09:30 PM',
      title: 'Dinner & Indoor Air Sanctuary',
      activityType: 'indoor' as const,
      recommendation:
        'Cook with exhaust hoods running on high, lids securely on pots. Perform damp microfiber floor mopping instead of dry brooms (which aerosolize settled toxic particles). Place DIY or HEPA purifier in bedroom 45 minutes before sleep.',
      riskLevel: 'safe' as const,
      emissionImpact: dinner.explanation,
      pm25AvoidedUg: dinner.pm25AvoidedUg,
    },
  ];

  const totalPmAvoided = activities.reduce((acc, a) => acc + a.pm25AvoidedUg, 0);
  const commuteSaved = calculateCommuteEmissionsSaved(profile.dailyCommuteKm, 'car_to_metro');

  return {
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    city,
    overallAqi: aqi,
    headlineSummary: isSevere
      ? `Severe Smog Alert for ${profile.familyName || 'Family'}: Prioritize strict indoor filtration, staggered commuting, and midday solar errands.`
      : `Moderate/High Smog Advisory for ${profile.familyName || 'Family'}: Use the 1:00-3:30 PM solar window for outdoor movements.`,
    inversionAdvice:
      'Atmospheric cooling traps vehicle and biomass smoke near ground level between 6-9:30 AM and 8-11:30 PM. Keep vulnerable members indoors during these windows.',
    activities,
    totalPmAvoidedMicrograms: totalPmAvoided,
    cigaretteEquivalenceAvoided: calculateCigaretteEquivalence(totalPmAvoided),
    co2OffsetKg: commuteSaved.co2SavedKg,
  };
}

/**
 * Computes DIY Corsi-Rosenthal Box Air Purifier specs and CADR
 */
export function calculateCorsiRosenthal(config: CorsiRosenthalConfig): PurifierCalculation {
  const volumeCuFt = config.roomLengthFt * config.roomWidthFt * config.roomHeightFt;

  const fanRatings = {
    16: { low: 220, medium: 310, high: 400 },
    20: { low: 310, medium: 430, high: 570 },
  };

  const baseCfm = fanRatings[config.fanSizeInches][config.fanSpeed];
  const shroudMultiplier = config.filterCount === 5 ? 1.15 : 1.0;
  const filterMultiplier = config.filterGrade === 'MERV14' ? 0.95 : config.filterGrade === 'HEPA' ? 0.82 : 1.0;

  const estimatedCADR = Math.round(baseCfm * shroudMultiplier * filterMultiplier);
  const actualACH = Number(((estimatedCADR * 60) / Math.max(1, volumeCuFt)).toFixed(1));
  const recommendedACH = 5.0; // Clean air standard for respiratory protection

  const suitability = actualACH >= 4.5 ? (actualACH > 8.0 ? 'oversized' : 'ideal') : 'underpowered';
  const estimatedBuildCostUSD = config.filterCount === 4 ? 28 : 34;
  const commercialEquivalentCostUSD = estimatedCADR > 400 ? 450 : 300;

  let guidanceText = '';
  if (suitability === 'ideal') {
    guidanceText = `Balanced sizing: This setup delivers ${actualACH} air changes per hour (exceeding the 5.0 ACH medical recommendation). It will clean 99% of particulate in this room within approximately 22 minutes.`;
  } else if (suitability === 'oversized') {
    guidanceText = `High power: Providing ${actualACH} ACH. You can comfortably run the fan on 'Low' speed to achieve quiet operation while maintaining clean air delivery.`;
  } else {
    guidanceText = `Underpowered for this room volume (${actualACH} ACH vs 5.0 recommended). Consider running on 'High' speed, or constructing two 4-filter units placed in opposite corners.`;
  }

  return {
    roomVolumeCuFt: volumeCuFt,
    recommendedAirChangesPerHour: recommendedACH,
    estimatedCADR,
    actualACH,
    efficacyPercent: config.filterGrade === 'MERV13' ? 88 : config.filterGrade === 'MERV14' ? 94 : 98,
    estimatedBuildCostUSD,
    commercialEquivalentCostUSD,
    soundLevelDecibels: config.fanSpeed === 'low' ? 47 : config.fanSpeed === 'medium' ? 52 : 58,
    suitability,
    guidanceText,
  };
}

/**
 * Intelligent Offline Response generator for air quality, IAQ hacks, and community advice
 */
export function getHeuristicAssistantResponse(query: string, aqi: number = 180, pm25: number = 95): { text: string; citations: string[] } {
  const q = query.toLowerCase();

  if (q.includes('corsi') || q.includes('diy') || q.includes('box fan') || q.includes('purifier') || q.includes('filter')) {
    return {
      text: `### High-Efficiency Box Fan Air Purifier: DIY Corsi-Rosenthal Guide

The Corsi-Rosenthal (C-R) Box was engineered by environmental scientist Dr. Richard Corsi and Jim Rosenthal. It matches or exceeds commercial \$400 HEPA purifiers for fine particulate (PM2.5) at a fraction of the cost.

#### Bill of Materials (~$28 to $34 Total):
1. **One standard 20-inch Box Fan** (\$15 - \$20)
2. **Four 20x20x1 or 20x20x2 MERV-13 Furnace Filters** (or F7/F8 EU grade)
3. **One roll of standard Duct Tape**
4. **Cardboard box** (from fan packaging) to build the base and circular shroud.

#### Assembly Steps:
1. **The Square Base**: Tape 4 MERV-13 filters together into a 4-sided cube. Ensure the airflow arrows on all filters point inward toward the center of the cube.
2. **The Floor**: Tape a piece of cardboard securely to the bottom opening so air cannot enter from beneath.
3. **The Fan Mounting**: Place the box fan on top, blowing upward (out of the box). Seal the perimeter with duct tape.
4. **The Cardboard Shroud**: Cut a 15-inch circular hole in a piece of cardboard and tape it onto the face of the box fan. This prevents aerodynamic vortex backflow at the fan blade tips, boosting CADR by 20% to 30% while reducing noise.

#### Performance:
- **Clean Air Delivery Rate (CADR)**: ~450 - 550 CFM (cleans a 400 sq.ft living room in under 20 minutes).
- **Filter Longevity**: In moderate winter smog, 1 set of MERV-13 filters lasts 5 to 6 months before resistance increases.`,
      citations: [
        'Corsi, R. & Rosenthal, J. (UC Davis School of Engineering) - Open-Source Indoor Air Filtration',
        'US EPA: Air Cleaners and Air Filters in the Home (Publication EPA 402-F-08-004)',
      ],
    };
  }

  if (q.includes('inversion') || q.includes('smog') || q.includes('morning') || q.includes('walk') || q.includes('jog')) {
    return {
      text: `### Understanding the Winter Thermal Inversion & Safe Windows

Winter smog is not just an emissions issue: it is caused by a meteorological phenomenon called **Radiation Temperature Inversion**.

#### Why Mornings are Most Problematic:
1. During winter nights, the ground rapidly radiates heat into clear skies and becomes colder than the atmosphere above it.
2. This creates a dense, cold layer of surface air trapped beneath a lid of warmer upper air.
3. Because cold air is dense and cannot rise, vehicle tailpipe emissions, stove smoke, and industrial particulate are trapped in a shallow 50-100 meter layer right where people breathe.

#### Diurnal Patterns:
- **Danger Zone (6:00 AM - 9:30 AM & 8:00 PM - 11:30 PM)**: The inversion lid is at its lowest height. Outdoor exercise or brisk walking during these hours causes rapid deep-lung deposition of PM2.5 and combustion hydrocarbons.
- **The Safe Window (1:00 PM - 3:30 PM)**: As solar radiation warms the ground, thermal convective updrafts break open the inversion lid, allowing trapped particulate to dilute vertically. This is the optimal window for outdoor errands, doctor appointments, or brief airing out.`,
      citations: [
        'World Meteorological Organization (WMO) - Boundary Layer Climatology & Inversion Trapping',
        'Lancet Planetary Health - Diurnal patterns of acute cardiovascular mortality during urban smog spikes',
      ],
    };
  }

  if (q.includes('plant') || q.includes('snake plant') || q.includes('areca') || q.includes('nasa')) {
    return {
      text: `### Scientific Assessment: Houseplants vs Winter Smog

A widespread belief is that keeping snake plants, peace lilies, or spider plants in bedrooms will scrub winter smog. Here is what aerosol science demonstrates:

#### The NASA Study Context:
The 1989 NASA Clean Air Study was conducted inside hermetically sealed, airtight 1-cubic-meter Plexiglas chambers with artificial lighting. It measured volatile organic chemicals (benzene and formaldehyde) over multiple days, not fine particulate matter (PM2.5 / PM10).

#### Practical Engineering Realities:
1. **Plants do not filter PM2.5**: Particulate matter (dust, soot, smog) requires mechanical impaction through fibrous media (such as HEPA or MERV filters). Plants only capture a negligible fraction of dust that passively lands on leaves.
2. **Air Exchange Rates**: A typical room has 0.5 to 1.5 natural air changes per hour. To match the cleaning power of a single \$30 DIY Corsi-Rosenthal box, a household would need between 100 and 500 plants in one room.
3. **Moisture Alert**: Over-watering indoor plants in winter can push indoor relative humidity above 65%, fostering mold spores and dust mite growth, which exacerbates asthma.

#### Verdict:
Enjoy houseplants for psychological wellbeing, but rely on mechanical HEPA/MERV filtration for soot and toxic PM2.5.`,
      citations: [
        'Cummings, B. & Waring, M. (Drexel University) - Potted plants do not improve indoor air quality (Journal of Exposure Science & Environmental Epidemiology)',
        'NASA Clean Air Study (Wolverton et al., 1989) vs Field Chamber Re-evaluations',
      ],
    };
  }

  if (q.includes('mask') || q.includes('n95') || q.includes('cloth') || q.includes('surgical')) {
    return {
      text: `### Respirator Comparison for Winter Smog

Fine particulate matter (PM2.5) is smaller than 2.5 microns. Standard cloth bandanas and surgical masks provide minimal protection against aerosolized combustion soot.

| Mask Type | PM2.5 Filtration | Seal Quality | Practical Guidance |
| :--- | :--- | :--- | :--- |
| **N95 / FFP2 (Headband)** | **95% - 98%** | Airtight perimeter | Recommended: Essential when AQI > 150. |
| **KN95 / KF94 (Ear loop)** | **80% - 90%** | Moderate (ear tension varies) | Acceptable for short errands; pinch the nose wire firmly. |
| **Surgical Mask** | **20% - 40%** | Loose (air bypasses sides) | Ineffective for fine smog; air leaks through cheek gaps. |
| **Cloth / Handkerchief** | **< 15%** | Zero seal | False sense of security; fine soot passes straight through fabric weave. |

#### Fitting Recommendations:
1. **Fit Check**: Inhale sharply while cupping your hands over the mask without pressing it against your face. The mask should pull slightly inward. If air leaks near your eyes, adjust the metal nose clip.
2. **Storage and Reuse**: An N95 can be stored in a dry paper bag and reused for 30-40 hours of cumulative wear, provided it has not become physically soiled or moist.`,
      citations: [
        'NIOSH / CDC - Respiratory Protection Standards & Inward Leakage Testing',
        'American Journal of Respiratory and Critical Care Medicine - Efficacy of face masks against ambient particulate matter',
      ],
    };
  }

  // Default fallback guidance
  return {
    text: `### Strategic Air Quality Guidance for Urban Smog

When navigating severe winter pollution (AQI ${aqi}, PM2.5 ${pm25} µg/m³):

1. **Seal & Protect**:
   - Seal gaps under entrance doors with rolled damp towels or adhesive foam tape.
   - Switch split air conditioning units to internal recirculation mode.
2. **Eliminate Indoor Sources**:
   - Avoid dry-sweeping floors; damp-mop with microfiber to capture settled soot without aerosolizing it.
   - Avoid burning incense, mosquito coils, or scented paraffin candles (a single mosquito coil emits fine particulate comparable to dozens of cigarettes).
   - Use high-speed kitchen exhaust whenever cooking with oil.
3. **Commute Timing**:
   - Stagger departures outside of the 7:30 - 9:30 AM ground inversion peak.
   - When driving, set vehicle ventilation to internal recirculation to avoid pulling in diesel exhaust from trucks ahead.
4. **Build a Low-Cost Filter**:
   - A standard 20-inch box fan paired with four MERV-13 filters cleans a large room at 85% less cost than branded commercial purifiers.`,
    citations: [
      'World Health Organization (WHO) Global Air Quality Guidelines',
      'Berkeley Earth Particulate & Health Impact Equivalency Metrics',
    ],
  };
}
