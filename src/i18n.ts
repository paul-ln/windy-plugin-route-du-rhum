/**
 * Traductions du plugin. La langue suit celle de Windy (`store.get('usedLang')`,
 * qui reprend par défaut la langue du navigateur) : français si elle commence par
 * « fr », anglais sinon.
 */

export type Lang = 'fr' | 'en';

export const resolveLang = (code: string | null | undefined): Lang =>
    (code ?? '').toLowerCase().startsWith('fr') ? 'fr' : 'en';

export interface Messages {
    lang: Lang;
    // Formatage
    num: (value: number | null | undefined) => string;
    time: (date: string | number | undefined) => string;
    elapsed: (fromIso: string, to: number) => string;
    status: (code: string) => string;
    // Panneau
    back: string;
    refresh: string;
    loadError: (detail: string) => string;
    loading: string;
    routeLabel: string;
    leaderLabel: (cls: string, skipper: string) => string;
    miles: string;
    racingFor: string;
    positionsAt: string;
    nextUpdate: string;
    classesLabel: string;
    showOnMap: string;
    hideFromMap: string;
    showNames: string;
    searchPlaceholder: string;
    searchLabel: string;
    boatCount: (n: number) => string;
    matchCount: (shown: number, total: number) => string;
    leading: string;
    knots: string;
    nauticalMiles: string;
    noMatch: (query: string) => string;
    dataFrom: string;
    dataFromEnd: string;
    madeBy: string;
    // Fiche
    rankIn: (rank: number | null | undefined, cls: string) => string;
    placesGained: (n: number) => string;
    placesLost: (n: number) => string;
    speed: string;
    heading: string;
    gap: string;
    leadingShort: string;
    courseDone: (percent: number) => string;
    milesToGo: (miles: string) => string;
    skipperProfile: string;
}

const formatters = (locale: string) => {
    const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
    return {
        num: (value: number | null | undefined) =>
            Number.isFinite(value) ? number.format(value as number) : '–',
        time: (date: string | number | undefined) => {
            const ms = date === undefined ? NaN : new Date(date).getTime();
            return Number.isFinite(ms) ? time.format(ms) : '–';
        },
    };
};

const elapsed =
    (dayUnit: string, hourUnit: string) =>
    (fromIso: string, to: number): string => {
        const start = Date.parse(fromIso);
        if (!Number.isFinite(start) || to < start) {
            return '–';
        }
        const totalMinutes = Math.floor((to - start) / 60_000);
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = totalMinutes % 60;
        return days > 0
            ? `${days} ${dayUnit} ${hours} ${hourUnit}`
            : `${hours} ${hourUnit} ${String(minutes).padStart(2, '0')}`;
    };

const status = (labels: Record<string, string>) => (code: string) => labels[code] ?? code;

