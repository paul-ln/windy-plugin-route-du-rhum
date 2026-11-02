import { escapeHtml, ficheUrl, progressOf, rankChange, skipperName, wixThumb } from './api';
import type { Messages } from './i18n';
import type { RhumBoat, RhumClass } from './rhumTypes';

const trendHtml = (boat: RhumBoat, t: Messages): string => {
    const change = rankChange(boat);
    if (!change) {
        return '';
    }
    const places = Math.abs(change);
    return change > 0
        ? `<span class="rdr-trend rdr-trend--up" title="${escapeHtml(t.placesGained(places))}">▲${places}</span>`
        : `<span class="rdr-trend rdr-trend--down" title="${escapeHtml(t.placesLost(places))}">▼${places}</span>`;
};

const stat = (label: string, value: string, unit = '', extra = '') =>
    `<div class="rdr-pop__stat"><dt>${escapeHtml(label)}</dt><dd>${extra}${escapeHtml(value)}${
        unit ? `<small>${escapeHtml(unit)}</small>` : ''
    }</dd></div>`;

/** Contenu HTML du popup d'un bateau. Toutes les données externes sont échappées. */
export const boatPopupHtml = (
    boat: RhumBoat,
    cls: RhumClass,
    distance: number,
    t: Messages,
): string => {
    const photo = wixThumb(boat.photo, 128);
    const fiche = ficheUrl(boat);
    const progress = progressOf(boat, distance);
    const color = /^#[0-9a-f]{3,8}$/i.test(cls.couleur) ? cls.couleur : '#8FA5B2';
    const heading = Number.isFinite(boat.cap) ? (boat.cap as number) : null;
    const arrow =
        heading === null
            ? ''
            : `<svg class="rdr-pop__arrow" viewBox="0 0 12 12" style="transform:rotate(${heading}deg)" aria-hidden="true"><path d="M6 1 10 10 6 8 2 10Z"/></svg>`;
    const isLeader = boat.rang === 1;

    return `<div class="rdr-pop" lang="${t.lang}" style="--c:${color}">
        <div class="rdr-pop__head">
            ${photo ? `<img class="rdr-pop__photo" src="${escapeHtml(photo)}" alt="" width="60" height="60" />` : ''}
            <div class="rdr-pop__id">
                <div class="rdr-pop__rank${isLeader ? ' is-leader' : ''}">
                    <span class="rdr-pop__dot"></span>${escapeHtml(t.rankIn(boat.rang, cls.nom))} ${trendHtml(boat, t)}
                </div>
                <div class="rdr-pop__name">${escapeHtml(skipperName(boat))}</div>
                <div class="rdr-pop__boat">${escapeHtml(boat.bateau)}</div>
            </div>
        </div>
        ${boat.statut !== 'RAC' ? `<div class="rdr-pop__status">${escapeHtml(t.status(boat.statut))}</div>` : ''}
        <dl class="rdr-pop__stats">
            ${stat(t.speed, t.num(boat.vitesse), t.knots)}
            ${stat('VMG', t.num(boat.vmg), t.knots)}
            ${stat(t.heading, t.num(boat.cap), '°', arrow)}
            ${isLeader ? stat(t.gap, t.leadingShort) : stat(t.gap, t.num(boat.dtl), t.nauticalMiles)}
        </dl>
        ${
            progress === null
                ? ''
                : `<div class="rdr-pop__progress">
                    <div class="rdr-pop__bar"><span style="width:${(progress * 100).toFixed(1)}%"></span></div>
                    <div class="rdr-pop__remain">
                        <span>${escapeHtml(t.courseDone(Math.round(progress * 100)))}</span>
                        <span>${escapeHtml(t.milesToGo(t.num(boat.dtf)))}</span>
                    </div>
                </div>`
        }
        ${fiche ? `<a class="rdr-pop__link" href="${escapeHtml(fiche)}" target="_blank" rel="noopener">${escapeHtml(t.skipperProfile)}</a>` : ''}
    </div>`;
};
