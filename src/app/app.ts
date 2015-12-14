/// <reference path="../../kendo/typescript/kendo.all.d.ts" />
import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {Routes, APP_ROUTES} from './route.config';
import {UniRouterOutlet} from './uniRouterOutlet';

@Component({
  selector: 'uni-app',
  templateUrl: './app/app.html',
  directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(APP_ROUTES)
export class App {
  public title = 'Uni Economy';
  public routes = Routes;
}
