import {CONST_EXPR} from "angular2/src/facade/lang";

export const AppConfig = CONST_EXPR({
    //BASE_URL: "http://devapi.unieconomy.no:80",
    BASE_URL: "http://localhost:27831",
    API_DOMAINS: {
        BUSINESS: '/api/biz/',
        METADATA: '/api/metadata/'
    },
    DEFAULT_HEADERS: {
        "Client": "client1"
    }
});