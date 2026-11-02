/**
 * Types de la réponse de https://www.routedurhum.com/_functions/classement
 * (déduits de l'API publique, non documentée).
 */

export interface RhumBoat {
    id: string;
    prenom: string;
    nom: string;
    bateau: string;
    voile: string;
    /** Identifiant d'image Wix, ex. `547c0f_xxx~mv2.avif` */
    photo?: string;
    photoBateau?: string;
    /** URL d'un SVG de drapeau */
    drapeau?: string;
    pays?: string;
    filtres?: string[];
    /** Chemin relatif de la fiche skipper, ex. `/skippers/tom-laperche` */
    fiche?: string;
    idCourse?: string;
    /** `RAC` = en course ; les autres codes apparaissent pendant la course */
    statut: string;
    rang: number | null;
    rangAvant?: number | null;
    /** Distance au but (milles) */
    dtf?: number | null;
    /** Distance au leader (milles) */
    dtl?: number | null;
    /** Vitesse (nœuds) */
    vitesse?: number | null;
    /** Cap (degrés) */
    cap?: number | null;
    vmg?: number | null;
    lat?: number | null;
    lon?: number | null;
    /** Historique des rangs */
    hist?: number[];
}

export interface RhumClass {
    id: string;
    /** Clé stable, ex. `ultim`, `imoca`, `class40` */
    cle: string;
    nom: string;
    /** Couleur hexadécimale de la classe */
    couleur: string;
    icone?: string;
    partants: number;
    lignes: RhumBoat[];
}

export interface RhumRanking {
    phase: string;
    /** Date ISO du départ */
    depart: string;
    /** Date ISO de la dernière mise à jour des positions */
    maj: string;
    /** Longueur du parcours (milles) */
    distance: number;
    partants?: number;
    /** Intervalle entre deux classements, en minutes */
    intervalleMin?: number;
    /** Date ISO du prochain classement */
    prochain?: string;
    classes: RhumClass[];
}

export type PositionedBoat = RhumBoat & { lat: number; lon: number };
