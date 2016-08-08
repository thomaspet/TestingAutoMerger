import {Component, Input} from '@angular/core';
import {Router, Event} from '@angular/router';
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
    directives: [ROUTER_DIRECTIVES, RouterLinkActive],
})
export class UniTabs {
    @Input() public routes: IUniTabsRoute[];

    constructor(router: Router) {
        // When the user navigates we force routerLink to refresh
        // due to 'this.routes' getting a new memory address.
        // This fixes issue where navigating to the same component with different
        // route param would cause routerLink to point to the wrong param
        // f.ex employees/4 when we navigated back to employees/3
        router.events.subscribe((event: Event) => {
            if (this.routes) {
                this.routes = JSON.parse(JSON.stringify(this.routes));
            }
        });
    }
}
