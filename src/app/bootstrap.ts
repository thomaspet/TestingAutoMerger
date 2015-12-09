import {bootstrap, provide} from 'angular2/angular2';
import {HashLocationStrategy, LocationStrategy, ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {App} from './app';

bootstrap(App, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    provide(LocationStrategy, { useClass: HashLocationStrategy}),
]);