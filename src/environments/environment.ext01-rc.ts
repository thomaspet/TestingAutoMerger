export const environment = {
    useProdMode: true,
    isSrEnvironment: true,

    // Identity Server Settings
    authority: 'https://login.unieconomy.no',
    client_id: '31ab73a1-a054-e09d-b928-287c35c3afc0',
    post_logout_redirect_uri: '',

    BASE_URL_INIT: '',
    BASE_URL: '',
    BASE_URL_INTEGRATION: 'https://rcext01-integration.unieconomy.no/',
    BASE_URL_FILES: 'https://rcext01-files.unieconomy.no',
    UNI_JOB_SERVER_URL: 'https://rcext01-jobserver.unieconomy.no/api/',
    ELSA_SERVER_URL: 'https://rcext01-admin.unieconomy.no',
    SIGNALR_PUSHHUB_URL: 'https://rcext01-signal.unieconomy.no/pushHub',

    API_DOMAINS: {
        INIT: '/api/init/',
        BUSINESS: '/api/biz/',
        ROOT: '/api/',
        METADATA: '/api/metadata/',
        STATISTICS: '/api/statistics/',
        UMH: '/api/umh/',
        JOBINFO: 'api/jobinfo/'
    },

    INTEGRATION_DOMAINS: {
        ALTINN: '/api/altinn/'
    },

    RAYGUN_API_KEY: '2iYzARArU22aNutdEnvtWw==',
    APP_INSIGHTS_KEY: '',

    SITE_KEY: '6LdMqT0UAAAAAEqsKmTCjEUcCnic_htqpjkmry2d',

    STIMULSOFT_LICENSE: '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHlG+yktak0Q90R4OusltI2zY/8dyatuk4wl913wKfuiD+lFXo' +
        'PdJjSivE7t86JeAQD4/S5sZ2cqnsqI705QLTdVWALC23HA7v0sVT2chTan+Zt3SFrT+XuCtOiYDARb6FEwm1Mq8Zq2' +
        'fuDilUqE5TSIHTs/fY5Go93Dl/kycSPTgepN8KnidjbCMO13U1DcSK/25HGHQhaYUZ2Yyj8xNhzeYMdhzCNIWdWg4O' +
        'ShyCiqDrPMAulIBNn+KDNJckQ7nw8Llm4i3KpflnjjW+QcITOgWzF8EPsOVU6j7AOS0pJd2MCwMwCQHogrxzuI6IDN' +
        '5B+hB9/JdHSla6UlFR2BhvRQ1Wfo7Q5IswDxaXlyDdpa+7gcbGVNCq79fb+htRIN6iaOuzwn2p5muHxAq9ha04X21H' +
        'mKG/BYuqI+OY22eU6OCXTkta7jjNTO3z2r6blIv3NqN6RA1XtrC7YtFdrlyitIxamxd6hQ6Jj6X/zpC7ayJcUZWgzE' +
        'y3pV5vCj93V5FE0loqCUQKiZTgKSSS0Wz9qW',

    IMPORT_CENTRAL_TEMPLATE_URLS : {
        CUSTOMER: 'https://public-files.regnskap.sr-bank.no/files/import/CustomerTemplateFinal.xlsx',
        SUPPLIER: 'https://public-files.regnskap.sr-bank.no/files/import/SupplierTemplateFinal.xlsx',
        PRODUCT: 'https://public-files.regnskap.sr-bank.no/files/import/ProductTemplateFinal.xlsx',
        MAIN_LEDGER: 'https://public-files.regnskap.sr-bank.no/files/import/MainLedgerTemplate.xlsx',
        PAYROLL: 'https://public-files.regnskap.sr-bank.no/files/import/PayrollTemplate.xlsx',
        VOUCHER: 'https://public-files.regnskap.sr-bank.no/files/import/VoucherExcelTemplate.xlsx',
        ORDER: 'https://public-files.regnskap.sr-bank.no/files/import/OrderTemplate.xlsx'
    },

    LICENSE_AGREEMENT_URL: 'https://public-files.regnskap.sr-bank.no/files/license/Lisensavtale_UniEconomy_v2.pdf'
};
