/** International nautical mile ↔ kilometre (exact conversion factor). */
export const KM_PER_NAUTICAL_MILE = 1.852;

const KM2_PER_NM2 = KM_PER_NAUTICAL_MILE * KM_PER_NAUTICAL_MILE;

export function nauticalMilesToKm(nm: number): number {
	return nm * KM_PER_NAUTICAL_MILE;
}

export function kmToNauticalMiles(km: number): number {
	return km / KM_PER_NAUTICAL_MILE;
}

export function km2ToNauticalMilesSquared(km2: number): number {
	return km2 / KM2_PER_NM2;
}
