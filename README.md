# Plugin Windy : Route du Rhum en direct

Affiche les positions des skippers de la Route du Rhum sur la carte [Windy](https://www.windy.com),
à partir de l'API publique du site officiel :
`https://www.routedurhum.com/_functions/classement?lang=fr` (CORS ouvert, classement publié toutes les heures).

## Fonctionnalités

- Un marqueur par bateau, coloré selon la classe et orienté selon le cap
- Popup : photo, bateau, rang (et évolution), vitesse, cap, VMG, distance au but, écart au leader, lien vers la fiche
- Panneau latéral : classement par classe, recherche, masquage des classes, affichage des noms sur la carte
- Rafraîchissement automatique calé sur le champ `prochain` de l'API (5 min en cas d'erreur)
- Repères de départ (Saint-Malo) et d'arrivée (Pointe-à-Pitre)

## Développement

```bash
npm install
npm start          # sert le plugin sur https://localhost:9999/plugin.js
```

1. Ouvrir https://www.windy.com/developer-mode et charger `https://localhost:9999/plugin.js`.

### Certificat HTTPS local

Les versions récentes de Chrome refusent le certificat auto-signé du template quand windy.com
charge le plugin, même après l'avoir accepté dans un onglet. On utilise donc un certificat local
reconnu par Windows, rangé dans `.cert/` (ignoré par git, clé privée propre au poste) :

```bash
mkdir -p .cert
openssl req -x509 -newkey rsa:2048 -nodes -days 825 \
  -keyout .cert/localhost-key.pem -out .cert/localhost.pem -config dev-cert.cnf
certutil -user -addstore Root .cert/localhost.pem   # demande une confirmation Windows
```

`dev-cert.cnf` définit un certificat non-CA pour `localhost`, `127.0.0.1` et `::1`.
`rollup.config.js` utilise ce certificat s'il existe, sinon celui du template.
Pour le retirer : `certmgr.msc` > Autorités de certification racines de confiance >
« localhost (windy-rdr-plugin dev) ».

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `src/pluginConfig.ts` | Métadonnées du plugin (nom, route `/route-du-rhum`, UI) |
| `src/plugin.svelte` | Panneau, marqueurs, cycle de vie, rafraîchissement |
| `src/api.ts` | Appel de l'API et formatage |
| `src/boatIcon.ts` | Icônes de bateaux et repères |
| `src/popup.ts` | Contenu HTML du popup |
| `src/rhumTypes.ts` | Types de la réponse de l'API |

## Publication

Voir https://docs.windy-plugins.com/getting-started/publishing-plugin.html
(clé API `WINDY_API_KEY` en secret GitHub, puis workflow `publish-plugin`).
Le plugin est `private: true` tant qu'il n'est pas prêt à être listé dans la galerie.
