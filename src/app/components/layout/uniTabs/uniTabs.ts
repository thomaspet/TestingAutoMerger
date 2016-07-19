import {Component, Input} from '@angular/core';
import {ROUTER_DIRECTIVES, RouterLinkActive} from '@angular/router';

export interface IUniTabsRoute {
    name: string;
    path: string;
}

@Component({
    selector: 'uni-tabs',
    template: `
        <ul>
            <li *ngFor="let route of routes">
                <a [routerLink]="[route.path]" routerLinkActive="router-link-active">
                    {{route.name}} <!-- TODO: i18n -->
                </a>
            </li>
        </ul>
    `,
    directives: [ROUTER_DIRECTIVES, RouterLinkActive]
})
export class UniTabs {
    @Input() public routes: IUniTabsRoute[];
}
