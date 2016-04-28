import {CONST_EXPR} from 'angular2/src/facade/lang';

export const AppConfig = CONST_EXPR({
    // Allow developers to work with localhost backend.
    // Let this stay as long we want to support local backend.
    // When removed, remember to change BASE_URL_INIT to BASE_URL in authService.ts.
    BASE_URL_INIT: 'https://devapi-unieconomy.azurewebsites.net',
    
    // Swap between these BASE_URL's depending on whether you want to use local og remote backend
    //BASE_URL: 'http://localhost:27831',
    BASE_URL: 'https://devapi-unieconomy.azurewebsites.net',
    
    API_DOMAINS: {
        INIT : '/api/init/',
        BUSINESS: '/api/biz/',
        METADATA: '/api/metadata/',
    },
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Client': 'economytestas'
    }
});
