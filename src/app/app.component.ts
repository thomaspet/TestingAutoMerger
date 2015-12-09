/// <reference path="../../kendo/typescript/kendo.all.d.ts" />
import {Component} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {Routes, APP_ROUTES} from './route.config';
import {UniRouterOutlet} from './uniRouterOutlet';

@Component({
  selector: 'my-app',
  templateUrl: './app/templates/nav.html',
  directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(APP_ROUTES)
export class AppComponent {
  public title = 'Uni Economy';
  public routes = Routes;
}
