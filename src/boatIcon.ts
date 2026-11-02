import { escapeHtml } from './api';

interface BoatIconOptions {
    color: string;
    heading: number | null | undefined;
    label: string | null;
    selected: boolean;
    leader: boolean;
}

const ICON_SIZE = 26;

const safeColor = (color: string) => (/^#[0-9a-f]{3,8}$/i.test(color) ? color : '#E8F1F4');

/**
 * Icône de bateau orientée selon le cap. La rotation est appliquée à l'intérieur
 * du HTML de l'icône : on ne touche pas au `transform` que Leaflet pose sur le
 * conteneur du marqueur.
 */
export const boatIcon = ({ color, heading, label, selected, leader }: BoatIconOptions): L.DivIcon => {
    const rotation = Number.isFinite(heading) ? heading : 0;
    const fill = safeColor(color);
    const classes = ['rdr-boat', selected && 'rdr-boat--selected', leader && 'rdr-boat--leader']
        .filter(Boolean)
        .join(' ');
    const labelHtml = label
        ? `<span class="rdr-boat__label" style="--c:${fill}">${escapeHtml(label)}</span>`
        : '';

    return L.divIcon({
        className: classes,
        html: `<div class="rdr-boat__hull" style="transform:rotate(${rotation}deg)">
                <svg viewBox="0 0 26 26" width="${ICON_SIZE}" height="${ICON_SIZE}" aria-hidden="true">
                    <path d="M13 2.5C16.4 7 18 12.6 17.5 22.5H8.5C8 12.6 9.6 7 13 2.5Z"
                        fill="${fill}" stroke="#0E1A24" stroke-width="1.6" stroke-linejoin="round"/>
                    <path d="M13 7.5V19" stroke="#0E1A24" stroke-opacity=".45" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
            </div>${labelHtml}`,
        iconSize: [ICON_SIZE, ICON_SIZE],
        iconAnchor: [ICON_SIZE / 2, ICON_SIZE / 2],
        popupAnchor: [0, -ICON_SIZE / 2],
    });
};

export const landmarkIcon = (label: string, kind: 'start' | 'finish'): L.DivIcon =>
    L.divIcon({
        className: `rdr-landmark rdr-landmark--${kind}`,
        html: `<span class="rdr-landmark__pin"></span><span class="rdr-landmark__label">${escapeHtml(label)}</span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
