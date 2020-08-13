import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Router} from '@angular/router';
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
            Nylig besøkt:
        </span>

        <section *ngIf="collapseTabs && tabs?.length" class="tab-dropdown">
            <span #trigger>
                {{lastActiveTab?.name | translate}}
                <i class="material-icons" *ngIf="tabs.length > 1">expand_more</i>
            </span>

            <dropdown-menu *ngIf="tabs.length > 1" [trigger]="trigger">
                <ng-template>
                    <section *ngFor="let tab of tabs; let idx = index" (click)="activateTab(idx)" class="dropdown-menu-item">
                        {{tab?.name | translate}}
                    </section>
                </ng-template>
            </dropdown-menu>
        </section>

        <ul *ngIf="!collapseTabs" class="navbar_tabs">
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
        </ul>

        <section class="dropdown-menu right-click-menu"
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
    private lastActiveTab: IUniTab;

    public collapseTabs: boolean;
    private onDestroy$ = new Subject();

    public tabContextMenu: ITabContextMenuData;

    constructor(
        private router: Router,
        private tabService: TabService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) {
        this.authService.companyChange.subscribe(() => {
            this.tabService.removeAllTabs();
        });

        this.collapseTabs = window.innerWidth <= 1250;
        Observable.fromEvent(window, 'resize')
            .takeUntil(this.onDestroy$)
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
            .takeUntil(this.onDestroy$)
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
        this.onDestroy$.next();
        this.onDestroy$.complete();
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
