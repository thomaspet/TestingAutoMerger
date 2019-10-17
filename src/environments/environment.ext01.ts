export const environment = {
    useProdMode: true,

    // Identity Server Settings
    authority: 'https://login.unieconomy.no',
    client_id: '07f72612-d349-9e40-33ba-eaefdd6fde3c',
    redirect_uri: '/assets/auth.html',
    post_logout_redirect_uri: '/#/login', // URL that the pop up afeter user log out
    silent_redirect_uri: '/assets/silent-renew.html',
    automaticSilentRenew: true,
    response_type: 'id_token token',
    scope: 'profile openid AppFramework AppFramework.All',
    // tslint:disable-next-line:max-line-length
    filterProtocolClaims: true, // prevents protocol level claims such as nbf, iss, at_hash, and nonce from being extracted from the identity token as profile data
    loadUserInfo: true,

    BASE_URL_INIT: '',
    BASE_URL: '',
    BASE_URL_INTEGRATION: 'https://ext01-integration.unieconomy.no/',
    BASE_URL_FILES: 'https://ext01-files.unieconomy.no',
    UNI_JOB_SERVER_URL: 'https://ext01-jobserver.unieconomy.no/api/',
    ELSA_SERVER_URL: 'https://ext01-admin.unieconomy.no',
    SIGNALR_PUSHHUB_URL: 'https://ext01-signal.unieconomy.no/pushHub',
    BOOST_AI_SCRIPT_URL: 'https://435984srpoc.boost.ai/chatPanel/chatPanel.js',
    BOOST_AI_API_URL: 'https://435984srpoc.boost.ai/api',

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
        CUSTOMER: 'https://ext01-public-files.unieconomy.no/files/import/CustomerTemplateFinal.xlsx',
        SUPPLIER: 'https://ext01-public-files.unieconomy.no/files/import/SupplierTemplateFinal.xlsx',
        PRODUCT: 'https://ext01-public-files.unieconomy.no/files/import/ProductTemplateFinal.xlsx',
        MAIN_LEDGER: 'https://ext01-public-files.unieconomy.no/files/import/MainLedgerTemplate.xlsx',
        PAYROLL: 'https://ext01-public-files.unieconomy.no/files/import/PayrollTemplate.xlsx'
    }
};
