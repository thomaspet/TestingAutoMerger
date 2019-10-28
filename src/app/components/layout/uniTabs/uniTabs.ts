import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute, Event, NavigationEnd} from '@angular/router';

export interface IUniTab {
    name: string;
    path?: string;
    hidden?: boolean;
    tooltip?: string;
    value?: any;
    count?: number;
    onClick?: () => void;
    tooltipIcon?: string;
    tooltipClass?: string;
}

@Component({
    selector: 'uni-tabs',
    template: `
        <mat-tab-group
            *ngIf="!useRouterLinkTabs"
            [(selectedIndex)]="activeIndex"
            (selectedIndexChange)="onTabActivated($event)">

            <mat-tab *ngFor="let tab of filteredTabs">
                <ng-template mat-tab-label>
                    {{tab[labelProperty]}}
                    <strong>{{tab[counterProperty]}}</strong>

                    <i class="material-icons tab-tooltip {{tab.tooltipClass || ''}}" *ngIf="tab.tooltip" matTooltip="{{tab.tooltip}}">
                        {{tab.tooltipIcon || 'info'}}
                    </i>
                </ng-template>
            </mat-tab>
        </mat-tab-group>
        <nav mat-tab-nav-bar *ngIf="useRouterLinkTabs">
            <a mat-tab-link
                *ngFor="let tab of filteredTabs; let i = index;"
                [routerLink]="tab.path"
                routerLinkActive
                #rla="routerLinkActive"
                [active]="rla.isActive"
                (click)="onTabActivated(i)">
                {{ tab.name }}
            </a>
        </nav>
    `
})
export class UniTabs {
    @Input() public tabs: IUniTab[];
    @Input() public queryParamsHandling: 'merge' | 'preserve' | '' = '';
    @Input() public labelProperty: string = 'name';
    @Input() public counterProperty: string = 'count';

    @Input() public activeIndex: number;
    @Input() public useRouterLinkTabs: boolean = false;

    @Output() public activeIndexChange: EventEmitter<number> = new EventEmitter(false);
    @Output() public tabClick: EventEmitter<IUniTab> = new EventEmitter(false);

    public filteredTabs: IUniTab[];

    constructor(private router: Router, private route: ActivatedRoute) {}

    public ngOnChanges(changes) {
        if (changes['tabs'] && this.tabs) {
            this.filteredTabs = this.tabs.filter(tab => !tab.hidden);

            if (this.tabs.some(tab => !!tab.path)) {
                const url = window.location.href;
                const activeIndex = this.filteredTabs.findIndex(route => {
                    return url.includes(route.path);
                });

                this.activeIndex = activeIndex >= 0 ? activeIndex : 0;
            }
        }
    }

    public onTabActivated(index: number) {
        const tab = this.filteredTabs[index];

        if (!tab) {
            return;
        }

        if (tab.path) {
            this.router.navigate([tab.path], {
                relativeTo: this.route,
                queryParamsHandling: this.queryParamsHandling
            });
            this.tabClick.emit(tab);
        } else {
            this.activeIndexChange.emit(index);
            this.tabClick.emit(tab);
        }

        if (tab.onClick) {
            setTimeout(() => tab.onClick());
        }
    }
}
