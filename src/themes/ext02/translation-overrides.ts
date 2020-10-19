/* tslint:disable */
export const TRANSLATION_OVERRIDES = {
    ENTITIES: {
        'SupplierInvoice': 'Regning',
        'RecurringInvoice': 'Gjentakende faktura',
        'PayrollRun': 'Lønnskjøring',
    },
    SALES: {
        INVOICE: {
            'PAYMENT_INFO_TEXT': 'Betalingen fra kunde vil bli registrert i DNB Regnskap. Husk at betalingen fra kunde må ha kommet inn i banken før du registrerer betalingen i DNB Regnskap.'
        },
        RECURRING_INVOICE: {
            'RECURRING_INVOICE_NEW': 'Ny gjentakende faktura',
            'RECURRING_INVOICE_NUMBER': 'Gjentakende fakturanr. {nr}',
            'LOG_HEADER': 'Fakturalogg for gjentakende fakturanr. {nr}',
            'GOTO': 'Gå til gjentakende fakturanr. {nr}',
            'MISSING_DIM_TOAST_TITLE': 'Gjentakende faktura(er) mangler dimensjon(er)',
            'DELETE': 'Slette gjentakende faktura?',
            'DELETE_CONFIRM': 'Er du sikker på at du vil slette denne gjentakende faktura? Dette kan ikke angres.',
            'DELETED_NR': 'Gjentakende fakturanr. {id} er fjernet.'
        }
    },

    SALARY: {
        PAYROLL: {
            'NEW': 'Ny lønnskjøring',
            'NUMBER': 'Lønnskjøring {nr}',
            'LATEST': 'Siste lønnskjøringer'
        }
    },

    SETTINGS: {
        'BOOK_FROM_SYSTEM': 'Bokfør kun utbetalinger fra DnB Regnskap',
        'AUTO_BANK_INFOTEXT': 'Huk av "Bokfør kun utbetalinger fra DnB Regnskap" om du ønsker at utbetalinger som ikke er sendt fra systemet (som ikke har EndToEndID) ikke blir bokført',
    },

    TIMETRACKING: {
        'PERSON_NEW': 'Ny timebruker'
    },

    ACCOUNTING: {
        SUPPLIER_INVOICE: {
            'REFUND_INFO': 'Tilbakebetalingen vil bli registrert som betalt i DNB Regnskap. Husk å betale regningen i nettbanken dersom dette ikke allerede er gjort.',
            'NEW': 'Ny utgift',
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
            'MULTIPLE_USE_MSG2': 'Filen du vil bruke er knyttet til en regning, vi henter den nå. Om dette ikke stemmer kan du slette filen fra regningen og gå tilbake til innboksen og starte på nytt med riktig fil.',
            'SMART_BOOKING_2': 'Kontoforslag basert på bokføringer gjort på denne leverandøren i DNB-Regnskap',
            'SMART_BOOKING_3': 'Kontoforslag basert på bokføringer gjort i DNB-Regnskap på levernadører i samme bransje som valgt leverandør på din faktura.',
        },
        POSTPOST: {
            'ALL_WITH_OPEN': 'Alle med utestående',
            'TITLE': 'Utestående {entity}',
            'EXPORT': 'Eksport utestående',
            'EXPORT_ALL': 'Eksport alle utestående'
        }
    },

    BANK: {
        'TRANSFERED_BANK_TOOLTIP': 'Inntil BankID er på plass må du huske å godkjenne alle betalinger i nettbanken.',
        'NEEDS_ACTION_TOOLTIP': 'Utbetalingsposter som kommer i denne listen, skyldes at banken har returnert kvitteringer på betalinger som ikke er laget i DnB Regnskap. Vi har derfor ikke funnet en sammenfallende post i vårt system, og disse må behandles manuelt.'
    },

    TASKS: {
        'TOOLBAR_HEADER': 'Oppgaver og godkjenninger'
    },

    NAVBAR: {
        'KPI': 'Oversikt',
        'COMPANIES': 'Mine selskaper',
        'APPROVALS': 'Oppgaver og godkjenninger',
        'OVERVIEW': 'Uttrekk',
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
        'EXPENSE': 'Utgift',
        'BANK_PRODUCTS': 'Bankprodukter',
        'MODULES': 'Pakker og utvidelser',
        'PURCHASES': 'Mine produkter'
    },

    DASHBOARD: {
        RECENT_PAYROLL_RUNS: {
            'HEADER': 'Siste lønnskjøringer',
            'EMPTY': 'Det ser ikke ut som du har noen lønnskjøringer',
            'PAYROLL_COLUMN': 'Lønnskjøring',
        },
        SALARY_SHORTCUTS: {
            'PAYROLL_RUN_TITLE': 'Lønnskjøring',
        },
    },
};
