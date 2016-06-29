export const AppConfig = ({
    // Allow developers to work with localhost backend.
    // Let this stay as long we want to support local backend.
    // When removed, remember to change BASE_URL_INIT to BASE_URL in authService.ts.
    // and stop switching between BASE_URL/BASE_URL_INIT in UniHttp usingFooDomain() functions
    //BASE_URL_INIT: 'http://localhost:82',
    BASE_URL_INIT: 'https://devapi-unieconomy.azurewebsites.net',
    
    // Swap between these BASE_URL's depending on whether you want to use local og remote backend
    //BASE_URL: 'http://localhost:29077',
    BASE_URL: 'https://devapi-unieconomy.azurewebsites.net',
    
    
    // BASE_URL_INTEGRATION: 'http://localhost:17100/',
    BASE_URL_INTEGRATION: 'http://devintegrations-unieconomy.azurewebsites.net/', 

    API_DOMAINS: {
        INIT: '/api/init/',
        BUSINESS: '/api/biz/',
        METADATA: '/api/metadata/',
    },
    
    INTEGRATION_DOMAINS: {
        ALTINN: '/api/altinn/'
    },
    
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Client': 'economytestas'
    }
});