const fr: Messages = {
    lang: 'fr',
    ...formatters('fr-FR'),
    elapsed: elapsed('j', 'h'),
    status: status({
        RAC: 'En course',
        ARV: 'Arrivé',
        FIN: 'Arrivé',
        ABD: 'Abandon',
        DNF: 'Abandon',
        DNS: 'Non partant',
    }),
    back: 'Retour au menu',
    refresh: 'Actualiser les positions',
    loadError: detail =>
        `Le classement n’a pas pu être chargé (${detail}). Nouvel essai automatique dans 5 minutes, ou utilisez le bouton d’actualisation.`,
    loading: 'Chargement des positions…',
    routeLabel: 'Progression des leaders de chaque classe',
    leaderLabel: (cls, skipper) => `Leader ${cls} : ${skipper}`,
    miles: 'milles',
    racingFor: 'En course depuis',
    positionsAt: 'Positions de',
    nextUpdate: 'prochaine mise à jour vers',
    classesLabel: 'Classes affichées sur la carte',
    showOnMap: 'Afficher sur la carte',
    hideFromMap: 'Masquer de la carte',
    showNames: 'Afficher les noms des skippers sur la carte',
    searchPlaceholder: 'Rechercher un skipper, un bateau ou une voile',
    searchLabel: 'Rechercher un skipper, un bateau ou un numéro de voile',
    boatCount: n => `${n} bateaux`,
    matchCount: (shown, total) => `${shown} sur ${total}`,
    leading: 'en tête',
    knots: 'nds',
    nauticalMiles: 'mn',
    noMatch: query =>
        `Aucun bateau ne correspond à « ${query} ». Vérifiez l’orthographe ou réaffichez les classes masquées.`,
    dataFrom: 'Données',
    dataFromEnd: ', classement officiel publié toutes les heures.',
    madeBy: 'Plugin réalisé par',
    rankIn: (rank, cls) =>
        Number.isFinite(rank) ? `${rank}${rank === 1 ? 'er' : 'e'} en ${cls}` : cls,
    placesGained: n => `${n} place${n > 1 ? 's' : ''} gagnée${n > 1 ? 's' : ''}`,
    placesLost: n => `${n} place${n > 1 ? 's' : ''} perdue${n > 1 ? 's' : ''}`,
    speed: 'Vitesse',
    heading: 'Cap',
    gap: 'Écart',
    leadingShort: 'En tête',
    courseDone: percent => `${percent} % du parcours`,
    milesToGo: miles => `${miles} milles restants`,
    skipperProfile: 'Voir la fiche du skipper',
};

const englishOrdinal = (n: number) => {
    const tens = n % 100;
    if (tens >= 11 && tens <= 13) {
        return `${n}th`;
    }
    return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th'}`;
};

const en: Messages = {
    lang: 'en',
    ...formatters('en-GB'),
    elapsed: elapsed('d', 'h'),
    status: status({
        RAC: 'Racing',
        ARV: 'Finished',
        FIN: 'Finished',
        ABD: 'Retired',
        DNF: 'Retired',
        DNS: 'Did not start',
    }),
    back: 'Back to menu',
    refresh: 'Refresh positions',
    loadError: detail =>
        `The ranking could not be loaded (${detail}). It will retry automatically in 5 minutes, or use the refresh button.`,
    loading: 'Loading positions…',
    routeLabel: 'Progress of each class leader',
    leaderLabel: (cls, skipper) => `${cls} leader: ${skipper}`,
    miles: 'miles',
    racingFor: 'Racing for',
    positionsAt: 'Positions as of',
    nextUpdate: 'next update around',
    classesLabel: 'Classes shown on the map',
    showOnMap: 'Show on the map',
    hideFromMap: 'Hide from the map',
    showNames: 'Show skipper names on the map',
    searchPlaceholder: 'Search a skipper, boat or sail number',
    searchLabel: 'Search a skipper, boat or sail number',
    boatCount: n => `${n} boats`,
    matchCount: (shown, total) => `${shown} of ${total}`,
    leading: 'leader',
    knots: 'kn',
    nauticalMiles: 'nm',
    noMatch: query =>
        `No boat matches “${query}”. Check the spelling or show the hidden classes again.`,
    dataFrom: 'Data from',
    dataFromEnd: ', official ranking published every hour.',
    madeBy: 'Plugin by',
    rankIn: (rank, cls) => (Number.isFinite(rank) ? `${englishOrdinal(rank as number)} in ${cls}` : cls),
    placesGained: n => `${n} place${n > 1 ? 's' : ''} gained`,
    placesLost: n => `${n} place${n > 1 ? 's' : ''} lost`,
    speed: 'Speed',
    heading: 'Heading',
    gap: 'Gap',
    leadingShort: 'Leading',
    courseDone: percent => `${percent}% of the course`,
    milesToGo: miles => `${miles} miles to go`,
    skipperProfile: 'View skipper profile',
};

export const messages = (lang: Lang): Messages => (lang === 'fr' ? fr : en);
