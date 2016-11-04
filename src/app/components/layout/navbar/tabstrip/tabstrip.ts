import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {TabService, UniModules} from './tabService';
import {AuthService} from '../../../../../framework/core/authService';

export interface IUniTab {
    url: string;
    name: string;
    active?: boolean;
    moduleID?: UniModules;
}

@Component({
    selector: 'uni-tabstrip',
    template: `
        <ol class="navbar_tabs">
            <li *ngFor="let tab of tabService.tabs; let i = index"
                (click)="activateTab(tab, i)"
                (mouseup)="possiblyCloseTab(tab, i, $event)"
                [ngClass]="{'router-tab-active': tab.active, '': !tab.active}">
                {{tab.name}}
                <span class="close" (click)="closeTab(tab, i)"></span>
            </li>
        </ol>
    `
})
export class UniTabStrip {

    constructor(private router: Router, private tabService: TabService, authService: AuthService) {
        authService.companyChange.subscribe(change => this.tabService.removeAllTabs());

        window.addEventListener('keydown', (event) => {
            if (event.keyCode === 87 && event.altKey) {
                this.closeTab(this.tabService.currentActiveTab, this.tabService.currentActiveIndex);
            } else if (event.keyCode === 37 && event.altKey) {
                let newIndex = this.tabService.currentActiveIndex > 0 ? this.tabService.currentActiveIndex - 1 : this.tabService.tabs.length - 1;
                this.activateTab(this.tabService.tabs[newIndex], newIndex);
            } else if (event.keyCode === 39 && event.altKey) {
                let newIndex = this.tabService.currentActiveIndex >= this.tabService.tabs.length - 1 ? 0 : this.tabService.currentActiveIndex + 1;
                this.activateTab(this.tabService.tabs[newIndex], newIndex);
            }
        });

    }

    private possiblyCloseTab(tab: IUniTab, index: number, event: MouseEvent) {
        if (event.button === 1) {
            this.closeTab(tab, index);
        }
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
