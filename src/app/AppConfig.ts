import {CONST_EXPR} from 'angular2/src/facade/lang';

export const AppConfig = CONST_EXPR({
    //BASE_URL: 'http://devapi.unieconomy.no:80',
    BASE_URL: 'http://devapi-unieconomy.azurewebsites.net',
    API_DOMAINS: {
        BUSINESS: '/api/biz/',
        METADATA: '/api/metadata/',
        INIT: '/api/init/'
    },
    DEFAULT_HEADERS: {
        'Client': 'economytestas'
    }
});
