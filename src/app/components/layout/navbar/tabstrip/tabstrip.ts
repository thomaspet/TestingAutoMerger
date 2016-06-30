import {Component} from '@angular/core';
import {NgClass} from '@angular/common';
import {ROUTER_DIRECTIVES, Router} from '@angular/router-deprecated';
import {TabService} from './tabService';
import {AuthService} from '../../../../../framework/core/authService';

export interface IUniTab {
    url: string;
    name: string;
    active?: boolean;
    moduleID?: number;
}

@Component({
    selector: 'uni-tabstrip',
    template: `
        <ol class="navbar_tabs">
            <li *ngFor="let tab of tabService.tabs; let i = index" (click)="activateTab(tab, i)" [ngClass]="{'router-tab-active': tab.active, '': !tab.active}">
                {{tab.name}}
                <span class="close" (click)="closeTab(tab, i)"></span>
            </li>
        </ol>
    `,
    directives: [ROUTER_DIRECTIVES, NgClass]
})
export class UniTabStrip {

    constructor(private router: Router, private tabService: TabService, authService: AuthService) {
        authService.companyChanged$.subscribe((change) => {
            this.tabService.removeAllTabs();
        });
    }

    private activateTab(tab: IUniTab, index: number): void {
        // Removes active class on previous active
        this.tabService.currentActiveTab.active = false;

        // Adds active class to new active tab.
        this.tabService.setTabActive(index);

        // Navigates to new active tab
        this.router.navigateByUrl(tab.url);
    }

    private closeTab(tab: IUniTab, index: number): void {
        var newTab = this.tabService.removeTab(tab, index);
        if (newTab.name !== this.tabService.currentActiveTab.name) {
            this.tabService.addTab(newTab);
            this.router.navigateByUrl(newTab.url);
        }
    }

}