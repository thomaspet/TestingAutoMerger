import {bootstrap} from 'angular2/angular2';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {HeroService} from './components/hero/hero.service';
import {AppComponent} from './app.component';
import {OrderSvc} from './components/order/orderSvc';

bootstrap(AppComponent, [ROUTER_PROVIDERS, HTTP_PROVIDERS, HeroService, OrderSvc]);
