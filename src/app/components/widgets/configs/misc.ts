export const MISC_WIDGETS = [
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
        widgetType: 'currency', // TODO: enum
        config: {
            dataEndpoint: '/api/biz/currencies?action=get-latest-currency-downloaded-date&downloadSource=1'
        }
    },
];
