import {Component, Input, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Subject, fromEvent} from 'rxjs';
import {takeUntil, debounceTime} from 'rxjs/operators';
import {FeaturePermissionService} from '@app/featurePermissionService';
import { theme } from 'src/themes/theme';

export interface IUniTab {
    name: string;
    featurePermission?: string;
    path?: string;
    queryParams?: {[key: string]: any};
    disabled?: boolean;
    tooltip?: string;
    tooltipIcon?: string;
    tooltipClass?: string;
    hideTooltipWithoutCount?: boolean;
    themeOnlyTooltip?: string;
    value?: any;
    count?: number;
    onClick?: () => void;

    /**
        Hides the tab without altering indexes,  so for example *ngIf="activeTabIndex === 4"
        means tab 4 is active, regardless of if tab 1, 2 and 3 are visible or hidden to the user.
    */
    hidden?: boolean;
}

@Component({
    selector: 'uni-tabs',
    templateUrl: './uni-tabs.html',
    styleUrls: ['./uni-tabs.sass']
})
export class UniTabs {
    @ViewChild('tabContainer', { static: true }) tabContainer: ElementRef<HTMLElement>;

    @Input() tabs: IUniTab[];
    @Input() queryParamsHandling: 'merge' | 'preserve' | '' = '';
    @Input() labelProperty: string = 'name';
    @Input() counterProperty: string = 'count';

    @Input() activeIndex: number;
    @Input() useRouterLinkTabs: boolean = false;

    @Output() activeIndexChange: EventEmitter<number> = new EventEmitter(false);
    @Output() tabClick: EventEmitter<IUniTab> = new EventEmitter(false);

    onDestroy$ = new Subject();
    overflowIndex: number;
    pathMatchExact: boolean;

    currentTheme = theme.theme;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private featurePermissionService: FeaturePermissionService
    ) {}

    ngOnChanges(changes) {
        if (changes['tabs'] && this.tabs) {
            if (this.tabs.some(tab => !!tab.path)) {
                const url = window.location.href;
                const activeIndex = this.tabs.findIndex(route => {
                    return url.includes(route.path);
                });

                this.activeIndex = activeIndex >= 0 ? activeIndex : 0;
            }

            if (this.tabs.some(tab => !!tab.queryParams)) {
                this.pathMatchExact = true;
            }

            this.tabs.forEach(tab => {
                tab['_hasFeaturePermission'] = !tab.featurePermission
                    || this.featurePermissionService.canShowUiFeature(tab.featurePermission);
            });

            setTimeout(() => {
                this.checkOverflow();
            }, 200);
        }
    }

    ngAfterViewInit() {
        fromEvent(window, 'resize').pipe(
            takeUntil(this.onDestroy$),
            debounceTime(100)
        ).subscribe(() => this.checkOverflow());
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private checkOverflow() {
        setTimeout(() => {
            const hadDropdownBeforeCheck = this.overflowIndex >= 0;
            const tabContainer = this.tabContainer.nativeElement;
            const offsetTop = tabContainer.getBoundingClientRect().top;

            const overflowIndex = Array.from(tabContainer.children).findIndex(tab => {
                const offset = tab.getBoundingClientRect().top - offsetTop;
                // > 5 to avoid borders and such messing with the calculation
                // The offsett will be much bigger on actual overflow
                return offset > 5;

                // return tab.getBoundingClientRect().top > offsetTop;
            });

            this.overflowIndex = overflowIndex;
            this.cdr.markForCheck();

            // If the dropdown wasn't visible before this check we need to
            // run it again after setting overflowIndex, in case the dropdown
            // toggle caused another item to overflow
            if (overflowIndex >= 0 && !hadDropdownBeforeCheck) {
                this.checkOverflow();
            }
        });
    }

    onTabClick(tab: IUniTab) {
        const index = this.tabs.findIndex(t => t === tab);

        if (!tab || tab.disabled || !(index >= 0)) {
            return;
        }

        this.activeIndex = index;

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
