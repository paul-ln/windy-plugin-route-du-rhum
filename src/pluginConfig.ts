import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-route-du-rhum',
    version: '0.1.0',
    icon: '⛵',
    title: 'Route du Rhum : suivi en direct',
    description:
        'Positions des skippers de la Route du Rhum sur la carte Windy, avec le classement par classe mis à jour automatiquement.',
    author: 'Paulen',
    repository: 'https://github.com/paul-ln/windy-plugin-route-du-rhum',
    desktopUI: 'rhpane',
    desktopWidth: 360,
    mobileUI: 'small',
    routerPath: '/route-du-rhum',
    private: true,
};

export default config;
