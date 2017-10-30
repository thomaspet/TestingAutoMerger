import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {TabService, UniModules} from './tabService';
import {AuthService} from '../../../../authService';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

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

            <!-- Collapsed tabs -->
            <ng-template [ngIf]="collapseTabs" [ngIfElse]="tabsExpanded">
                <li *ngIf="tabs?.length"
                    class="collapsed-tab-container"
                    [ngClass]="{'router-tab-active': lastActiveTab?.active}"
                    (click)="collapsedTab">

                    {{lastActiveTab?.name}}

                    <ul class="collapsed-tab-list">
                        <li *ngFor="let tab of tabs; let idx = index"
                            (click)="activateTab(idx)"
                            [ngClass]="{'active': tab.active}">

                            {{tab?.name}}
                            <span class="close" (click)="closeTab(idx, $event)"></span>
                        </li>
                    </ul>
                </li>
            </ng-template>

            <!-- Expanded tabs (ng else) -->
            <ng-template #tabsExpanded>
                <li *ngFor="let tab of tabs; let idx = index"
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
    private homeTabActive: boolean;
    private lastActiveTab: IUniTab;

    private collapseTabs: boolean;
    private componentDestroyedSubject: Subject<any> = new Subject();

    constructor(
        private router: Router,
        private tabService: TabService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) {
        this.authService.companyChange.subscribe((change) => {
            this.tabService.removeAllTabs();
        });

        this.router.events
            .takeUntil(this.componentDestroyedSubject)
            .filter(event => event instanceof NavigationEnd)
            .subscribe((navigationEvent: NavigationEnd) => {
                this.homeTabActive = navigationEvent.url === '/';
                this.cdr.detectChanges();
            });

        Observable.fromEvent(window, 'keydown')
            .takeUntil(this.componentDestroyedSubject)
            .subscribe((event: KeyboardEvent) => {
                if (event.keyCode === 87 && event.altKey) {
                    this.tabService.closeTab();
                } else if (event.keyCode === 37 && event.altKey) {
                    this.tabService.activatePrevTab();
                } else if (event.keyCode === 39 && event.altKey) {
                    this.tabService.activateNextTab();
                }
            });

        this.collapseTabs = window.innerWidth <= 1250;
        Observable.fromEvent(window, 'resize')
            .takeUntil(this.componentDestroyedSubject)
            .throttleTime(200)
            .subscribe(event => {
                let collapseTabs = window.innerWidth <= 1250;

                // Only run change detection when layout changes
                if (collapseTabs !== this.collapseTabs) {
                    this.collapseTabs = collapseTabs;
                    this.cdr.detectChanges();
                }
            });
    }

    public ngAfterViewInit() {
        this.tabService.tabs$
            .asObservable()
            .takeUntil(this.componentDestroyedSubject)
            .subscribe((tabs) => {
                this.tabs = tabs;
                let activeTab = tabs.find(tab => tab.active);
                if (activeTab) {
                    this.lastActiveTab = activeTab;
                } else if (!this.lastActiveTab) {
                    this.lastActiveTab = tabs && tabs[0];
                }

                this.cdr.detectChanges();
            });
    }

    public ngOnDestroy() {
        this.componentDestroyedSubject.next();
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
