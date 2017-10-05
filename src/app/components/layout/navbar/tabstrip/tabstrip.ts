import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {TabService, UniModules} from './tabService';
import {AuthService} from '../../../../authService';
import {Subscription} from 'rxjs/Subscription';

export interface IUniTab {
    url: string;
    name: string;
    moduleID?: UniModules;
    active?: boolean;
}

@Component({
    selector: 'uni-tabstrip',
    template: `
        <ol class="navbar_tabs">
            <li class="home-tab" title="Hjem"
                (click)="activateHomeTab()"
                [ngClass]="{'router-tab-active': homeTabActive}">
            </li>
            <ng-template ngFor let-tab let-idx="index" [ngForOf]="tabs">
                <li
                    (click)="activateTab(idx)"
                    (mousedown)="possiblyCloseTab(idx, $event)"
                    [ngClass]="{'router-tab-active': tab.active}"
                    [title]="tab.name">
                    {{tab.name}}
                    <span class="close" (click)="closeTab(idx, $event)"></span>
                </li>
            </ng-template>
        </ol>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTabStrip {
    private tabs: IUniTab[] = [];
    private tabSubscription: Subscription;
    private navigationSubscription: Subscription;
    private homeTabActive: boolean;

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

        this.navigationSubscription = this.router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe((navigationEvent: NavigationEnd) => {
                this.homeTabActive = navigationEvent.url === '/';
                this.cdr.detectChanges();
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
        this.navigationSubscription.unsubscribe();
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

    public activateHomeTab() {
        this.router.navigateByUrl('/');
    }

    public closeTab(index: number, event?: MouseEvent): void {
        if (event) {
            event.stopPropagation();
        }

        this.tabService.closeTab(index);
    }
}
