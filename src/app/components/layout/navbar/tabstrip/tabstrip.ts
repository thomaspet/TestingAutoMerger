import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {TabService, UniModules} from './tabService';
import {AuthService} from '../../../../authService';
import {Observable} from 'rxjs';
import {Subject} from 'rxjs';

export interface IUniTab {
    url: string;
    name: string;
    moduleID?: UniModules;
    active?: boolean;
}

interface ITabContextMenuData {
    top: number;
    left: number;
    index: number;
}

@Component({
    selector: 'uni-tabstrip',
    template: `
        <span class="tabstrip-description" *ngIf="tabs?.length">
            Nylig brukt:
        </span>

        <ul class="navbar_tabs">
            <!-- Collapsed tabs -->
            <ng-template [ngIf]="collapseTabs" [ngIfElse]="tabsExpanded">
                <li *ngIf="tabs?.length"
                    class="collapsed-tab-container"
                    [ngClass]="{'router-tab-active': lastActiveTab?.active}"
                    (click)="collapsedTab">

                    {{lastActiveTab?.name | translate}}

                    <ul class="collapsed-tab-list">
                        <li *ngFor="let tab of tabs; let idx = index"
                            (click)="activateTab(idx)"
                            [ngClass]="{'active': tab.active}">

                            {{tab?.name | translate}}
                            <i (click)="closeTab(idx, $event)" class="material-icons close-tab">
                                close
                            </i>
                        </li>
                    </ul>
                </li>
            </ng-template>

            <!-- Expanded tabs (ng else) -->
            <ng-template #tabsExpanded>
                <li *ngFor="let tab of tabs; let idx = index"
                    (click)="activateTab(idx)"
                    (mousedown)="onMouseDown(idx, $event)"
                    (contextmenu)="openContextMenu($event, idx)"
                    [ngClass]="{'router-tab-active': tab.active}">

                    {{tab.name | translate }}
                    <i (click)="closeTab(idx, $event)" class="material-icons close-tab">
                        close
                    </i>
                </li>
            </ng-template>
        </ul>

        <section class="dropdown-menu"
            *ngIf="tabContextMenu"
            (clickOutside)="closeContextMenu()"
            [ngStyle]="{
                left: tabContextMenu.left + 'px',
                top: tabContextMenu.top + 'px'
            }">

            <section class="dropdown-menu-item" (click)="contextMenuClick(tabContextMenu.index, 'tab')">
                Lukk fane
            </section>
            <section class="dropdown-menu-item" (click)="contextMenuClick(tabContextMenu.index, 'left')">
                Lukk faner til venstre
            </section>
            <section class="dropdown-menu-item" (click)="contextMenuClick(tabContextMenu.index, 'right')">
                Lukk faner til høyre
            </section>
            <section class="dropdown-menu-item" (click)="contextMenuClick(tabContextMenu.index, 'others')">
                Lukk alle andre faner
            </section>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTabStrip {
    public tabs: IUniTab[] = [];
    private homeTabActive: boolean;
    private lastActiveTab: IUniTab;

    public collapseTabs: boolean;
    private componentDestroyedSubject: Subject<any> = new Subject();

    public tabContextMenu: ITabContextMenuData;

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
                const collapseTabs = window.innerWidth <= 1250;

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
                const activeTab = tabs.find(tab => tab.active);
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

    public onMouseDown(index: number, event: MouseEvent) {
        if (event.button === 1) {
            // Middle mouse button
            event.preventDefault();
            this.tabService.closeTab(index);
        }
    }

    public openContextMenu(event: MouseEvent, index: number) {
        event.preventDefault();

        this.tabContextMenu = {
            top: event.clientY,
            left: event.clientX,
            index: index
        };

        this.cdr.markForCheck();
    }

    public contextMenuClick(index: number, type: 'tab'|'left'|'right'|'others') {
        this.closeContextMenu();

        switch (type) {
            case 'tab':
                this.tabService.closeTab(index);
            break;
            case 'left':
                this.tabService.closeLeftOf(index);
            break;
            case 'right':
                this.tabService.closeRightOf(index);
            break;
            case 'others':
                this.tabService.closeAllOthers(index);
            break;
        }
    }

    public closeContextMenu() {
        this.tabContextMenu = undefined;
        this.cdr.markForCheck();
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
