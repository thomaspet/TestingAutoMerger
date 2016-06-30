import {Component, Input} from '@angular/core';
import {RouteDefinition, ROUTER_DIRECTIVES} from '@angular/router-deprecated';

@Component({
    selector: 'uni-tabs',
    template: `
        <ul>
            <li *ngFor="let route of routes">
                <a [routerLink]="['./' + route.name]">{{route.name}}</a>  <!-- TODO: i18n --> 
            </li>
        </ul>
    `,
    directives: [ROUTER_DIRECTIVES]
})
export class UniTabs {
    @Input() public routes: RouteDefinition[];
}
