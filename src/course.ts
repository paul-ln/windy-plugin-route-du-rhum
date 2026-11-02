/**
 * Parcours théorique de la Route du Rhum (approximation) : sortie de la baie de
 * Saint-Malo, passage au large d'Ouessant, orthodromie jusqu'à la Guadeloupe, puis
 * tour de Basse-Terre par l'ouest et le sud jusqu'à Pointe-à-Pitre.
 * Longueur calculée ≈ 3 554 milles, pour 3 542 annoncés par l'organisation.
 */
type LatLon = [number, number];

export const START: LatLon = [48.6493, -2.0257]; // Saint-Malo
export const FINISH: LatLon = [16.2241, -61.532]; // Pointe-à-Pitre

const WAYPOINTS: LatLon[] = [
    START,
    [48.78, -2.25], // sortie de la baie
    [48.92, -3.0], // au nord de Bréhat
    [48.95, -4.2], // au nord des Sept-Îles
    [48.72, -5.55], // au large d'Ouessant
    [16.62, -61.45], // nord de Grande-Terre
    [16.52, -61.8], // Tête à l'Anglais
    [16.32, -61.86], // côte sous le vent
    [16.0, -61.8],
    [15.93, -61.68], // pointe du Vieux-Fort
    [15.92, -61.52], // canal des Saintes
    [16.05, -61.48],
    FINISH,
];

const RAD = Math.PI / 180;

/** Points intermédiaires sur l'orthodromie entre a et b (interpolation sphérique) */
const greatCircle = ([lat1, lon1]: LatLon, [lat2, lon2]: LatLon, steps: number): LatLon[] => {
    const toVector = (lat: number, lon: number) => [
        Math.cos(lat * RAD) * Math.cos(lon * RAD),
        Math.cos(lat * RAD) * Math.sin(lon * RAD),
        Math.sin(lat * RAD),
    ];
    const a = toVector(lat1, lon1);
    const b = toVector(lat2, lon2);
    const angle = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    if (angle < 1e-6) {
        return [[lat2, lon2]];
    }
    const points: LatLon[] = [];
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ka = Math.sin((1 - t) * angle) / Math.sin(angle);
        const kb = Math.sin(t * angle) / Math.sin(angle);
        const [x, y, z] = [0, 1, 2].map(k => ka * a[k] + kb * b[k]);
        points.push([Math.atan2(z, Math.hypot(x, y)) / RAD, Math.atan2(y, x) / RAD]);
    }
    return points;
};

/** Tracé complet, densifié sur les longs bords pour suivre la courbe de l'orthodromie */
export const courseLine = (): LatLon[] => {
    const line: LatLon[] = [WAYPOINTS[0]];
    for (let i = 1; i < WAYPOINTS.length; i++) {
        const from = WAYPOINTS[i - 1];
        const to = WAYPOINTS[i];
        const longLeg = Math.abs(to[0] - from[0]) + Math.abs(to[1] - from[1]) > 5;
        line.push(...(longLeg ? greatCircle(from, to, 120) : [to]));
    }
    return line;
};
