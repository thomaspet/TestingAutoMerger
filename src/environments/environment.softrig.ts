// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    useProdMode: true,
    usePKCE: true,

    authority: 'https://test-login.softrig.com',
    client_id: '605f1348-8275-5434-0497-0a070694a8f5',
    post_logout_redirect_uri: '/#/login',

    BASE_URL_INIT: '',
    BASE_URL: '',

    // If you add base urls here please also update the api check in header-interceptor.ts!
    BASE_URL_INTEGRATION: 'https://test-integration.softrig.com/',
    BASE_URL_FILES: 'https://test-files.softrig.com',
    UNI_JOB_SERVER_URL: 'https://test-jobserver.softrig.com/api/',
    ELSA_SERVER_URL: 'https://test-admin.softrig.com',
    SIGNALR_PUSHHUB_URL: 'https://test-signal.softrig.com/pushHub',

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

    ID_PORTEN: {
        authority: '',
        client_id: '',
    },

    RAYGUN_API_KEY: 'o/sDy5tQZkTH2vkbPj+SZA==',
    APP_INSIGHTS_KEY: '27061a10-d40b-4e95-a6f1-8a9ce98b013a',

    RECAPTCHA_KEY: '6LdMqT0UAAAAAEqsKmTCjEUcCnic_htqpjkmry2d',

    STIMULSOFT_LICENSE: '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHlG+yktak0Q90R4OusltI2zY/8dyatuk4wl913wKfuiD+lFXo' +
        'PdJjSivE7t86JeAQD4/S5sZ2cqnsqI705QLTdVWALC23HA7v0sVT2chTan+Zt3SFrT+XuCtOiYDARb6FEwm1Mq8Zq2' +
        'fuDilUqE5TSIHTs/fY5Go93Dl/kycSPTgepN8KnidjbCMO13U1DcSK/25HGHQhaYUZ2Yyj8xNhzeYMdhzCNIWdWg4O' +
        'ShyCiqDrPMAulIBNn+KDNJckQ7nw8Llm4i3KpflnjjW+QcITOgWzF8EPsOVU6j7AOS0pJd2MCwMwCQHogrxzuI6IDN' +
        '5B+hB9/JdHSla6UlFR2BhvRQ1Wfo7Q5IswDxaXlyDdpa+7gcbGVNCq79fb+htRIN6iaOuzwn2p5muHxAq9ha04X21H' +
        'mKG/BYuqI+OY22eU6OCXTkta7jjNTO3z2r6blIv3NqN6RA1XtrC7YtFdrlyitIxamxd6hQ6Jj6X/zpC7ayJcUZWgzE' +
        'y3pV5vCj93V5FE0loqCUQKiZTgKSSS0Wz9qW',

    IMPORT_CENTRAL_TEMPLATE_URLS : {
        CUSTOMER: 'https://test-public-files.softrig.com/files/import/CustomerTemplateFinal.xlsx',
        SUPPLIER: 'https://test-public-files.softrig.com/files/import/SupplierTemplateFinal.xlsx',
        PRODUCT: 'https://test-public-files.softrig.com/files/import/ProductTemplateFinal.xlsx',
        MAIN_LEDGER: 'https://test-public-files.softrig.com/files/import/MainLedgerTemplate.xlsx',
        PAYROLL: 'https://test-public-files.softrig.com/files/import/PayrollTemplate.xlsx',
        VOUCHER: 'https://test-public-files.softrig.com/files/import/VoucherExcelTemplate.xlsx',
        ORDER: 'https://test-public-files.softrig.com/files/import/OrderTemplate.xlsx'
    },

    LICENSE_AGREEMENT_URL: 'https://test-public-files.softrig.com/files/license/Lisensavtale_UniEconomy_v2.pdf'
};

