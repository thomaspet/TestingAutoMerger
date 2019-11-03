import {
    Component,
    Input,
    ViewChild,
    ViewChildren,
    QueryList,
    ElementRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    EventEmitter,
} from '@angular/core';
import {Observable, Subject, interval} from 'rxjs';
import {cloneDeep} from 'lodash';
import * as $ from 'jquery';

import {UniWidget, IUniWidget} from './uniWidget';
import {CanvasHelper} from './canvasHelper';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {AuthService} from '../../authService';
import {WidgetDataService} from './widgetDataService';
import {NavbarLinkService} from '@app/components/layout/navbar/navbar-link-service';
import {environment} from 'src/environments/environment';

import {Chart} from 'chart.js';
import 'chartjs-plugin-datalabels';
Chart.defaults.global.plugins.datalabels.display = false;
Chart.defaults.global.defaultFontFamily = 'MuseoSans, Roboto';


import {
    SHORTCUT_LISTS,
    CHARTS,
    COUNTERS,
    MISC_WIDGETS
} from './configs/index';
import {takeUntil, throttleTime, debounceTime, finalize} from 'rxjs/operators';

export {IUniWidget} from './uniWidget';

interface IGridAnchor {
    valid: boolean;
    top: number;
    left: number;
    x: number;
    y: number;
}

export interface IResponsiveWidgetLayout {
    large: IUniWidget[];
    medium?: IUniWidget[];
    small?: IUniWidget[];
    xs?: IUniWidget[];
}

export interface IWidgetReference {
    x: number;
    y: number;
    widgetID: string;
    widthOverride?: number;
}

export interface DefaultWidgetLayout {
    large: IWidgetReference[];
    medium?: IWidgetReference[];
    small?: IWidgetReference[];
    xs?: IWidgetReference[];
}

enum LAYOUT_WIDTH {
    large = 12,
    medium = 9,
    small = 6,
    xs = 3
}

