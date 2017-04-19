export const SHORTCUTS = {
    quotes: {
        width: 1,
        height: 1,
        widgetType: 'shortcut', // TODO: enum
        config: {
            label: 'TILBUD',
            description: 'Tilbudsoversikt',
            icon: 'paperclip',
            link: '/sales/quotes'
        }
    },

    orders: {
        width: 1,
        height: 1,
        widgetType: 'shortcut', // TODO: enum
        config: {
            label: 'ORDRE',
            description: 'Ordreoversikt',
            icon: 'chat',
            link: '/sales/orders'
        }
    },

    invoices: {
        width: 1,
        height: 1,
        widgetType: 'shortcut', // TODO: enum
        config: {
            label: 'FAKTURA',
            description: 'Fakturaoversikt',
            icon: 'globe',
            link: '/sales/invoices'
        }
    },

    customers: {
        width: 1,
        height: 1,
        widgetType: 'shortcut', // TODO: enum
        config: {
            label: 'KUNDER',
            description: 'Kundeoversikt',
            icon: 'user',
            link: '/sales/customer'
        }
    },

    hours: {
        width: 1,
        height: 1,
        widgetType: 'shortcut', // TODO: enum
        config: {
            label: 'TIMER',
            description: 'Timeføring',
            icon: 'calender',
            link: '/timetracking/timeentry'
        }
    },

};
