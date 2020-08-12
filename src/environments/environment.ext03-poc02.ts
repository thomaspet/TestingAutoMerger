// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    useProdMode: true,
    isSrEnvironment: false,
    appTitle: 'Poc 02',

    authority: 'https://test-login.softrig.com',
    client_id: '2327dc53-18a9-ecb8-4ad1-e854511a12d5',
    post_logout_redirect_uri: '/#/login',

    BASE_URL_INIT: '',
    BASE_URL: '',

    // If you add base urls here please also update the api check in header-interceptor.ts!
    BASE_URL_INTEGRATION: 'https://poc02-integration.softrig.com/',
    BASE_URL_FILES: 'https://poc02-files.softrig.com',
    UNI_JOB_SERVER_URL: 'https://poc02-jobserver.softrig.com/api/',
    ELSA_SERVER_URL: 'https://poc02-admin.softrig.com',
    SIGNALR_PUSHHUB_URL: 'https://poc02-signal.softrig.com/pushHub',

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

    RAYGUN_API_KEY: '2bnHvsLXLQX13qrSl8IkLw',
    APP_INSIGHTS_KEY: 'db2aa846-3191-4c46-9e50-5b5343901840',

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

