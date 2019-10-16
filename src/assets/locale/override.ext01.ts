/* tslint:disable */
export const OVERRIDE = {
    ENTITIES: {
        'SupplierInvoice': 'Regning',
        'RecurringInvoice': 'Gjentakende faktura',
    },
    SALES: {
        RECURRING_INVOICE: {
            'RECURRING_INVOICE_NEW': 'Ny gjentakende faktura',
            'RECURRING_INVOICE_NUMBER': 'Gjentakende fakturanr. {nr}',
            'LOG_HEADER': 'Fakturalogg for gjentakende fakturanr. {nr}',
            'GOTO': 'Gå til gjentakende fakturanr. {nr}'
        }
    },

    SALARY: {
        PAYROLL: {
            'NEW': 'Ny lønnskjøring',
            'NUMBER': 'Lønnskjøring {nr}',
            'LATEST': 'Siste lønnskjøringer'
        }
    },

    TIMETRACKING: {
        'PERSON_NEW': 'Ny timebruker'
    },

    ACCOUNTING: {
        SUPPLIER_INVOICE: {
            'NEW': 'Ny regning',
            'SINGLE': 'Regning',
            'SMART_BOOKING_ERROR_MSG': 'Kan ikke kjøre smart bokføring. Regningen mangler enten fakturabeløp eller leverandør med orgnr.',
            'CREATE': 'Opprett regning',
            'LATEST': 'Siste regninger',
            'BOOK_WITH_AMOUNT': 'Bokføre regning med beløp {sum}?',
            'BOOK_WITH_SUPPLIER_NAME': 'Bokfør regning fra {name}',
            'BOOK_AND_APPROVE_WITH_SUPPLIER_NAME': 'Godkjenne og bokfør regning fra {name}',
            'BOOK_TO_PAYMENT_WITH_SUPPLIER_NAME': 'Godkjenne, bokføre og til betaling av regning fra {name}',
            'FILE_IN_USE_MSG': 'Filen er allerede brukt til å føre bilag eller på en regning og kan derfor ikke slettes. Ønsker du å markere som brukt slik at den forsvinner fra innboks?',
            'MULTIPLE_USE_MSG1': 'Flere regninger knyttet til filen, viser siste',
            'MULTIPLE_USE_MSG2': 'Filen du vil bruke er knyttet til en regning, vi henter den nå. Om dette ikke stemmer kan du slette filen fra regningen og gå tilbake til innboksen og starte på nytt med riktig fil.'
        },
        POSTPOST: {
            'ALL_WITH_OPEN': 'Alle med utestående',
            'TITLE': 'Utestående {entity}',
            'EXPORT': 'Eksport utestående',
            'EXPORT_ALL': 'Eksport alle utestående'
        }
    },

    TASKS: {
        'TOOLBAR_HEADER': 'Oppgaver og godkjenninger'
    },

    NAVBAR: {
        'KPI': 'Oversikt',
        'COMPANIES': 'Mine selskaper',
        'APPROVALS': 'Oppgaver og godkjenninger',
        'OVERVIEW': 'Database',
        'RECURRING_INVOICE': 'Gjentakende faktura',
        'JOURNALENTRY': 'Føre bilag',
        'SUPPLIER_INVOICE': 'Regninger',
        'OPEN_POST': 'Utestående',
        'VAT_MESSAGE': 'MVA-melding',
        'PAYROLL': 'Lønnskjøring',
        'AMELDING': 'A-melding',
        'BALANCE': 'Faste trekk',
        'HOUR_REG': 'Registrere timer',
        'BILLING_HOURS': 'Fakturere timer',
        'PERSONS': 'Timebrukere',
        'BUY': 'Kjøp'
    }
};
