import {CONST_EXPR} from 'angular2/src/facade/lang';

export const AppConfig = CONST_EXPR({
    //BASE_URL: 'http://devapi.unieconomy.no:80',
    LOGIN_URL: 'http://devapi.unieconomy.no/api/init/sign-in',
    BASE_URL: 'http://devapi.unieconomy.no/',
    API_DOMAINS: {
        INIT : '/api/init/',
        BUSINESS: '/api/biz/',
        METADATA: '/api/metadata/'
    },
    DEFAULT_HEADERS: {
        'Client': 'economytestas'
    }
});
