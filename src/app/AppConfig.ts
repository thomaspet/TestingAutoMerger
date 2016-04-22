import {CONST_EXPR} from 'angular2/src/facade/lang';

export const AppConfig = CONST_EXPR({
    //BASE_URL: 'http://devapi.unieconomy.no:80',
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
