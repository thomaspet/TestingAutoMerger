import {CONST_EXPR} from 'angular2/src/facade/lang';

export const AppConfig = CONST_EXPR({
    // Hacky solution for making frontend work with localhost backend.
    // Used in authService. Remember to revert to BASE_URL there when this is removed!
    BASE_URL_INIT: 'https://devapi-unieconomy.azurewebsites.net',
    
    BASE_URL: 'http://localhost:27831',
    // BASE_URL: 'https://devapi-unieconomy.azurewebsites.net',
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
