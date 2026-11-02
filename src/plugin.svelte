<div class="plugin__mobile-header">{title}</div>
<section class="plugin__content rdr" class:rdr--mobile={isMobileOrTablet}>
    <header class="rdr-head">
        {#if !isMobileOrTablet}
            <button
                class="rdr-icon-btn"
                title="Retour au menu"
                aria-label="Retour au menu"
                on:click={() => bcast.emit('rqstOpen', 'menu')}
            >
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg>
            </button>
        {/if}
        <h1 class="rdr-title">Route du Rhum</h1>
        <button
            class="rdr-icon-btn"
            class:is-loading={loading}
            title="Actualiser les positions"
            aria-label="Actualiser les positions"
            disabled={loading}
            on:click={refresh}
        >
            <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M16 10a6 6 0 1 1-1.8-4.3" /><path d="M16 3.5v3.2h-3.2" />
            </svg>
        </button>
    </header>

    {#if error}
        <p class="rdr-error" role="alert">
            Le classement n’a pas pu être chargé ({error}). Nouvel essai automatique dans 5 minutes,
            ou utilisez le bouton d’actualisation.
        </p>
    {/if}

    {#if !ranking && !error}
        <p class="rdr-muted">Chargement des positions…</p>
    {/if}

    {#if ranking}
        <figure class="rdr-route" aria-label="Progression des leaders de chaque classe">
            <div class="rdr-route__track">
                <span class="rdr-route__line" />
                {#each leaders as { cls, boat, progress } (cls.cle)}
                    <button
                        class="rdr-route__boat"
                        class:is-hidden={hiddenClasses.has(cls.cle)}
                        class:is-selected={boat.id === selectedId}
                        style:left="{progress * 100}%"
                        style:--c={cls.couleur}
                        title="{cls.nom} : {skipperName(boat)}, {Math.round(progress * 100)} %"
                        aria-label="Leader {cls.nom} : {skipperName(boat)}"
                        on:click={() => select(boat.id, true)}
                    />
                {/each}
            </div>
            <figcaption class="rdr-route__ends">
                <span>Saint-Malo</span>
                <span class="rdr-muted">{formatNumber(ranking.distance)} milles</span>
                <span>Pointe-à-Pitre</span>
            </figcaption>
        </figure>

        <p class="rdr-meta">
            En course depuis <strong>{formatElapsed(ranking.depart, now)}</strong>. Positions de
            {formatTime(ranking.maj)}{#if nextRefreshAt}, prochaine mise à jour vers {formatTime(
                    nextRefreshAt,
                )}{/if}.
        </p>

        <div class="rdr-chips" role="group" aria-label="Classes affichées sur la carte">
            {#each ranking.classes as cls (cls.cle)}
                <button
                    class="rdr-chip"
                    style:--c={cls.couleur}
                    aria-pressed={!hiddenClasses.has(cls.cle)}
                    title={hiddenClasses.has(cls.cle) ? 'Afficher sur la carte' : 'Masquer de la carte'}
                    on:click={() => toggleClass(cls.cle)}
                >
                    <span class="rdr-chip__dot" />
                    {cls.nom}
                    <span class="rdr-chip__count">{cls.partants}</span>
                </button>
            {/each}
        </div>

        <label class="rdr-switch">
            <input type="checkbox" bind:checked={showLabels} on:change={onLabelsChange} />
            <span class="rdr-switch__track"><span class="rdr-switch__thumb" /></span>
            Afficher les noms des skippers sur la carte
        </label>

        <label class="rdr-search">
            <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5" /><path d="m12.5 12.5 4 4" />
            </svg>
            <input
                type="search"
                placeholder="Rechercher un skipper, un bateau ou une voile"
                aria-label="Rechercher un skipper, un bateau ou un numéro de voile"
                bind:value={search}
            />
        </label>

        <div class="rdr-list">
            {#each listedClasses as cls (cls.cle)}
                <section class="rdr-class" style:--c={cls.couleur}>
                    <h2 class="rdr-class__title">
                        {cls.nom}
                        <span class="rdr-class__count">
                            {query ? `${cls.lignes.length} sur ${cls.partants}` : `${cls.partants} bateaux`}
                        </span>
                    </h2>
                    {#each cls.lignes as boat (boat.id)}
                        {@const progress = progressOf(boat, ranking.distance)}
                        {@const change = rankChange(boat)}
                        <button
                            class="rdr-row"
                            class:is-selected={boat.id === selectedId}
                            class:is-leader={boat.rang === 1}
                            class:is-off={!hasPosition(boat)}
                            on:click={() => select(boat.id, true)}
                        >
                            <span class="rdr-row__rank">
                                {boat.rang ?? '–'}
                                {#if change}
                                    <span class="rdr-trend" class:rdr-trend--up={change > 0} class:rdr-trend--down={change < 0}>
                                        {change > 0 ? '▲' : '▼'}{Math.abs(change)}
                                    </span>
                                {/if}
                            </span>
                            <span class="rdr-row__who">
                                <span class="rdr-row__name">{skipperName(boat)}</span>
                                <span class="rdr-row__boat">{boat.bateau}</span>
                            </span>
                            <span class="rdr-row__nums">
                                {#if boat.statut !== 'RAC'}
                                    <span class="rdr-row__status">{statusLabel(boat.statut)}</span>
                                {:else}
                                    <span class="rdr-row__speed">{formatNumber(boat.vitesse)}<small>nds</small></span>
                                    <span class="rdr-row__gap">
                                        {boat.rang === 1 ? 'en tête' : `+${formatNumber(boat.dtl)} mn`}
                                    </span>
                                {/if}
                            </span>
                            {#if progress !== null}
                                <span class="rdr-row__progress" style:--p="{progress * 100}%" />
                            {/if}
                        </button>
                    {/each}
                </section>
            {:else}
                <p class="rdr-muted rdr-empty">
                    Aucun bateau ne correspond à « {search.trim()} ». Vérifiez l’orthographe ou réaffichez
                    les classes masquées.
                </p>
            {/each}
        </div>

        <footer class="rdr-footer">
            <p>
                Données <a href={SITE_URL} target="_blank" rel="noopener">routedurhum.com</a>, classement
                officiel publié toutes les heures.
            </p>
            <p>Plugin réalisé par <strong>Paulen</strong></p>
        </footer>
    {/if}
</section>

<script lang="ts">
    import bcast from '@windy/broadcast';
    import { map } from '@windy/map';
    import { isMobileOrTablet } from '@windy/rootScope';
    import { onDestroy, onMount } from 'svelte';

    import config from './pluginConfig';
    import {
        SITE_URL,
        fetchRanking,
        formatElapsed,
        formatNumber,
        formatTime,
        hasPosition,
        progressOf,
        rankChange,
        skipperName,
        statusLabel,
    } from './api';
    import { boatIcon, landmarkIcon } from './boatIcon';
    import { FINISH, START, courseLine } from './course';
    import { boatPopupHtml } from './popup';

    import type { RhumBoat, RhumClass, RhumRanking } from './rhumTypes';

    const { title } = config;

    // Le site publie un classement par heure (`prochain`) et l'API est cachée 60 s.
    const MIN_DELAY = 60_000;
    const MAX_DELAY = 15 * 60_000;
    const FALLBACK_DELAY = 5 * 60_000;
    const PUBLISH_MARGIN = 90_000;

    const PREFS_KEY = 'windy-plugin-route-du-rhum:prefs';
    const FONTS_ID = 'rdr-fonts';
    const FONTS_HREF =
        'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap';

    interface BoatOnMap {
        marker: L.Marker;
        boat: RhumBoat;
        cls: RhumClass;
    }

    let ranking: RhumRanking | null = null;
    let error: string | null = null;
    let loading = false;
    let now = Date.now();
    let nextRefreshAt: number | null = null;

    let hiddenClasses = new Set<string>();
    let showLabels = false;
    let search = '';
    let selectedId: string | null = null;

    const boatsOnMap = new Map<string, BoatOnMap>();
    const classLayers = new Map<string, L.LayerGroup>();
    let landmarks: L.Marker[] = [];
    let course: L.Polyline | null = null;
    let popup: L.Popup | null = null;

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let clockTimer: ReturnType<typeof setInterval> | null = null;
    let pendingRequest: AbortController | null = null;
    let fitOnNextLoad = false;
    let destroyed = false;

    // ---------- Panneau ----------

    const matches = (boat: RhumBoat, query: string): boolean =>
        !query ||
        [boat.prenom, boat.nom, boat.bateau, boat.voile].some(v =>
            v?.toLowerCase().includes(query),
        );

    $: query = search.trim().toLowerCase();
    $: listedClasses = (ranking?.classes ?? [])
        .filter(cls => !hiddenClasses.has(cls.cle))
        .map(cls => ({ ...cls, lignes: cls.lignes.filter(boat => matches(boat, query)) }))
        .filter(cls => cls.lignes.length > 0);

    /** Leader de chaque classe, placé sur la ligne de parcours */
    $: leaders = (ranking?.classes ?? []).flatMap(cls => {
        const boat = cls.lignes.find(b => b.rang === 1) ?? cls.lignes[0];
        const progress = boat && ranking ? progressOf(boat, ranking.distance) : null;
        return boat && progress !== null ? [{ cls, boat, progress }] : [];
    });

    const ensureFonts = () => {
        if (!document.getElementById(FONTS_ID)) {
            const link = document.createElement('link');
            link.id = FONTS_ID;
            link.rel = 'stylesheet';
            link.href = FONTS_HREF;
            document.head.appendChild(link);
        }
    };

    // ---------- Préférences ----------

    const loadPrefs = () => {
        try {
            const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}');
            hiddenClasses = new Set(Array.isArray(prefs.hiddenClasses) ? prefs.hiddenClasses : []);
            showLabels = Boolean(prefs.showLabels);
        } catch {
            // stockage indisponible : on garde les valeurs par défaut
        }
    };

    const savePrefs = () => {
        try {
            localStorage.setItem(
                PREFS_KEY,
                JSON.stringify({ hiddenClasses: [...hiddenClasses], showLabels }),
            );
        } catch {
            // stockage indisponible : préférence non persistée
        }
    };

    // ---------- Carte ----------

    const iconFor = ({ boat, cls }: Pick<BoatOnMap, 'boat' | 'cls'>) =>
        boatIcon({
            color: cls.couleur,
            heading: boat.cap,
            label: showLabels ? boat.nom : null,
            selected: boat.id === selectedId,
            leader: boat.rang === 1,
        });

    const popupHtml = (entry: BoatOnMap) =>
        boatPopupHtml(entry.boat, entry.cls, ranking?.distance ?? 0);

    const zIndexFor = (entry: BoatOnMap) =>
        entry.boat.id === selectedId ? 2000 : entry.boat.rang === 1 ? 1000 : 0;

    const refreshIcon = (id: string | null) => {
        const entry = id ? boatsOnMap.get(id) : undefined;
        if (entry) {
            entry.marker.setIcon(iconFor(entry));
            entry.marker.setZIndexOffset(zIndexFor(entry));
            scheduleDeclutter();
        }
    };

    // ---------- Étiquettes sans chevauchement ----------

    const LABEL_HIDDEN = 'is-label-hidden';
    const LABEL_MARGIN = 2;
    let declutterFrame: number | null = null;

    const labelPriority = (entry: BoatOnMap) =>
        entry.boat.id === selectedId ? -2 : entry.boat.rang === 1 ? -1 : (entry.boat.rang ?? 999);

    /**
     * Masque les étiquettes qui en chevauchent une plus prioritaire
     * (bateau sélectionné, puis leaders, puis meilleur rang).
     */
    const declutterLabels = () => {
        declutterFrame = null;
        if (!showLabels) {
            return;
        }
        const placed: { left: number; top: number; right: number; bottom: number }[] = [];
        const entries = [...boatsOnMap.values()]
            .filter(({ cls }) => !hiddenClasses.has(cls.cle))
            .sort((a, b) => labelPriority(a) - labelPriority(b));

        for (const entry of entries) {
            const element = entry.marker.getElement();
            const label = element?.querySelector<HTMLElement>('.rdr-boat__label');
            if (!element || !label) {
                continue;
            }
            const point = map.latLngToContainerPoint(entry.marker.getLatLng());
            // L'étiquette est positionnée à droite de la coque (voir .rdr-boat__label)
            const box = {
                left: point.x + 15 - LABEL_MARGIN,
                top: point.y - 10 - LABEL_MARGIN,
                right: point.x + 15 + label.offsetWidth + LABEL_MARGIN,
                bottom: point.y - 10 + label.offsetHeight + LABEL_MARGIN,
            };
            const overlaps = placed.some(
                p => box.left < p.right && box.right > p.left && box.top < p.bottom && box.bottom > p.top,
            );
            element.classList.toggle(LABEL_HIDDEN, overlaps);
            if (!overlaps) {
                placed.push(box);
            }
        }
    };

    const scheduleDeclutter = () => {
        if (declutterFrame === null && !destroyed) {
            declutterFrame = requestAnimationFrame(declutterLabels);
        }
    };

    const classLayer = (cle: string): L.LayerGroup => {
        let layer = classLayers.get(cle);
        if (!layer) {
            layer = L.layerGroup();
            classLayers.set(cle, layer);
            if (!hiddenClasses.has(cle)) {
                layer.addTo(map);
            }
        }
        return layer;
    };

    const syncMarkers = (data: RhumRanking) => {
        const seen = new Set<string>();

        for (const cls of data.classes) {
            const layer = classLayer(cls.cle);
            for (const boat of cls.lignes) {
                if (!hasPosition(boat)) {
                    continue;
                }
                seen.add(boat.id);
                const latLng: [number, number] = [boat.lat, boat.lon];
                const existing = boatsOnMap.get(boat.id);

                if (existing) {
                    existing.boat = boat;
                    existing.cls = cls;
                    existing.marker.setLatLng(latLng).setIcon(iconFor(existing));
                    existing.marker.setZIndexOffset(zIndexFor(existing));
                } else {
                    const id = boat.id;
                    const entry: BoatOnMap = {
                        boat,
                        cls,
                        marker: L.marker(latLng, { icon: iconFor({ boat, cls }), riseOnHover: true }),
                    };
                    entry.marker.setZIndexOffset(zIndexFor(entry));
                    entry.marker.on('click', () => select(id, false));
                    layer.addLayer(entry.marker);
                    boatsOnMap.set(id, entry);
                }
            }
        }

        for (const [id, entry] of boatsOnMap) {
            if (!seen.has(id)) {
                classLayers.get(entry.cls.cle)?.removeLayer(entry.marker);
                boatsOnMap.delete(id);
            }
        }

        scheduleDeclutter();

        // Met à jour le popup ouvert avec les nouvelles valeurs
        const selected = selectedId ? boatsOnMap.get(selectedId) : undefined;
        if (popup && selected) {
            popup.setLatLng(selected.marker.getLatLng()).setContent(popupHtml(selected));
        } else if (popup && !selected) {
            closePopup();
        }
    };

    const closePopup = () => {
        const current = popup;
        popup = null;
        current?.remove();
        const previous = selectedId;
        selectedId = null;
        refreshIcon(previous);
    };

    const openPopup = (entry: BoatOnMap) => {
        const previous = popup;
        popup = null;
        previous?.remove();

        const created = L.popup({
            autoClose: false,
            closeOnClick: false,
            maxWidth: 300,
            minWidth: 260,
            className: 'rdr-popup-shell',
        })
            .setLatLng(entry.marker.getLatLng())
            .setContent(popupHtml(entry));
        popup = created;
        created.on('remove', () => {
            // Ignoré quand c'est nous qui remplaçons le popup
            if (popup === created) {
                closePopup();
            }
        });
        created.openOn(map);
    };

    const select = (id: string, flyTo: boolean) => {
        const entry = boatsOnMap.get(id);
        if (!entry) {
            return; // bateau sans position
        }
        if (hiddenClasses.has(entry.cls.cle)) {
            toggleClass(entry.cls.cle);
        }
        const previous = selectedId;
        selectedId = id;
        if (previous !== id) {
            refreshIcon(previous);
        }
        refreshIcon(id);
        if (flyTo) {
            map.setView(entry.marker.getLatLng(), Math.max(map.getZoom(), 6));
        }
        openPopup(entry);
    };

    const toggleClass = (cle: string) => {
        const next = new Set(hiddenClasses);
        const layer = classLayers.get(cle);
        if (next.has(cle)) {
            next.delete(cle);
            layer?.addTo(map);
        } else {
            next.add(cle);
            layer?.remove();
            if (selectedId && boatsOnMap.get(selectedId)?.cls.cle === cle) {
                closePopup();
            }
        }
        hiddenClasses = next;
        savePrefs();
        scheduleDeclutter();
    };

    const onLabelsChange = () => {
        for (const id of boatsOnMap.keys()) {
            refreshIcon(id);
        }
        savePrefs();
    };

    const fitFleet = () => {
        const points = [...boatsOnMap.values()]
            .filter(({ cls }) => !hiddenClasses.has(cls.cle))
            .map(({ marker }) => marker.getLatLng());
        if (points.length) {
            map.fitBounds(L.latLngBounds([...points, FINISH]), { padding: [30, 30] });
        } else {
            map.setView([33, -32], 4);
        }
    };

    const addLandmarks = () => {
        // Parcours théorique, sous les bateaux
        course = L.polyline(courseLine(), {
            color: '#ffffff',
            weight: 2,
            opacity: 0.75,
            dashArray: '6 8',
            interactive: false,
        }).addTo(map);

        landmarks = [
            L.marker(START, { icon: landmarkIcon('Saint-Malo', 'start'), interactive: false }),
            L.marker(FINISH, { icon: landmarkIcon('Pointe-à-Pitre', 'finish'), interactive: false }),
        ];
        landmarks.forEach(m => m.addTo(map));
    };

    const removeAllMapFeatures = () => {
        closePopup();
        classLayers.forEach(layer => layer.remove());
        classLayers.clear();
        boatsOnMap.clear();
        landmarks.forEach(m => m.remove());
        landmarks = [];
        course?.remove();
        course = null;
    };

    // ---------- Rafraîchissement ----------

    const nextDelay = (): number => {
        const next = ranking?.prochain ? Date.parse(ranking.prochain) : NaN;
        if (error || !Number.isFinite(next)) {
            return FALLBACK_DELAY;
        }
        return Math.min(MAX_DELAY, Math.max(MIN_DELAY, next + PUBLISH_MARGIN - Date.now()));
    };

    const scheduleNext = () => {
        const delay = nextDelay();
        nextRefreshAt = Date.now() + delay;
        refreshTimer = setTimeout(refresh, delay);
    };

    const refresh = async () => {
        if (refreshTimer) {
            clearTimeout(refreshTimer);
            refreshTimer = null;
        }
        pendingRequest?.abort();
        const request = new AbortController();
        pendingRequest = request;
        loading = true;

        try {
            const data = await fetchRanking(request.signal);
            if (destroyed || pendingRequest !== request) {
                return;
            }
            ranking = data;
            error = null;
            syncMarkers(data);
            if (fitOnNextLoad) {
                fitOnNextLoad = false;
                fitFleet();
            }
        } catch (e) {
            if (destroyed || pendingRequest !== request) {
                return;
            }
            error = e instanceof Error ? e.message : String(e);
            console.error('[route-du-rhum]', e);
        } finally {
            if (!destroyed && pendingRequest === request) {
                pendingRequest = null;
                loading = false;
                scheduleNext();
            }
        }
    };

    // ---------- Cycle de vie ----------

    export const onopen = (_params: unknown) => {
        if (boatsOnMap.size) {
            fitFleet();
        } else {
            fitOnNextLoad = true;
        }
    };

    onMount(() => {
        ensureFonts();
        loadPrefs();
        addLandmarks();
        refresh();
        clockTimer = setInterval(() => (now = Date.now()), 60_000);
        map.on('zoomend', scheduleDeclutter);
        map.on('moveend', scheduleDeclutter);
        // Les polices changent la largeur des étiquettes une fois chargées
        document.fonts?.ready.then(scheduleDeclutter);
    });

    onDestroy(() => {
        destroyed = true;
        map.off('zoomend', scheduleDeclutter);
        map.off('moveend', scheduleDeclutter);
        if (declutterFrame !== null) {
            cancelAnimationFrame(declutterFrame);
        }
        pendingRequest?.abort();
        if (refreshTimer) {
            clearTimeout(refreshTimer);
        }
        if (clockTimer) {
            clearInterval(clockTimer);
        }
        removeAllMapFeatures();
    });
</script>

<style lang="less">
    // Palette : les couleurs de classe (API) portent l'identité ; ambre « rhum » pour le leader.
    @spray: #e8f1f4;
    @mist: #8fa5b2;
    @abyss: #0e1a24;
    @rum: #e8a33d;
    @up: #5bd69a;
    @down: #ff7b7b;
    @surface: rgba(232, 241, 244, 0.06);
    @surface-strong: rgba(232, 241, 244, 0.11);
    @line: rgba(232, 241, 244, 0.14);
    @sans: 'Barlow', system-ui, -apple-system, 'Segoe UI', sans-serif;
    @cond: 'Barlow Condensed', 'Barlow', 'Arial Narrow', sans-serif;

    .rdr {
        display: flex;
        flex-direction: column;
        gap: 14px;
        font-family: @sans;
        font-size: 14px;
        line-height: 1.4;
        color: @spray;

        button {
            font: inherit;
            color: inherit;
            cursor: pointer;
        }
        button:focus-visible,
        input:focus-visible {
            outline: 2px solid @rum;
            outline-offset: 2px;
        }
        svg {
            fill: none;
            stroke: currentColor;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
    }

    .rdr-muted {
        color: @mist;
    }

    // ----- En-tête -----

    .rdr-head {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .rdr-title {
        flex: 1;
        margin: 0;
        color: @spray; // explicite : Windy colore les h1/h2 en jaune
        font-family: @cond;
        font-size: 28px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.01em;
    }
    .rdr-icon-btn {
        display: grid;
        place-items: center;
        flex: none;
        width: 32px;
        height: 32px;
        padding: 0;
        border: 1px solid @line;
        border-radius: 50%;
        background: @surface;
        transition: background 0.15s;
        svg {
            width: 18px;
            height: 18px;
        }
        &:hover {
            background: @surface-strong;
        }
        &:disabled {
            cursor: progress;
        }
        &.is-loading svg {
            animation: rdr-spin 0.9s linear infinite;
        }
    }
    @keyframes rdr-spin {
        to {
            transform: rotate(360deg);
        }
    }

    .rdr-error {
        margin: 0;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(255, 123, 123, 0.12);
        color: #ffc2c2;
        font-size: 13px;
    }

    // ----- Ligne de parcours -----

    .rdr-route {
        margin: 0;
        padding: 14px 14px 10px;
        border-radius: 12px;
        background: linear-gradient(90deg, rgba(232, 163, 61, 0.08), @surface 40%);
    }
    .rdr-route__track {
        position: relative;
        height: 22px;
        margin: 0 7px;
    }
    .rdr-route__line {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        border-top: 2px dashed @line;
        &::before,
        &::after {
            content: '';
            position: absolute;
            top: -6px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }
        &::before {
            left: -5px;
            background: @mist;
        }
        &::after {
            right: -5px;
            background: @rum;
            box-shadow: 0 0 0 3px rgba(232, 163, 61, 0.25);
        }
    }
    .rdr-route__boat {
        position: absolute;
        top: 50%;
        width: 14px;
        height: 14px;
        padding: 0;
        border: 2px solid @abyss;
        border-radius: 50%;
        background: var(--c);
        transform: translate(-50%, -50%);
        transition: transform 0.15s;
        &:hover,
        &.is-selected {
            transform: translate(-50%, -50%) scale(1.35);
            z-index: 1;
        }
        &.is-selected {
            box-shadow: 0 0 0 2px @rum;
        }
        &.is-hidden {
            opacity: 0.3;
        }
    }
    .rdr-route__ends {
        display: flex;
        justify-content: space-between;
        margin-top: 6px;
        font-family: @cond;
        font-size: 13px;
        font-weight: 600;
    }

    .rdr-meta {
        margin: -4px 0 0;
        color: @mist;
        font-size: 13px;
        strong {
            color: @spray;
            font-weight: 600;
        }
    }

    // ----- Classes -----

    .rdr-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 5px 4px;
    }
    .rdr-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 4px 3px 8px;
        border: 1px solid transparent;
        border-radius: 999px;
        background: @surface-strong;
        font-family: @cond;
        font-size: 14px;
        font-weight: 600;
        transition:
            background 0.15s,
            opacity 0.15s;
        &[aria-pressed='false'] {
            border-color: @line;
            background: transparent;
            color: @mist;
            .rdr-chip__dot {
                background: transparent;
                box-shadow: inset 0 0 0 2px var(--c);
            }
        }
    }
    .rdr-chip__dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--c);
    }
    .rdr-chip__count {
        min-width: 18px;
        padding: 0 4px;
        border-radius: 999px;
        background: rgba(14, 26, 36, 0.45);
        font-size: 12px;
        text-align: center;
    }

    // ----- Outils -----

    .rdr-search {
        position: relative;
        display: block;
        svg {
            position: absolute;
            top: 50%;
            left: 10px;
            width: 16px;
            height: 16px;
            color: @mist;
            transform: translateY(-50%);
            pointer-events: none;
        }
        input {
            width: 100%;
            box-sizing: border-box;
            padding: 8px 10px 8px 32px;
            border: 1px solid @line;
            border-radius: 8px;
            background: rgba(14, 26, 36, 0.35);
            color: @spray;
            font: inherit;
            font-size: 14px;
            &::placeholder {
                color: @mist;
            }
        }
    }
    .rdr-switch {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: -4px;
        color: @mist;
        font-size: 13px;
        cursor: pointer;
        &:has(input:checked) {
            color: @spray;
        }
        input {
            position: absolute;
            opacity: 0;
        }
    }
    .rdr-switch__track {
        position: relative;
        flex: none;
        width: 32px;
        height: 18px;
        border-radius: 999px;
        background: @surface-strong;
        transition: background 0.15s;
    }
    .rdr-switch__thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: @mist;
        transition:
            transform 0.15s,
            background 0.15s;
    }
    .rdr-switch input:checked + .rdr-switch__track {
        background: rgba(232, 163, 61, 0.35);
        .rdr-switch__thumb {
            background: @rum;
            transform: translateX(14px);
        }
    }
    .rdr-switch input:focus-visible + .rdr-switch__track {
        outline: 2px solid @rum;
        outline-offset: 2px;
    }

    // ----- Classement -----

    .rdr-list {
        display: flex;
        flex-direction: column;
        gap: 18px;
    }
    .rdr-class__title {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin: 0 0 6px;
        padding-left: 10px;
        border-left: 4px solid var(--c);
        color: @spray;
        font-family: @cond;
        font-size: 20px;
        font-weight: 700;
        line-height: 1.1;
    }
    .rdr-class__count {
        color: @mist;
        font-family: @sans;
        font-size: 12px;
        font-weight: 500;
    }

    .rdr-row {
        position: relative;
        display: grid;
        grid-template-columns: 30px 1fr auto;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 8px 11px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        text-align: left;
        &:hover {
            background: @surface;
        }
        &.is-selected {
            background: @surface-strong;
            box-shadow: inset 3px 0 0 @rum;
        }
        &.is-off {
            cursor: default;
            opacity: 0.55;
        }
    }
    .rdr-row__rank {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: @cond;
        font-size: 22px;
        font-weight: 700;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        .is-leader & {
            color: @rum;
        }
    }
    .rdr-row__who {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }
    .rdr-row__name {
        overflow: hidden;
        font-weight: 600;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .rdr-row__boat {
        overflow: hidden;
        color: @mist;
        font-size: 12px;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .rdr-row__nums {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-variant-numeric: tabular-nums;
    }
    .rdr-row__speed {
        font-family: @cond;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.1;
        small {
            margin-left: 2px;
            color: @mist;
            font-size: 11px;
            font-weight: 500;
        }
    }
    .rdr-row__gap,
    .rdr-row__status {
        color: @mist;
        font-size: 12px;
    }
    .rdr-row__progress {
        position: absolute;
        right: 8px;
        bottom: 4px;
        left: 48px;
        height: 2px;
        border-radius: 2px;
        background: @line;
        &::after {
            content: '';
            position: absolute;
            inset: 0 auto 0 0;
            width: var(--p);
            border-radius: inherit;
            background: var(--c);
        }
    }

    .rdr-trend {
        margin-top: 2px;
        font-family: @sans;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: -0.02em;
    }
    .rdr-trend--up {
        color: @up;
    }
    .rdr-trend--down {
        color: @down;
    }

    .rdr-empty {
        margin: 0;
        font-size: 13px;
    }
    .rdr-footer {
        padding-top: 12px;
        border-top: 1px solid @line;
        color: @mist;
        font-size: 12px;
        p {
            margin: 0 0 4px;
        }
        a,
        strong {
            color: @spray;
        }
        strong {
            font-family: @cond;
            font-size: 14px;
            font-weight: 700;
        }
    }

    // Mobile (mobileUI: 'small') : liste plus compacte
    .rdr--mobile {
        gap: 10px;
        .rdr-list {
            max-height: 40vh;
            overflow-y: auto;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .rdr * {
            transition: none !important;
            animation: none !important;
        }
    }

    // ----- Éléments injectés dans la carte (hors du composant) -----

    :global(.rdr-boat) {
        background: none;
        border: 0;
    }
    :global(.rdr-boat__hull) {
        width: 26px;
        height: 26px;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.55));
    }
    :global(.rdr-boat__hull svg) {
        display: block;
    }
    :global(.rdr-boat--selected .rdr-boat__hull) {
        border-radius: 50%;
        background: rgba(232, 163, 61, 0.25);
        box-shadow: 0 0 0 2px @rum;
    }
    :global(.rdr-boat__label),
    :global(.rdr-landmark__label) {
        position: absolute;
        top: 3px;
        left: 28px;
        padding: 1px 7px 1px 6px;
        border-left: 3px solid var(--c, @rum);
        border-radius: 3px;
        background: rgba(14, 26, 36, 0.82);
        color: @spray;
        font-family: @cond;
        font-size: 13px;
        font-weight: 600;
        line-height: 18px;
        white-space: nowrap;
        pointer-events: none;
    }
    // visibility (et non display) pour que la largeur reste mesurable
    :global(.rdr-boat.is-label-hidden .rdr-boat__label) {
        visibility: hidden;
    }
    :global(.rdr-landmark) {
        background: none;
        border: 0;
    }
    :global(.rdr-landmark__pin) {
        display: block;
        width: 10px;
        height: 10px;
        margin: 2px;
        border: 2px solid @abyss;
        border-radius: 50%;
        background: @mist;
    }
    :global(.rdr-landmark--finish .rdr-landmark__pin) {
        background: @rum;
        box-shadow: 0 0 0 3px rgba(232, 163, 61, 0.3);
    }
    :global(.rdr-landmark__label) {
        top: -2px;
        left: 18px;
    }

    // ----- Popup -----

    :global(.rdr-popup-shell .leaflet-popup-content-wrapper) {
        padding: 0;
        border-radius: 14px;
        background: @abyss;
        color: @spray;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    }
    :global(.rdr-popup-shell .leaflet-popup-content) {
        margin: 0;
    }
    :global(.rdr-popup-shell .leaflet-popup-tip) {
        background: @abyss;
    }
    :global(.rdr-popup-shell .leaflet-popup-close-button) {
        color: @mist;
    }

    :global(.rdr-pop) {
        padding: 16px;
        font-family: @sans;
        font-size: 13px;
        line-height: 1.35;
        color: @spray;
    }
    :global(.rdr-pop__head) {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
    }
    :global(.rdr-pop__photo) {
        flex: none;
        border-radius: 50%;
        object-fit: cover;
        box-shadow:
            0 0 0 2px @abyss,
            0 0 0 4px var(--c);
    }
    :global(.rdr-pop__id) {
        min-width: 0;
    }
    :global(.rdr-pop__rank) {
        display: flex;
        align-items: center;
        gap: 6px;
        color: @mist;
        font-family: @cond;
        font-size: 14px;
        font-weight: 600;
    }
    :global(.rdr-pop__rank.is-leader) {
        color: @rum;
    }
    :global(.rdr-pop__dot) {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--c);
    }
    :global(.rdr-pop__name) {
        font-family: @cond;
        font-size: 22px;
        font-weight: 700;
        line-height: 1.1;
    }
    :global(.rdr-pop__boat) {
        color: @mist;
    }
    :global(.rdr-pop__status) {
        margin-bottom: 10px;
        color: @rum;
        font-weight: 600;
    }
    :global(.rdr-pop__stats) {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin: 0 0 14px;
    }
    :global(.rdr-pop__stat) {
        padding: 8px 10px;
        border-radius: 8px;
        background: @surface;
    }
    :global(.rdr-pop__stat dt) {
        color: @mist;
        font-size: 11px;
    }
    :global(.rdr-pop__stat dd) {
        display: flex;
        align-items: center;
        gap: 4px;
        margin: 0;
        font-family: @cond;
        font-size: 22px;
        font-weight: 600;
        line-height: 1.15;
        font-variant-numeric: tabular-nums;
    }
    :global(.rdr-pop__stat small) {
        color: @mist;
        font-size: 12px;
        font-weight: 500;
    }
    :global(.rdr-pop__arrow) {
        width: 14px;
        height: 14px;
        fill: var(--c);
    }
    :global(.rdr-pop__bar) {
        height: 4px;
        border-radius: 4px;
        background: @line;
        overflow: hidden;
    }
    :global(.rdr-pop__bar span) {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--c);
    }
    :global(.rdr-pop__remain) {
        display: flex;
        justify-content: space-between;
        margin-top: 6px;
        color: @mist;
        font-size: 12px;
    }
    :global(.rdr-pop__link) {
        display: block;
        margin-top: 14px;
        padding: 8px;
        border-radius: 8px;
        background: @surface-strong;
        color: @spray !important;
        font-weight: 600;
        text-align: center;
        text-decoration: none;
    }
    :global(.rdr-pop__link:hover) {
        background: rgba(232, 241, 244, 0.18);
    }
    :global(.rdr-pop .rdr-trend) {
        font-size: 11px;
        font-weight: 600;
    }
    :global(.rdr-pop .rdr-trend--up) {
        color: @up;
    }
    :global(.rdr-pop .rdr-trend--down) {
        color: @down;
    }
</style>
