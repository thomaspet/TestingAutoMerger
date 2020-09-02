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
            'PAYMENT_INFO_TEXT': 'Betalingen fra kunde vil bli registrert i Uni Economy. Husk at betalingen fra kunde må ha kommet inn i banken før du registrerer betalingen i Uni Economy.'
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
            'REFUND_INFO': 'Tilbakebetalingen vil bli registrert som betalt i UniEconomy. Husk å betale regningen i nettbanken dersom dette ikke allerede er gjort.',
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
            'MULTIPLE_USE_MSG2': 'Filen du vil bruke er knyttet til en leverandørfaktura. Henter fakturaen nå. Om dette ikke stemmer kan du slette filen fra leverandørfakturaen og gå tilbake til innboksen og starte på nytt med riktig fil.',
            'SMART_BOOKING_2': 'Kontoforslag basert på bokføringer gjort på denne leverandøren i UniEconomy',
            'SMART_BOOKING_3': 'Kontoforslag basert på bokføringer gjort i UniEconomy på levernadører i samme bransje som valgt leverandør på din faktura.',
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

    BANK: {
        'NEEDS_ACTION_TOOLTIP': 'Utbetalingsposter som kommer i denne listen, skyldes at banken har returnert kvitteringer på betalinger som ikke er laget i Uni Economy. Vi har derfor ikke funnet en sammenfallende post i vårt system, og disse må behandles manuelt. Klikk på de 3 prikkene til høyre i listen for å se behandlingsmuligheter. Du kan unngå at poster kommer i denne listen ved å aktivere «Bokfør kun betalinger fra UE i Autobank-innstillingene. Da vil disse ikke bli bokført heretter.'
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

    SETTINGS: {
        'REPORT_SETTINGS': 'Rapportoppsett',
        'GENERAL': 'GENERELLE INNSTILLINGER',
        'TOOLS': 'VERKTØY',
        'ADMIN': 'ADMIN',
        'BANK': 'Bankinnstillinger',
        'BANK_ACCOUNTS': 'Bankkontoer',
        'AUTO_BANK': 'Autobank',
        'COMPANY': 'Firma',
        'CURRENCY': 'Valuta',
        'OPENING_BALANCE': 'Åpningsbalanse',
        'BOOK_FROM_SYSTEM': 'Bokfør kun utbetalinger fra UniEconomy',
        'AUTO_BANK_INFOTEXT': 'Huk av "Bokfør kun utbetalinger fra UniEconomy" om du ønsker at utbetalinger som ikke er sendt fra systemet (som ikke har EndToEndID) ikke blir bokført',

        'COMPANY_EMAIL': 'E-postmottak',
        'FROM_BRREG': 'Hent opplysninger fra br-reg',
        'ACCOUNTING': 'Regnskapsinnstillinger',
        'REM_ACCOUNTS': 'Mellomkontoer',
        'SALES': 'Salgsinnstillinger',
        'SALES_INVOICE': 'Salgsfaktura',
        'PERIOD_AND_MVA': 'Periode og MVA',
        'ACCOUNTS': 'Kontoer',
        'PAYMENT_TERMS': 'Betalingsbetingelser',
        'DELIVERY_TERMS': 'Leveringsbetingelser',
        'KID_SETTINGS': 'KID innstillinger',
        'FORM_SETTINGS': 'Blankettoppsett',
        'ELECTRONIC_INVOICE': 'Elektroniske faktura',
        'COLLECTOR': 'Innkreving',
        'REPORT': 'Innstillinger for blanketter',
        'REPORT_LOGO': 'Logo til blankett',
        'REMINDER': 'Purreinnstillinger',
        'COLLECTOR_SETTINGS': 'Inkassoinnstillinger',
        'REMINDER_RULES': 'Purreregler',
        'FACTORING': 'Factoring',

        'COMPANY_SETTINGS_INFOTEXT': 'Registrer detaljer om firma. Orgnr feltet kan stå tomt eller fylles med fødselsnummer om virksomhet er privatperson. Du kan også laste opp firmalogo for rapporter.',
        'SALES_INVOICE_INFOTEXT': 'Overordnede innstillinger for salg og konto for postering av øredifferanse. Ved å huke av for «Periodiser etter leveringsdato» vil utgående faktura bokføres på leveringsdato.',
        'CUSTOMER_INFOTEXT': 'Standard kredittdager for selskapets kunder. Kan overstyres på kundekort ved behov. Ved å aktivere lagring som potensiell kunde kan kunder lagres som leads.',
        'PAYMENT_TERMS_INFOTEXT': 'Oppsett av forhåndsdefinerte kredittdager. Disse betingelsene vil være alternativene man har for kredittdager ved utfakturering dersom man ønsker å avvike fra standard.',
        'DELIVERY_TERMS_INFOTEXT': 'Oppsett av forhåndsdefinerte leveringsdager. Disse betingelsene vil være alternativene man har for leveringsbetingelser ved salg.',
        'REPORT_INFOTEXT': 'Velg hvordan blanketter skal se ut, logoplassering og standard språk. Sett standardblanketter for tilbud, ordre og faktura og sett opp faste tekster.',
        'LOGO_INFOTEXT': 'Her kan du laste opp logo som brukes på blanketter.',
        'ACCOUNTS_INFOTEXT': 'Oppsett av samlekonto for reskontroer.',
        'ELECTRONIC_INVOICE_INFOTEXT': 'Her kan du aktivere EHF og Fakturaprint. Om du ikke har kjøpt tjenestene, vil vi ta deg til markedsplassen først.',
        'PERIODE_AND_VAT_INFOTEXT': 'Registrering av MVA-status for selskapet, MVA-perioder og type næring for MVA-formål. Her sperrer man også henholdsvis bokføring og MVA-føringer i regnskapet.',
        'CURRENCY_INFOTEXT': 'Valg av standard valuta for selskapet og hovedbokskonto for valutaposteringer.',
        'OPENING_BALANCE_INFOTEXT': 'Har du et nystiftet aksjeselskap, kan du registrere åpningsbalansen din ved hjelp av denne veiviseren.',
        'OPENING_BALANCE_TEXT': 'Kom i gang med regnskapet ditt, og register åpningsbalanse nå!',
        'OPENING_BALANCE_BUTTON': 'Registrer åpningsbalanse',
        'AGA_SETTINGS1': 'Firmanavn og organisasjonsnummer fylles automatisk ut dersom man har hentet opplysninger fra Brønnøysundregisteret under Firmaoppsett.',
        'AGA_SETTINGS2': 'Oppsett av sone og beregningsregel for arbeidsgiveravgift. Dersom virksomheten er omfattet av ordning for fribeløp får du oversikt over gjenstående fribeløp her.',
        'REMINDER_SETTINGS_INFOTEXT': 'Overordnede innstillinger for purrede utgående faktura og betingelser for å purre. Antall purringer før inkasso må matche regler i bunnen av bilde.',
        'INKASSO_SETTINGS_INFOTEXT': 'Oppsett for integrasjon mot en av våre inkassopartnere.',
        'REMINDER_RULES_INFOTEXT': 'Betingelser for at utgående faktura skal overføres til henholdsvis «Klar til purring» og «Klar til inkasso» i salgsmodulen. Merk at purring ikke sendes ut automatisk, dette er betingelser for når utgående faktura skal kunne purres/sendes til inkasso.',
        'FETCH_BR_REG_INFOTEXT': 'Du kan også hente opplysninger fra brønnøysundregistrene',
        'FETCH_FROM_BR_REG': 'Hent fra brreg',

        'BANK_INFOTEXT': 'Definer akseptabelt beløp for differanse for å bokføre, og konto for føringer av gebyr',
        'BANK_ACCOUNTS_INFOTEXT': 'Sett opp kontoer for bruk i systemet. Dersom lønnskonto ikke er fylt ut vil lønn bruke driftskonto ved utbetaling av lønn. Du kan sette opp flere kontoer, men valgt konto vil bli brukt som default av systemet.',
        'REM_ACCOUNTS_INFOTEXT': 'Mellomkontoer for innbetaling, utbetaling og lønn',
        'COMPANY_EMAIL_INFOTEXT': 'Aktiver epostaddresse for mottak av innkommende faktura. Velg mellom firmanavn og organisasjonsnummer i epostaddressen. E-poster som kommer til denne addressen vil vises direkte i systemets innboks. Ved endring av e-postaddresse, lagre ny e-post med "Endre e-postaddresse"-knappen.',
        'SALARY_BOOKING_ACCOUNTS_INFOTEXT': 'Administrer systemkonti for postering av arbeidsgiveravgift og interimskonto for utbetaling av lønn. Aktiver automatisk postering av skattetrekk for å bokføre trekk til skattetrekkskonto når lønnskjøring bokføres. Huk av for «Utleggstrekk skatt til skattetrekkskonto» for å styre samlet beløp for utleggstrekk på skatt på lønnskjøringer mot skattetrekkskonto i remitteringsfil.',
        'SALARY_OTHER_INFOTEXT': 'Legg opp intervall for lønnskjøringer på selskapet. Dette angir standard datointervall ved opprettelse av lønnskjøringer. Dersom du aktiverer OTP-eksport må du også fylle ut feltet «Timer per årsverk», som er antall timer som tilsvarer et fullt årsverk i selskapet.',
        'VACATION_PAY_INFOHEADER': 'Trekk i fastlønn feriemåned:',
        'VACATION_PAY_INFOTEXT1': 'Brukes for fast ansatte med månedslønn og som ikke skal få utbetalt vanlig lønn når det utbetales feriepenger',
        'VACATION_PAY_INFOTEXT2': '-4/26 er det mest vanlige å bruke og er for de som har 5 uker ferie og bruker normen med 6 arbeidsdager i uken. (Etter ferieloven har én uke 6 virkedager (inkl.lørdager))',
        'VACATION_PAY_BASE_INFOTEXT':'Har du ansatte som allerede har opptjent seg feriepengegrunnlag registrerer du det her.',
        'FACTORING_INFOTEXT': 'Oppsett av factoring mot selskap',
        'CORPORATE_TAX_INFOTEXT': 'Kryss av og fyll inn hvis det skal beregnes og betales finansskatt av lønn.',
        'FEE_INFOTEXT': 'Skatte- og avgiftsregler er en gruppe skatteregler for spesielle organisasjoner.  Aktiveres en skatteregel vil den bli tilgjengelig for dette selskapet som valg under a-meldingsinformasjon på lønnsarten. Et selskap kan aktivere flere regler, men en lønnsart kan bare kobles mot en skatte- og avgiftsregel.'
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
        'CUSTOMER': 'Kunder',
        'PRODUCTS': 'Produkter',
        'PRODUCT_GROUP': 'Produktgrupper',
        'SELLERS': 'Selgere',
        'CURRENCY': 'Valutakurser',
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
        'ADDITIONAL_INFORMATION': 'Tilleggsopplysninger',
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
        'DIMENSION_SETTINGS': 'Dimensjoner',
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
        'BANK_SETTINGS': 'Bankinnstillinger',
        'ASSETS': 'Eiendeler',
        'OPENING_BALANCE': 'Åpningsbalanse'
    }
};