@Component({
    selector: 'uni-widget-canvas',
    templateUrl: './widgetCanvas.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniWidgetCanvas {
    @ViewChild('canvas') canvas: ElementRef;
    @ViewChildren(UniWidget) widgetElements: QueryList<UniWidget>;

    @Input() layoutName: string;
    @Input() defaultLayout: DefaultWidgetLayout;

    onDestroy$ = new Subject();

    companyName: string;
    links = [];

    layout: IResponsiveWidgetLayout;
    private layoutBackup: IResponsiveWidgetLayout;
    private unsavedChanges: boolean;
    editMode: boolean;
    currentSize: string;
    gridUnitInPx: number;
    widgetMargin: number;

    private mouseMove: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
    private drawAnchorCell: EventEmitter<IUniWidget> = new EventEmitter<IUniWidget>();
    gridAnchor: IGridAnchor;
    widgetSelectorItems: any[];

    private sidebarState: string;

    canvasHeight: number;

    isSrEnvironment = environment.isSrEnvironment;
    activeLinkLabel: string = 'Hjem';

    constructor(
        private cdr: ChangeDetectorRef,
        private toastService: ToastService,
        private authService: AuthService,
        private canvasHelper: CanvasHelper,
        private dataService: WidgetDataService,
        private navbarService: NavbarLinkService
    ) {
        // Clear cache on init
        this.dataService.clearCache();

        // Clear on a 10 min timer
        interval(600000).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
            this.dataService.clearCache();
            this.refreshWidgets();
        });

        this.widgetMargin = 10;

        this.authService.authentication$.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(auth => {
            if (auth.user && auth.activeCompany) {
                this.companyName = auth.activeCompany && auth.activeCompany.Name;

                this.links = [
                    { label: 'Hjem', url: '/' },
                    { label: 'Regnskap', url: '/accounting' },
                    { label: 'Salg', url: '/sales' },
                    { label: 'Lønn', url: '/salary' },
                    { label: 'Timer', url: '/timetracking' },
                    { label: 'Bank', url: '/bank' },
                ].filter(link => {
                    return this.authService.canActivateRoute(auth.user, link.url);
                });

                if (this.layout) {
                    this.canvasHelper.resetGrid();
                    const layout = this.canvasHelper.getSavedLayout(this.layoutName);
                    this.initializeLayout(layout);
                }
            }
        });

        Observable.fromEvent(window, 'resize').pipe(
            throttleTime(200),
            takeUntil(this.onDestroy$)
        ).subscribe(() => {
            if (this.defaultLayout) {
                if (this.editMode) {
                    this.save();
                }

                this.drawLayout();
            }
        });

        this.navbarService.sidebarState$.pipe(
            debounceTime(200),
            takeUntil(this.onDestroy$)
        ).subscribe(state => {
            if (this.sidebarState && this.sidebarState !== state) {
                this.drawLayout();
            }

            this.sidebarState = state;
        });

        this.initWidgetSelector();
    }

    ngOnChanges() {
        if (this.defaultLayout && this.layoutName) {
            // When in SR, show name of current dashboard instead of companyname..
            if (this.layoutName === 'dashboard') {
                this.activeLinkLabel = 'Hjem';
            } else {
                const active = this.links.find(link => link.url === ('/' + this.layoutName));
                if (active) {
                    this.activeLinkLabel = active.label;
                } else {
                    // Should never happen, but just in case!
                    this.activeLinkLabel = 'Startside';
                }
            }

            const layout = this.canvasHelper.getSavedLayout(this.layoutName);
            this.initializeLayout(layout);
        }
    }

    ngOnDestroy() {
        this.mouseMove.complete();
        this.drawAnchorCell.complete();

        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private initializeLayout(layout?: IResponsiveWidgetLayout) {
        if (!layout) {
            layout = this.buildResponsiveLayout(this.defaultLayout);
        }

        this.layout = layout;
        this.drawLayout();
    }

    refreshWidgets() {
        this.layout[this.currentSize] = cloneDeep(this.layout[this.currentSize]);
        this.canvasHelper.resetGrid();
        this.drawLayout();
    }

    private drawLayout() {
        let size;
        let numCols;

        if (window.innerWidth <= 650) {
            size = 'xs';
            numCols = LAYOUT_WIDTH.xs;
        } else if (window.innerWidth <= 1200) {
            size = 'small';
            numCols = LAYOUT_WIDTH.small;
        } else if (window.innerWidth <= 1600) {
            size = 'medium';
            numCols = LAYOUT_WIDTH.medium;
        } else {
            size = 'large';
            numCols = LAYOUT_WIDTH.large;
        }

        this.widgetMargin = window.innerWidth <= 1650 ? 10 : 18;

        if (this.currentSize !== size) {
            this.currentSize = size;
            this.canvasHelper.activateLayout(this.layout[size], numCols);
        }

        const width = this.canvas.nativeElement.clientWidth;
        this.gridUnitInPx = width / numCols;

        // Position widgets on the canvas
        const unpositioned = [];
        this.layout[size].forEach((w: IUniWidget) => {
            if (w.x >= 0 && w.y >= 0) {
                this.setWidgetPosition(w);
            } else {
                unpositioned.push(w);
            }
        });

        unpositioned.forEach((w: IUniWidget) => {
            const pos = this.canvasHelper.getNextAvailablePosition(w);
            if (pos) {
                w.x = pos.x;
                w.y = pos.y;
                this.setWidgetPosition(w);
            }
        });

        let maxY = 0;
        this.layout[size].forEach((widget: IUniWidget) => {
            const widgetY = widget.y + widget.height;
            if (widgetY > maxY) {
                maxY = widgetY;
            }
        });

        this.canvasHeight = maxY;

        // Timeout to make sure we trigger change detection when loading data from cache
        // (cache messes with change detection timing because its "too quick")
        setTimeout(() => {
            this.cdr.markForCheck();
        });
    }

    addWidget(widget) {
        let alreadyAdded = false;
        try {
            alreadyAdded = this.layout[this.currentSize].some(w => w.id === widget.id);
        } catch (e) {
            console.error(e);
        }

        if (alreadyAdded) {
            this.toastService.toast({
                title: 'Widgeten er allerede lagt til',
                type: ToastType.warn,
                duration: 3
            });
        } else {
            const position = this.canvasHelper.getNextAvailablePosition(widget);
            widget._editMode = true;

            if (position) {
                widget.x = position.x;
                widget.y = position.y;

                this.layout.small.push(widget);
                this.layout.medium.push(widget);
                this.layout.large.push(widget);
                this.unsavedChanges = true;
                this.setWidgetPosition(widget);
            } else {
                this.toastService.addToast('Det er ikke plass til denne widgeten', ToastType.warn, 10);
            }
        }
    }

    private setWidgetPosition(widget: IUniWidget) {
        widget._position = {
            top: this.gridUnitInPx * widget.y,
            left: this.gridUnitInPx * widget.x
        };

        this.canvasHelper.reserveGridSpace(widget);
        this.cdr.markForCheck();
    }

    toggleEditMode() {
        this.editMode = !this.editMode;

        if (this.editMode) {
            this.layoutBackup = cloneDeep(this.layout);
        } else {
            this.layoutBackup = undefined;
        }

        this.widgetElements.forEach(widget => widget.setEditMode(this.editMode));

        this.cdr.markForCheck();
    }

    cancelEdit() {
        if (this.unsavedChanges) {
            this.layout = this.layoutBackup;
            this.layout[this.currentSize].forEach(w => this.setWidgetPosition(w));

            this.canvasHelper.resetGrid();
            this.drawLayout();
        }

        this.unsavedChanges = false;
        this.toggleEditMode();
     }

    hardReset() {
        if (!confirm('Ønsker du å gå tilbake til standard layout? Dette vil fjerne alle dine endringer')) {
            return;
        }

        this.canvasHelper.removeLayout(this.layoutName);
        this.canvasHelper.resetGrid();
        this.unsavedChanges = false;
        this.toggleEditMode();

        this.initializeLayout();
    }

    save() {
        if (!this.layout || !this.unsavedChanges) {
            this.toggleEditMode();
            return;
        }

        this.canvasHelper.saveLayout(this.layoutName, this.layout);
        this.unsavedChanges = false;
        this.toggleEditMode();
    }

    startDrag(event: MouseEvent, widget: IUniWidget) {
        if (!this.editMode) {
            return;
        }
        event.preventDefault();
        const widgetElement = $(event.srcElement || event.target).closest('uni-widget')[0];

        const elemBounds = widgetElement.getBoundingClientRect();
        const canvasBounds = this.canvas.nativeElement.getBoundingClientRect();

        const offsetX = event.clientX - elemBounds.left;
        const offsetY = event.clientY - elemBounds.top;

        this.canvasHelper.releaseGridSpace(widget);

        this.mouseMove.pipe(
            throttleTime(5),
            takeUntil(Observable.fromEvent(document, 'mouseup').take(1)),
            finalize(() => this.stopDrag(widget))
        ).subscribe((moveEvent: MouseEvent) => {
            widget._position.left = moveEvent.clientX - canvasBounds.left - offsetX;
            widget._position.top = moveEvent.clientY - canvasBounds.top - offsetY;

            this.drawAnchorCell.next(widget);
        });

        this.drawAnchorCell.pipe(
            throttleTime(50),
        ).subscribe((w: IUniWidget) => {
            const gridIndex = this.canvasHelper.getClosestGridIndex(
                this.gridUnitInPx,
                w._position.top,
                w._position.left
            );

            if (gridIndex.x >= 0 && gridIndex.x < 12 && gridIndex.y >= 0 && gridIndex.y < 9) {
                this.gridAnchor = {
                    top: this.gridUnitInPx * gridIndex.y,
                    left: this.gridUnitInPx * gridIndex.x,
                    x: gridIndex.x,
                    y: gridIndex.y,
                    valid: (gridIndex.x + w.width - 1) < 12 && (gridIndex.y + w.height - 1) < 9
                };
            } else {
                this.gridAnchor = undefined;
            }
        });
    }

    stopDrag(widget: IUniWidget) {
        if (this.gridAnchor && this.gridAnchor.valid) {
            const collision = this.canvasHelper.findCollision(
                this.gridAnchor.y,
                this.gridAnchor.x,
                widget.height,
                widget.width
            );

            if (collision) {
                const collidingWidget = this.layout[this.currentSize].find((w: IUniWidget) => {
                    return w.x === this.gridAnchor.x && w.y === this.gridAnchor.y;
                });

                // If the colliding widget is same height/width we can swap their positions
                if (collidingWidget && collidingWidget.width === widget.width
                                    && collidingWidget.height === widget.height) {

                    collidingWidget.x = widget.x;
                    collidingWidget.y = widget.y;
                    this.setWidgetPosition(collidingWidget);

                    widget.x = this.gridAnchor.x;
                    widget.y = this.gridAnchor.y;
                }
            } else {
                widget.x = this.gridAnchor.x;
                widget.y = this.gridAnchor.y;
            }

            this.unsavedChanges = true;
        }

        this.setWidgetPosition(widget);
        this.gridAnchor = undefined;
    }

    onMouseMove(event: MouseEvent) {
        if (this.editMode) {
            this.mouseMove.next(event);
        }
    }

    onWidgetRemoved(widget: IUniWidget, index: number) {
        this.layout.large.splice(index, 1);
        this.layout.medium.splice(index, 1);
        this.layout.small.splice(index, 1);

        this.canvasHelper.releaseGridSpace(widget);
        this.unsavedChanges = true;
    }

    private buildResponsiveLayout(defaultLayout: DefaultWidgetLayout): IResponsiveWidgetLayout {
        if (!defaultLayout.medium) {
            defaultLayout.medium = defaultLayout.large;
        }

        if (!defaultLayout.small) {
            defaultLayout.small = defaultLayout.medium;
        }

        if (!defaultLayout.xs) {
            defaultLayout.xs = defaultLayout.small;
        }

        return {
            large: this.getWidgetsFromDefaultLayout(defaultLayout.large, LAYOUT_WIDTH.large),
            medium: this.getWidgetsFromDefaultLayout(defaultLayout.medium, LAYOUT_WIDTH.medium),
            small: this.getWidgetsFromDefaultLayout(defaultLayout.small, LAYOUT_WIDTH.small),
            xs: this.getWidgetsFromDefaultLayout(defaultLayout.xs, LAYOUT_WIDTH.xs),
        };
    }

    getWidgetsFromDefaultLayout(widgetRefs: IWidgetReference[], layoutWidth: number): IUniWidget[] {
        const widgets = this.canvasHelper.getWidgetsFromReferences(widgetRefs) || [];
        return widgets.map(widget => {
            // Make sure the widgets in each size layout has no references to each other
            widget = Object.assign({}, widget);

            if (widget.width > layoutWidth) {
                widget.width = layoutWidth;
            }

            return widget;
        });
    }

    private initWidgetSelector() {
        const filter = widgets => {
            if (environment.isSrEnvironment) {
                return widgets;
            } else {
                return widgets.filter(w => !w.srOnly);
            }
        };

        this.widgetSelectorItems = [
            {
                label: 'Tellere',
                items: filter(COUNTERS)
            },
            {
                label: 'Snarveier',
                items: filter(SHORTCUT_LISTS)
            },
            {
                label: 'Diagram',
                items: filter(CHARTS)
            },
            ...filter(MISC_WIDGETS),
        ];
    }

}
