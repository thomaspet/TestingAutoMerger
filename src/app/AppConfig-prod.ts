export const AppConfig = ({
    // Allow developers to work with localhost backend.
    // Let this stay as long we want to support local backend.
    // When removed, remember to change BASE_URL_INIT to BASE_URL in authService.ts.
    // and stop switching between BASE_URL/BASE_URL_INIT in UniHttp usingFooDomain() functions
    // BASE_URL_INIT: 'http://localhost:82',
    BASE_URL_INIT: 'https://api.unieconomy.no/',

    // Swap between these BASE_URL's depending on whether you want to use local og remote backend
    // BASE_URL: 'http://localhost:29077',
    BASE_URL: 'https://api.unieconomy.no/',

    // BASE_URL_INTEGRATION: 'http://localhost:17100/',
    BASE_URL_INTEGRATION: 'https://integration.unieconomy.no/',

    BASE_URL_FILES: 'https://unifiles.unieconomy.no/',

    UNI_PUSH_ADAPTER_URL: 'https://unipushadapter.azurewebsites.net',

    UNI_JOB_SERVER_URL: 'https://devapi-unijobserver.azurewebsites.net/api/',

    API_DOMAINS: {
        INIT: '/api/init/',
        BUSINESS: '/api/biz/',
        ROOT: '/api/',
        METADATA: '/api/metadata/',
        STATISTICS: '/api/statistics/',
        UMH: '/api/umh/'
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

    STIMULSOFT_LICENSE:
        '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHm9kIr/LY1/iXB4ilMpkOOkd68HwR5Y+vdLYUNEgsC45Zw6Pj' +
        'USH8tF8fpePU0iT3wt8cVZLUguU/riltt8+RZXSTYNTuP85llBt+vEOlO1ulT8QkpApUAxEWklMWmBiAOPwNupy8N1' +
        '7NGa3ambPSrXDQzZy2DnWwDRF8u9KmH7P+Sh3nbMBf9QYGEcCc9f9Uiw4eayiCxaAycqFgQEK/GseGJdo7zcoglKoT' +
        'uSB1CNC6agtAfsEkS32quBJuDWM2wffezK8whbE62wweUL5o5ipZ+LlHGi0ouyzqyJo6EJtjKlEjShXnZfAeA8uSMy' +
        'mUJ1/Q9pXiV+8rsx2TPuscs7RQGN426KFUpYP2AanRvMuaBbzQv2hT0f4VDWqodLDg9bJ6rqsLRVsXq1VcJBn06pXz' +
        'ltVT7ixgwOymCVNSLqLQQ5G6Zqlqcn94V3PgmDfDFQMVkvkmvrWx0FYt09FrYD6xfxCAh6Zw+KvidjOYE4tf3avff/' +
        'mrAa++1T6S0tlIcQv5t3RyqRriWjJsPASVOv0fT9MxILiZwGJrJ1f2o9NDe+Z7oEkfnl3vcYm2MIy+XQQL8cI1pEhW' +
        'vwAmH0CibEPnMyS2MEy02lKd2e1t+6GLGDlv1E63NFeeH3SN28yYnhTHL+nWn71biAi9rhcKRJu3gAhfWBthrrr//H' +
        'ilNRSaFizgl/t2VKNEqNaHiG7goduv8kGCYbEZXnha7yjVnqS/bvqkS97UxhIyP7JI/CHjD/7uyjRRe8hNEptMf0wi' +
        'k='
});
