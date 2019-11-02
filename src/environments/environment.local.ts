export const environment = {
    useProdMode: false,
    isSrEnvironment: false,

    authority: 'https://dev-login.unieconomy.no',
    client_id: '83ccca75-77d9-e08f-7d35-e60bb6a70628',
    post_logout_redirect_uri: '/#/login',

    BASE_URL_INIT: 'http://localhost:29077',
    BASE_URL: 'http://localhost:29077',
    BASE_URL_INTEGRATION: 'https://dev-integrations.unieconomy.no/',
    BASE_URL_FILES: 'https://dev-unifiles.unieconomy.no',
    UNI_PUSH_ADAPTER_URL: 'https://dev-unipushadapter.unieconomy.no',
    UNI_JOB_SERVER_URL: 'https://devapi-unijobserver.unieconomy.no/api/',
    ELSA_SERVER_URL: 'https://dev-admin.unieconomy.no',
    SIGNALR_PUSHHUB_URL: 'https://dev-unisignal.unieconomy.no/pushHub',

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

    DEFAULT_HEADERS: {
        'Content-Type': 'application/json'
    },

    RAYGUN_API_KEY: '',
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
        CUSTOMER: 'https://public-files.unieconomy.no/files/import/CustomerTemplateFinal.xlsx',
        SUPPLIER: 'https://public-files.unieconomy.no/files/import/SupplierTemplateFinal.xlsx',
        PRODUCT: 'https://public-files.unieconomy.no/files/import/ProductTemplateFinal.xlsx',
        MAIN_LEDGER: 'https://public-files.unieconomy.no/files/import/MainLedgerTemplate.xlsx',
        PAYROLL: 'https://public-files.unieconomy.no/files/import/PayrollTemplate.xlsx',
        VOUCHER: '<<voucher-template-url>>'
    },

    LICENSE_AGREEMENT_URL: 'https://public-files.unieconomy.no/files/license/Lisensavtale_UniEconomy_v2.pdf'
};
