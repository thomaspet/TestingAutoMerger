import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Router} from '@angular/router';
import {TabService, UniModules} from './tabService';
import {AuthService} from '../../../../../framework/core/authService';
import {Subscription} from 'rxjs/Subscription';

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
            <li *ngFor="let tab of tabs; let idx = index"
                (click)="activateTab(idx)"
                (mousedown)="possiblyCloseTab(idx, $event)"
                [ngClass]="{'router-tab-active': tab.active}">
                {{tab.name}}
                <span class="close" (click)="closeTab(idx)"></span>
            </li>
        </ol>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTabStrip {
    private tabs: IUniTab[] = [];
    private tabSubscription: Subscription;

    constructor(
        private router: Router,
        private tabService: TabService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) {
        window.addEventListener('keydown', (event) => {
            if (event.keyCode === 87 && event.altKey) {
                this.tabService.closeTab();
            } else if (event.keyCode === 37 && event.altKey) {
                this.tabService.activatePrevTab();
            } else if (event.keyCode === 39 && event.altKey) {
                this.tabService.activateNextTab();
            }
        });

        this.authService.companyChange.subscribe((change) => {
            this.tabService.removeAllTabs();
        });
    }

    public ngAfterViewInit() {
        this.tabSubscription = this.tabService.tabs$.subscribe((tabs) => {
            this.tabs = tabs;
            this.cdr.detectChanges();
        });
    }

    public ngOnDestroy() {
        this.tabSubscription.unsubscribe();
    }

    public possiblyCloseTab(index: number, event: MouseEvent) {
        // check for middle mouse button
        if (event.button === 1) {
            event.preventDefault();
            this.tabService.closeTab(index);
        }
    }

    public activateTab(index: number): void {
        this.tabService.activateTab(index);
    }

    public closeTab(index: number): void {
        this.tabService.closeTab(index);
    }

}
