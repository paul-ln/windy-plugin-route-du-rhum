import type { PositionedBoat, RhumBoat, RhumRanking } from './rhumTypes';

export const SITE_URL = 'https://www.routedurhum.com';
export const API_URL = `${SITE_URL}/_functions/classement?lang=fr`;

const WIX_MEDIA_URL = 'https://static.wixstatic.com/media';

/**
 * Couleurs par classe. L'API fournit quatre bleus très proches (Ultim, Ocean Fifty,
 * IMOCA, Class40) : on les remplace par des teintes distinctes, lisibles sur la carte.
 * Une classe absente de cette table garde la couleur de l'API.
 */
const CLASS_COLORS: Record<string, string> = {
    ultim: '#3E8BFF', // bleu
    'ocean-fifty': '#1FC8B6', // turquoise
    imoca: '#A97BFF', // violet
    class40: '#FF6B9A', // rose corail
    'vintage-multi': '#F19F39', // orange (API)
    'vintage-mono': '#F9E35C', // jaune (API)
};

/** Récupère le classement. L'API répond avec `Access-Control-Allow-Origin: *`. */
export const fetchRanking = async (signal?: AbortSignal): Promise<RhumRanking> => {
    const response = await fetch(API_URL, { signal, cache: 'no-cache' });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const data = (await response.json()) as RhumRanking;
    if (!Array.isArray(data?.classes)) {
        throw new Error('Réponse inattendue de l’API');
    }
    for (const cls of data.classes) {
        cls.couleur = CLASS_COLORS[cls.cle] ?? cls.couleur;
        for (const boat of cls.lignes) {
            // Les noms arrivent parfois avec des espaces en fin de chaîne
            boat.nom = boat.nom?.trim() ?? '';
            boat.prenom = boat.prenom?.trim() ?? '';
            boat.bateau = boat.bateau?.trim() ?? '';
        }
    }
    return data;
};

export const hasPosition = (boat: RhumBoat): boat is PositionedBoat =>
    Number.isFinite(boat.lat) && Number.isFinite(boat.lon);

export const skipperName = (boat: RhumBoat): string =>
    [boat.prenom, boat.nom].filter(Boolean).join(' ');

/** Miniature carrée d'une image Wix */
export const wixThumb = (mediaId: string | undefined, size: number): string | null =>
    mediaId
        ? `${WIX_MEDIA_URL}/${mediaId}/v1/fill/w_${size},h_${size},al_c,q_80,enc_auto/${mediaId}`
        : null;

export const ficheUrl = (boat: RhumBoat): string | null =>
    boat.fiche ? `${SITE_URL}${boat.fiche}` : null;

const STATUS_LABELS: Record<string, string> = {
    RAC: 'En course',
    ARV: 'Arrivé',
    FIN: 'Arrivé',
    ABD: 'Abandon',
    DNF: 'Abandon',
    DNS: 'Non partant',
};

export const statusLabel = (code: string): string => STATUS_LABELS[code] ?? code;

/** Part du parcours effectuée (0 à 1), d'après la distance au but */
export const progressOf = (boat: RhumBoat, distance: number): number | null =>
    Number.isFinite(boat.dtf) && distance > 0
        ? Math.min(1, Math.max(0, 1 - (boat.dtf as number) / distance))
        : null;

/** Places gagnées (> 0) ou perdues (< 0) depuis le classement précédent */
export const rankChange = (boat: RhumBoat): number | null =>
    Number.isFinite(boat.rang) && Number.isFinite(boat.rangAvant)
        ? (boat.rangAvant as number) - (boat.rang as number)
        : null;

/** « 1er », « 2e », « 3e »… */
export const ordinal = (rank: number | null | undefined): string =>
    Number.isFinite(rank) ? `${rank}${rank === 1 ? 'er' : 'e'}` : '–';

export const escapeHtml = (value: unknown): string =>
    String(value ?? '').replace(
        /[&<>"']/g,
        c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
    );

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

export const formatNumber = (value: number | null | undefined, unit = ''): string =>
    Number.isFinite(value) ? `${numberFormat.format(value as number)}${unit}` : '–';

const timeFormat = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

export const formatTime = (iso: string | number | undefined): string => {
    const date = iso === undefined ? NaN : new Date(iso).getTime();
    return Number.isFinite(date) ? timeFormat.format(date) : '–';
};

export const formatDateTime = (iso: string | undefined): string => {
    const date = iso ? Date.parse(iso) : NaN;
    return Number.isFinite(date) ? dateTimeFormat.format(date) : '–';
};

/** « 1 j 21 h » écoulé depuis le départ */
export const formatElapsed = (fromIso: string, to: number): string => {
    const start = Date.parse(fromIso);
    if (!Number.isFinite(start) || to < start) {
        return '–';
    }
    const totalMinutes = Math.floor((to - start) / 60_000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    return days > 0 ? `${days} j ${hours} h` : `${hours} h ${String(minutes).padStart(2, '0')}`;
};
