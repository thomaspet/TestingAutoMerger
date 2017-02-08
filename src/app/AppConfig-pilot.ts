export const AppConfig = ({
    BASE_URL_INIT: 'https://pilot-api.unieconomy.no',

    BASE_URL: 'https://pilot-api.unieconomy.no',

    BASE_URL_INTEGRATION: 'https://pilot-integration.unieconomy.no/',

    BASE_URL_FILES: 'https://pilot-unifiles.unieconomy.no/',

    UNI_PUSH_ADAPTER_URL: null,

    UNI_MESSAGE_HUB_URL: 'https://pilot-unimessagehub.unieconomy.no',

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
        'Content-Type': 'application/json'
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
