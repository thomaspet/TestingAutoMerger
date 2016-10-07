export const AppConfig = ({
    // Allow developers to work with localhost backend.
    // Let this stay as long we want to support local backend.
    // When removed, remember to change BASE_URL_INIT to BASE_URL in authService.ts.
    // and stop switching between BASE_URL/BASE_URL_INIT in UniHttp usingFooDomain() functions
    // BASE_URL_INIT: 'http://localhost:82',
    BASE_URL_INIT: 'https://devapi-unieconomy.azurewebsites.net',

    // Swap between these BASE_URL's depending on whether you want to use local og remote backend
    BASE_URL: 'http://localhost:29077',
    // BASE_URL: 'https://devapi-unieconomy.azurewebsites.net',

    // BASE_URL_INTEGRATION: 'http://localhost:17100/',
    BASE_URL_INTEGRATION: 'https://devintegrations-unieconomy.azurewebsites.net/',

    API_DOMAINS: {
        INIT: '/api/init/',
        BUSINESS: '/api/biz/',
        ROOT: '/api/',
        METADATA: '/api/metadata/',
        STATISTICS: '/api/statistics/'
    },

    INTEGRATION_DOMAINS: {
        ALTINN: '/api/altinn/'
    },

    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Client': 'economytestas'
    },

    STYLES_SRC: '/styles/',
    ASSETS_SRC: '/assets/',
    APP_SRC: '/app/',
    COMPONENTS_SRC: '/app/components/',
    DATA_SRC: '/app/components/',
    MODELS_SRC: '/app/components/',
    SERVICES_SRC: '/app/components/',
    FRAMEWORK_SRC: '/framework/',
});
