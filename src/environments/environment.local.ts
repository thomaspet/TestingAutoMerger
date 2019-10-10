export const environment = {
    useProdMode: false,

    authority: 'https://dev-login.unieconomy.no',
    client_id: '83ccca75-77d9-e08f-7d35-e60bb6a70628',
    redirect_uri: '/assets/auth.html',
    post_logout_redirect_uri: '/#/login', // URL that the pop up afeter user log out
    silent_redirect_uri: '/assets/silent-renew.html',
    automaticSilentRenew: true,
    response_type: 'id_token token',
    scope: 'openid profile AppFramework',
    // tslint:disable-next-line:max-line-length
    filterProtocolClaims: true, // prevents protocol level claims such as nbf, iss, at_hash, and nonce from being extracted from the identity token as profile data
    loadUserInfo: true,

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

    STIMULSOFT_LICENSE: '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHlQ9nKHW5xxs/tCjGsgWb6rWj7uUX3wCSckA495fAQHHkM8hO'
        + '+uFiXxRz+4NUYE2gKuBss/plBZutOtsinTBHyJQeXyv4BUK1Zn6BNv/nahgb+IyNQTTIuPeptIs83z6auntAOO0Y2+'
        + '0Fqi3RR8tP9UxKLcxqIvqgaBZc0zSHe1oho22a0Jw5J7c39OasrRo34cWAnnwAzV9PVCJdn3ZOuq2g9/8vUPXMJ4d5'
        + 'rNPBt0ecy4574bbFadNGYxiuYPlhZJqC2gcdXSKLk4dfPPyxOrLw4jrXcATnkwUZIl6+QJA4gA5OC6w7oXfuKTrYjB'
        + '47cq1s2GuBfAjg0i9/GQvosPwPwr1KjELc8TGJflBD59Ls0YEYCRx3VNCWkoPiJny8TwBbhVWXlMPkCac/xkqojKoI'
        + '3PgKoHZNTPA7cwEV5eFBV7rIogCVaAf/yrDYSspoaS77Xa99qv0oWIPvKZpta/x59Y47bqzZ5SGYestTSxmxlfvSGa'
        + 'yXbhqZkmPRK07NnOKmeuxknE+/RywyCQZS9svfkZT1Jn0m0xdX4+rwma2fTSCluY4fUEF38fhNFj/keKeLIwIMwSOh'
        + 'Ypv0Eu/SeTn6DSEWgBGcW2jbWadOO+CmGAOg1XfM82jGlN68wfGjsNNswAez71QNSnBvMrFVsRFGDq+K/zAYRavq23'
        + 'xzCJ9QnukzFeuN1Juxtg3y2tRiJYPJyyrwHGhTY550oa1AP/trUev/gvk4gpFyGpAoFR8jca5GAGEDyTf2pi44J/S78=',

    IMPORT_CENTRAL_TEMPLATE_URLS : {
        CUSTOMER: 'https://public-files.unieconomy.no/files/import/CustomerTemplateFinal.xlsx',
        SUPPLIER: 'https://public-files.unieconomy.no/files/import/SupplierTemplateFinal.xlsx',
        PRODUCT: 'https://public-files.unieconomy.no/files/import/ProductTemplateFinal.xlsx',
        MAIN_LEDGER: 'https://public-files.unieconomy.no/files/import/MainLedgerTemplate.xlsx',
        PAYROLL: 'https://public-files.unieconomy.no/files/import/PayrollTemplate.xlsx'
    }
};
