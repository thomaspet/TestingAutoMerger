export const INFO_SHORTCUTS = [
    {
        id: 'info_shortcut_overview',
        description: 'Oversikt',
        permissions: ['ui_overview'],
        width: 2,
        height: 2,
        widgetType: 'infoshortcut',
        config: {
            text: 'Alle dine data er kun et tastetrykk unna. Kraftig søk med filtreringsmuligheter',
            link: '/overview',
            externalLink: '',
            imageLink: '../../../assets/info_shortcut_ticker_img.jpg',
        }
    },
    {
        id: 'info_shortcut_videos',
        description: 'Opplæringsvideoer',
        width: 2,
        height: 2,
        widgetType: 'infoshortcut',
        config: {
            text: 'Se våre opplæringsvideoer slik at du blir god og trygg på Uni Economy',
            link: '',
            externalLink: 'https://app.cimple.no/unimicro/',
            imageLink: '../../../assets/info_shortcut_movie_img.jpg',
        }
    },
    {
        id: 'info_shortcut_help',
        description: 'Kundesenter',
        width: 2,
        height: 2,
        widgetType: 'infoshortcut',
        config: {
            text: 'Besøk vårt kundesenter for tips og triks, nyttige datoer og annen info.',
            link: '',
            externalLink: 'https://unimicro.atlassian.net/servicedesk/customer/portal/3',
            imageLink: '../../../assets/info_shortcut_bell_img.jpg',
        }
    }
];
