export const AppConfig = ({
    BASE_URL_INIT: 'https://devapi-unieconomy.azurewebsites.net',

    BASE_URL: 'https://devapi-unieconomy.azurewebsites.net',

    BASE_URL_INTEGRATION: 'https://devintegrations-unieconomy.azurewebsites.net/',

    BASE_URL_FILES: 'https://unifiles.azurewebsites.net/',

    UNI_PUSH_ADAPTER_URL: 'https://devapi-unipushadapter.azurewebsites.net',

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
