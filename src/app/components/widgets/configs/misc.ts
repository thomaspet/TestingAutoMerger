export const MISC_WIDGETS = [
    {
        id: 'overview-widget',
        description: 'Oversikt',
        width: 12,
        height: 1,
        widgetType: 'overview',
        config: {}
    },

    {
        id: 'clock',
        description: 'Klokke',
        width: 3,
        height: 1,
        widgetType: 'clock',
        config: {
            dateColor: '#7698bd',
            showSeconds: false
        }
    },
    {
        id: 'companylogo',
        description: 'Firmalogo',
        width: 2,
        height: 1,
        widgetType: 'companyLogo',
        config: {}
    },
    {
        id: 'currency',
        description: 'Valutakurs',
        width: 2,
        height: 1,
        widgetType: 'currency',
        config: {}
    },
    {
        id: 'rss',
        description: 'Nyhetsbrev',
        width: 5,
        height: 5,
        alwaysVisible: true,
        widgetType: 'rss',
    },
];
