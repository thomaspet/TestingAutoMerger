/* tslint:disable */
export const NO = {
    ENTITIES: {
        'SupplierInvoice': 'Leverandørfaktura',
        'JournalEntryLine': 'Bilagslinje',
        'Budget': 'Budsjett',
        'Supplier': 'Leverandør',
        'Currency': 'Valuta',
        'CustomerInvoice': 'Faktura',
        'CustomerOrder': 'Ordre',
        'CustomerQuote': 'Tilbud',
        'CustomerInvoiceReminder': 'Purring',
        'RecurringInvoice': 'Repeterende faktura',
        'Customer': 'Kunder',
        'Product': 'Produkter',
        'ProductCatagory': 'Produktgruppe',
        'Sellers': 'Selgere',
        'PayrollRun': 'Lønnsavregning',
        'Employee': 'Ansatte',
        'WageType': 'Lønnsart',
        'Worker': 'Personer',
        'WorkType': 'Timeart',
        'WorkProfile': 'Stillingsmal',
        'Project': 'Prosjekt'
    },

    SALES: {
        INVOICE: {
            'INVOICE': 'Faktura',
            'NEW': 'Ny faktura',
            'INVOICED': 'Fakturert',
            'INVOICE_DATE': 'Fakturadato',
            'CREDIT_DAYS': 'Kredittdager',
            'INVOICE_REF': 'Fakturaref.',
        },
        RECURRING_INVOICE: {
            'RECURRING_INVOICE_NEW': 'Ny repeterende faktura',
            'RECURRING_INVOICE_NUMBER': 'Repeterende fakturanr. {nr}',
            'LOG_HEADER': 'Fakturalogg for repeterende fakturanr. {nr}',
            'GOTO': 'Gå til repeterende fakturanr. {nr}',
            'MISSING_DIM_TOAST_TITLE': 'Repeterende faktura(er) mangler dimensjon(er)',
            'DELETE': 'Slette repeterende faktura?',
            'DELETE_CONFIRM': 'Er du sikker på at du vil slette denne repeterende faktura? Dette kan ikke angres.',
            'DELETED_NR': 'Repeterende fakturanr. {id} er fjernet.'
        },
        COMMON: {
            'DELVIERY_DATE': 'Leveringsdato',
            'OUR_REF': 'Vår referanse',
            'YOUR_REF': 'Deres referanse',
            'COMMENT': 'Kommentar',
            'REQUISITION': 'Rekvisisjon',
            'MAIN_SELLER': 'Hovedselger',
            'PRINT': 'Utskrift',
            'SENDING_LAST': 'Siste utsendelse',
            'SENDING_STATUS': 'Status utsendelse'
        }
    },

    ACCOUNTING: {
        JOURNALENTRY: {
            'JOURNAL_ENTRY': 'Bilagsføring',
            'JOURNAL_ENTRY_NUMBER': 'Bilagsnr',
            'DEBET': 'Debit',
            'SUM_DEBET': 'Sum debit',
            'CREDIT': 'Kredit',
            'SUM_CREDIT': 'Sum kredit',
            'JOURNALING_TYPE': 'Bilagstype'
        },
        SUPPLIER_INVOICE: {
            'NEW': 'Ny leverandørfaktura',
            'SINGLE': 'Leverandørfaktura',
            'SMART_BOOKING_ERROR_MSG': 'Kan ikke kjøre smart bokføring. Leverandørfaktura mangler enten fakturabeløp eller leverandør med orgnr.',
            'CREATE': 'Opprett leverandørfaktura',
            'LATEST': 'Siste leverandørfaktura',
            'BOOK_WITH_AMOUNT': 'Bokføre leverandørfaktura med beløp {sum}?',
            'BOOK_WITH_SUPPLIER_NAME': 'Bokfør leverandørfaktura fra {name}',
            'BOOK_AND_APPROVE_WITH_SUPPLIER_NAME': 'Godkjenne og bokfør leverandørfaktura fra {name}',
            'BOOK_TO_PAYMENT_WITH_SUPPLIER_NAME': 'Godkjenne, bokføre og til betaling av leverandørfaktura fra {name}',
            'FILE_IN_USE_MSG': 'Filen er allerede brukt i bilagsføring eller på en leverandørfaktura og kan derfor ikke slettes. Ønsker du å markere som brukt slik at den forsvinner fra innboks?',
            'MULTIPLE_USE_MSG1': 'Flere leverandørfaktura knyttet til filen, viser siste',
            'MULTIPLE_USE_MSG2': 'Filen du vil bruke er knyttet til en leverandørfaktura. Henter fakturaen nå. Om dette ikke stemmer kan du slette filen fra leverandørfakturaen og gå tilbake til innboksen og starte på nytt med riktig fil.'
        },
        POSTPOST: {
            'ALL_WITH_OPEN': 'Alle med åpne poster',
            'TITLE': 'Åpne poster {entity}',
            'EXPORT': 'Eksport åpne poster',
            'EXPORT_ALL': 'Eksport alle åpne poster'
        },
        EXPENSE: {
            'TITLE': 'Utlegg'
        }
    },

    SALARY: {
        PAYROLL: {
            'NEW': 'Ny lønnsavregning',
            'NUMBER': 'Lønnsavregning {nr}',
            'LATEST': 'Siste lønnsavregninger'
        }
    },

    TIMETRACKING: {
        'PERSON_NEW': 'Ny person',
        'HOURTOTALS': 'Timerapport'
    },

    TASKS: {
        'TOOLBAR_HEADER': 'Dine oppgaver og godkjenninger'
    },

    STATUSES: {
        INVOICE: {
            'PAST_DUE': 'Forfalt',
            'REMINDED': 'Purret',
            'SENT_TO_COLLECTOR': 'Sendt til inkasso',
            'PAID': 'Betalt',
            'CREDITED': 'Kreditert'
        },
        COMMON: {
            'ALL': 'Alle',
            'MINE': 'Mine',
            'DRAFT': 'Kladd'
        }
    },

    NAVBAR: {
        'KPI': 'Nøkkeltall',
        'DASHBOARD': 'Dashboard',
        'COMPANIES': 'Selskaper',
        'APPROVALS': 'Godkjenninger',
        'OVERVIEW': 'Oversikt',
        'RESULT_BALANCE': 'Resultat og balanse',
        'DISTRIBUTION': 'Utsendelse',
        'DISTRIBUTION_LIST': 'Utsendingsliste',
        'EXTRACT': 'Uttrekk (BETA)',
        'REPORTS': 'Rapporter',
        'SALES': 'Salg',
        'BATCH_INVOICE': 'Samlefakturering',
        'INVOICE': 'Faktura',
        'RECURRING_INVOICE': 'Repeterende faktura',
        'ORDER': 'Ordre',
        'QUOTE': 'Tilbud',
        'REMINDER': 'Purring',
        'KID_SETTINGS': 'KID innstillinger',
        'CUSTOMER': 'Kunder',
        'PRODUCTS': 'Produkter',
        'PRODUCT_GROUP': 'Produktgrupper',
        'SELLERS': 'Selgere',
        'CURRENCY': 'Valuta',
        'COSTALLOCATION': 'Fordelingsnøkler',
        'ACCOUNTING': 'Regnskap',
        'JOURNALENTRY': 'Bilagsføring',
        'SUPPLIER_INVOICE': 'Leverandørfaktura',
        'BUDGET': 'Budsjett',
        'OPEN_POST': 'Åpne poster',
        'VAT_MESSAGE': 'MVA-melding',
        'SEARCH_JOURNALENTRY': 'Søk på bilag',
        'SEARCH_ACCOUNT': 'Søk på konto',
        'SUPPLIER': 'Leverandør',
        'ACCOUNT_PLAN': 'Kontoplan',
        'VAT_SETTINGS': 'MVA-innstillinger',
        'BANK': 'Bank',
        'PROCEEDS': 'Innbetalinger',
        'PAYMENTS': 'Utbetalinger',
        'PAYMENT_BATCH': 'Utbetalingsbunter',
        'PAYMENT_BATCH_AUTO': 'Avtalegirobunter',
        'BANK_RECONCILIATION': 'Bankavstemming',
        'MARKETPLACE': 'Markedsplass',
        'SALARY': 'Lønn',
        'PAYROLL': 'Lønnsavregning',
        'AMELDING': 'A-melding',
        'BALANCE': 'Saldo',
        'ADDITIONAL_INFORMATION': 'Tillegsopplysninger',
        'ANNUAL_ASSIGNMENT': 'Årsoppgave til inntektsmottaker',
        'OTP_EXPORT': 'OTP-eksport',
        'VARIABLE_PAYROLLS': 'Variable lønnsposter',
        'REGULATIVE': 'Regulativ',
        'EMPLOYEES': 'Ansatte',
        'WAGETYPE': 'Lønnsarter',
        'CATAGORIES': 'Kategorier',
        'MOVE_TEMPLATES': 'Trekkmaler',
        'HOURS': 'Timer',
        'HOUR_REG': 'Timeregistrering',
        'BILLING_HOURS': 'Fakturering av timer',
        'PERSONS': 'Personer',
        'TYPES': 'Timearter',
        'ADMIN_DAYSOFF': 'Administrer fridager',
        'EMPLOYMENT_TEMPLATE': 'Stillingsmal',
        'HOUR_STRING': 'timer',
        'TEMPLATES': 'Maler',
        'GO_TO_TODAY': 'Gå til idag',
        'VIEW': 'Visning',
        'ALTINN': 'Altinn',
        'SETTINGS': 'Innstillinger',
        'COMPANY': 'Firmaoppsett',
        'PAYROLL_SETTINGS': 'Lønnsinnstillinger',
        'INTEGRATION': 'Integrasjoner',
        'USERS': 'Brukere',
        'TEAMS': 'Teams',
        'NUMBERSERIES': 'Nummerserier',
        'TERMS': 'Betingelser',
        'RULES': 'Godkjenningsregler',
        'IMPORT_CENTRAL': 'Importsentral',
        'JOBS': 'Jobber',
        'MODELS': 'Modeller',
        'ROLES': 'Roller',
        'GDPR': 'GDPR',
        'ADMIN': 'Admin',
        'DIMENSION': 'Dimensjoner',
        'PROJECT_BETA': 'Prosjekt [BETA]',
        'PROJECT': 'Prosjekt',
        'DEPARTMENT': 'Avdeling',
        'DIMENSION_SETTINGS': 'Dimensjonsinnstillinger',
        'PAYMENT_AND_DELIVERY': 'Betalings- og leveringsbetingelser',
        'SHOW_ALL_NAVBAR': 'Vis alle menyvalg',
        'MODULES': 'Moduler',
        'WEBINAR': 'Webinar',
        'HOME': 'Hjem',
        'REGISTER': 'Register',
        'OTHER': 'Annet',
        'NUMBER_AND_REPORTS': 'Tall og rapporter',
        'EXPENSE': 'Utgift',
        'INBOX': 'Innboks',
        'BANK_PRODUCTS': 'Bankprodukter',
        'PURCHASES': 'Produktkjøp',
    }
};
