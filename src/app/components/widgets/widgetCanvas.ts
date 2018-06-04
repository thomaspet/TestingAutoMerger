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
import {Observable} from 'rxjs/Observable';
import {UniWidget, IUniWidget} from './uniWidget';
import {CanvasHelper} from './canvasHelper';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {AuthService} from '../../authService';
import {WidgetDataService} from './widgetDataService';

import {
    // SHORTCUTS,
    SHORTCUT_LISTS,
    INFO_SHORTCUTS,

    CHARTS,
    COUNTERS,
    MISC_WIDGETS
} from './configs/index';

import * as $ from 'jquery';
declare const _;

export {IUniWidget} from './uniWidget';

interface IGridCell {
    available: boolean;
    class: string;
}

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
}

export interface IWidgetReference {
    x: number;
    y: number;
    widgetID: string;
}

enum LAYOUT_WIDTH {
    large = 12,
    medium = 8,
    small = 4
}

@Component({
    selector: 'uni-widget-canvas',
    templateUrl: './widgetCanvas.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniWidgetCanvas {
    @ViewChild('canvas')
    private canvas: ElementRef;

    @ViewChildren(UniWidget)
    private widgetElements: QueryList<UniWidget>;

    @Input()
    private layoutName: string;

    @Input()
    private defaultLayout: IWidgetReference[];

    public layout: IResponsiveWidgetLayout;
    private layoutBackup: IResponsiveWidgetLayout;
    private unsavedChanges: boolean;
    public editMode: boolean;
    public currentSize: string;
    private gridUnitInPx: number;
    private widgetMargin: number;

    private mouseMove: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
    private drawAnchorCell: EventEmitter<IUniWidget> = new EventEmitter<IUniWidget>();
    public gridAnchor: IGridAnchor;
    private widgetSelectorItems: any[];

    private refreshInterval: any;

    constructor(
        private cdr: ChangeDetectorRef,
        private toastService: ToastService,
        private authService: AuthService,
        private canvasHelper: CanvasHelper,
        private dataService: WidgetDataService
    ) {
        // Clear cache on init
        this.dataService.clearCache();

        // Clear on a 10 min timer
        this.refreshInterval = setInterval(() => {
            this.dataService.clearCache();
            this.refreshWidgets();
        }, 60000 * 10);

        this.widgetMargin = 10;

        this.authService.authentication$.subscribe(auth => {
            if (auth.user && this.layout) {
                this.canvasHelper.resetGrid();
                const layout = this.canvasHelper.getSavedLayout(this.layoutName);
                this.initializeLayout(layout);
            }
        });

        Observable.fromEvent(window, 'resize')
            .throttleTime(200)
            .subscribe(event => {
                if (this.defaultLayout) {
                    if (this.editMode) {
                        this.save();
                    }

                    this.drawLayout();
                }
            });

        this.initWidgetSelector();
    }

    public ngOnChanges() {
        if (this.defaultLayout && this.layoutName) {
            const layout = this.canvasHelper.getSavedLayout(this.layoutName);
            this.initializeLayout(layout);
        }
    }

    public ngOnDestroy() {
        clearInterval(this.refreshInterval);
    }

    private initializeLayout(layout?: IResponsiveWidgetLayout) {
        if (!layout) {
            layout = this.buildResponsiveLayout(this.defaultLayout);
        }

        // Filter based on permissions
        this.authService.authentication$.take(1).subscribe(auth => {
            this.layout = this.canvasHelper.filterLayout(layout, auth.user);
            this.drawLayout();
        });
    }

    public refreshWidgets() {
        this.layout[this.currentSize] = this.deepCopyWidgets(this.layout[this.currentSize]);
        this.canvasHelper.resetGrid();
        this.drawLayout();
    }

    private drawLayout() {
        let size;
        let numCols;

        if (window.innerWidth <= 900) {
            size = 'small';
            numCols = LAYOUT_WIDTH.small;
        } else if (window.innerWidth <= 1300) {
            size = 'medium';
            numCols = LAYOUT_WIDTH.medium;
        } else {
            size = 'large';
            numCols = LAYOUT_WIDTH.large;
        }

        this.widgetMargin = window.innerWidth <= 1500 ? 10 : 25;

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

        // Timeout to make sure we trigger change detection when loading data from cache
        // (cache messes with change detection timing because its "too quick")
        setTimeout(() => {
            this.cdr.markForCheck();
        });
    }

    public addWidget(widget) {
        const position = this.canvasHelper.getNextAvailablePosition(widget);
        widget.editMode = this.editMode;

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

    private setWidgetPosition(widget: IUniWidget) {
        widget._position = {
            top: this.gridUnitInPx * widget.y,
            left: this.gridUnitInPx * widget.x
        };

        this.canvasHelper.reserveGridSpace(widget);
        this.cdr.markForCheck();
    }

    public toggleEditMode() {
        this.editMode = !this.editMode;

        if (this.editMode) {
            this.layoutBackup = {
                small: this.deepCopyWidgets(this.layout.small),
                medium: this.deepCopyWidgets(this.layout.medium),
                large: this.deepCopyWidgets(this.layout.large)
            };
        } else {
            this.layoutBackup = undefined;
        }

        this.widgetElements.forEach(widget => widget.setEditMode(this.editMode));

        this.cdr.markForCheck();
    }

    public cancelEdit() {
        if (this.unsavedChanges) {
            this.layout = this.layoutBackup;
            this.layout[this.currentSize].forEach(w => this.setWidgetPosition(w));

            this.canvasHelper.resetGrid();
            this.drawLayout();
        }

        this.unsavedChanges = false;
        this.toggleEditMode();
     }

    public hardReset() {
        if (!confirm('Ønsker du å gå tilbake til Uni Micro standard layout? Dette vil fjerne alle dine endringer')) {
            return;
        }

        this.canvasHelper.removeLayout(this.layoutName);
        this.canvasHelper.resetGrid();
        this.unsavedChanges = false;
        this.toggleEditMode();

        this.initializeLayout();
    }

    public save() {
        if (!this.layout || !this.unsavedChanges) {
            this.toggleEditMode();
            return;
        }

        this.canvasHelper.saveLayout(this.layoutName, this.layout);
        this.unsavedChanges = false;
        this.toastService.addToast('Layout lagret', ToastType.good, 5);
        this.toggleEditMode();
    }

    public startDrag(event: MouseEvent, widget: IUniWidget) {
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

        (this.mouseMove as Observable<any>)
            .throttleTime(5)
            .takeUntil(Observable.fromEvent(document, 'mouseup').take(1))
            .finally(() => this.stopDrag(widget))
            .subscribe((moveEvent: MouseEvent) => {
                widget._position.left = moveEvent.clientX - canvasBounds.left - offsetX;
                widget._position.top = moveEvent.clientY - canvasBounds.top - offsetY;

                this.drawAnchorCell.next(widget);
            });

        (this.drawAnchorCell as Observable<any>)
            .throttleTime(50)
            .subscribe((w: IUniWidget) => {
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

    public stopDrag(widget: IUniWidget) {
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

    public onMouseMove(event: MouseEvent) {
        if (this.editMode) {
            this.mouseMove.next(event);
        }
    }

    public onWidgetRemoved(widget: IUniWidget, index: number) {
        this.layout.large.splice(index, 1);
        this.layout.medium.splice(index, 1);
        this.layout.small.splice(index, 1);

        this.canvasHelper.releaseGridSpace(widget);
        this.unsavedChanges = true;
    }

    private buildResponsiveLayout(widgetReferences: IWidgetReference[]): IResponsiveWidgetLayout {
        const widgets = this.canvasHelper.getWidgetsFromReferences(widgetReferences);

        return {
            large: this.setWidgetWidths(widgets, LAYOUT_WIDTH.large),
            medium: this.setWidgetWidths(widgets, LAYOUT_WIDTH.medium),
            small: this.setWidgetWidths(widgets, LAYOUT_WIDTH.small)
        };
    }

    private setWidgetWidths(widgets: IUniWidget[], maxWidth: number): IUniWidget[] {
        return widgets.map(widget => {
            // Make sure the widgets in each size layout has no references to each other
            widget = Object.assign({}, widget);

            if (widget.width > maxWidth) {
                widget.width = maxWidth;
            }

            return widget;
        });
    }

    private deepCopyWidgets(widgets: IUniWidget[]): IUniWidget[] {
        return widgets.map(w => Object.assign({}, w));
    }

    private initWidgetSelector() {
        const shortcuts = [...SHORTCUT_LISTS, ...INFO_SHORTCUTS];
        this.widgetSelectorItems = [
            {
                label: 'Tellere',
                items: COUNTERS
            },
            // {
            //     label: 'Snarveier',
            //     items: shortcuts
            // },
            {
                label: 'Snarveier',
                items: shortcuts
            },
            {
                label: 'Diagram',
                items: CHARTS
            },
            ...MISC_WIDGETS,
        ];
    }

}
