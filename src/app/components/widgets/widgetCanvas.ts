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
import {WIDGET_CONFIGS} from './configs/presetConfigs';
declare const _;

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

interface IWidgetLayout {
    large: IUniWidget[];
    medium?: IUniWidget[];
    small?: IUniWidget[];
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
    private widgets: IUniWidget[];

    private layout: IWidgetLayout;
    private layoutBackup: IWidgetLayout;
    private unsavedChanges: boolean;
    private editMode: boolean;
    private currentSize: string;
    private gridUnitInPx: number;
    private widgetMargin: number;

    private canvasHelper: CanvasHelper;
    private mouseMove: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
    private drawAnchorCell: EventEmitter<IUniWidget> = new EventEmitter<IUniWidget>();

    private gridAnchor: IGridAnchor;

    private widgetSelectorItems: any[];

    constructor(
        private cdr: ChangeDetectorRef,
        private toastService: ToastService
    ) {
        this.canvasHelper = new CanvasHelper();
        this.widgetMargin = 10;

        Observable.fromEvent(window, 'resize')
            .throttleTime(200)
            .subscribe(event => {
                if (this.widgets) {
                    if (this.editMode) {
                        this.save();
                    }

                    this.drawLayout();
                }
            });

        this.initWidgetSelector();
    }

    public ngOnChanges() {
        if (this.widgets) {
            this.layout = JSON.parse(localStorage.getItem('dashboard_widget_layout'));

            if (!this.layout) {
                this.layout = {
                    large: this.deepCopyWidgets(this.widgets),
                    medium: this.deepCopyWidgets(this.widgets),
                    small: this.deepCopyWidgets(this.widgets),
                };
            }

            this.drawLayout();
        }
    }

    public refreshWidgets() {
        this.layout[this.currentSize] = this.deepCopyWidgets(this.layout[this.currentSize]);
        this.canvasHelper.resetGrid();
        this.drawLayout();
    }

    private drawLayout() {
        let size;
        let numCols;

        if (window.innerWidth <= 768) {
            size = 'small';
            numCols = 4;
        } else if (window.innerWidth <= 1200) {
            size = 'medium';
            numCols = 8;
        } else {
            size = 'large';
            numCols = 12;
        }

        this.widgetMargin = window.innerWidth <= 1500 ? 10 : 13;

        if (size !== this.currentSize) {
            this.currentSize = size;
            this.canvasHelper.activateLayout(this.layout[size], numCols);
        }

        const width = this.canvas.nativeElement.clientWidth;
        this.gridUnitInPx = width / numCols;

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

        this.cdr.markForCheck();
    }

    public addWidget(configPath) {
        const widget = _.get(WIDGET_CONFIGS, configPath);
        if (!widget) {
            return;
        }

        widget._editMode = this.editMode;

        const position = this.canvasHelper.getNextAvailablePosition(widget);
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

        localStorage.removeItem('dashboard_widget_layout');
        this.layout = {
            small: this.deepCopyWidgets(this.widgets),
            medium: this.deepCopyWidgets(this.widgets),
            large: this.deepCopyWidgets(this.widgets)
        };

        this.canvasHelper.resetGrid();
        this.unsavedChanges = false;
        this.cdr.markForCheck();
        this.drawLayout();
        this.toggleEditMode();
    }

    public save() {
        if (!this.layout || !this.unsavedChanges) {
            this.toggleEditMode();
            return;
        }

        const stringified = JSON.stringify(this.layout, (key, value) => {
            if (key === '_editMode') {
                return false;
            }
            return value;
        });

        localStorage.setItem('dashboard_widget_layout', stringified);
        this.unsavedChanges = false;
        this.toastService.addToast('Layout lagret', ToastType.good, 5);
        this.toggleEditMode();
    }

    public startDrag(event: MouseEvent, widget: IUniWidget) {
        event.preventDefault();
        const elemBounds = event.srcElement.closest('uni-widget').getBoundingClientRect();
        const canvasBounds = this.canvas.nativeElement.getBoundingClientRect();

        let offsetX = event.x - elemBounds.left;
        let offsetY = event.y - elemBounds.top;

        this.canvasHelper.releaseGridSpace(widget);

        this.mouseMove
            .throttleTime(5)
            .takeUntil(Observable.fromEvent(document, 'mouseup').take(1))
            .finally(() => this.stopDrag(widget))
            .subscribe((moveEvent: MouseEvent) => {
                widget._position.left = moveEvent.clientX - canvasBounds.left - offsetX;
                widget._position.top = moveEvent.clientY - canvasBounds.top - offsetY;

                this.drawAnchorCell.next(widget);
            });

        this.drawAnchorCell
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
            let collision = this.canvasHelper.findCollision(
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

    private deepCopyWidgets(widgets: IUniWidget[]): IUniWidget[] {
        return widgets.map(w => Object.assign({}, w));
    }

    private initWidgetSelector() {
        this.widgetSelectorItems = [
            {
                label: 'Snarveier',
                value: [
                    {label: 'Tilbud', value: 'shortcuts.quotes'},
                    {label: 'Ordre', value: 'shortcuts.orders'},
                    {label: 'Fakura', value: 'shortcuts.invoices'},
                    {label: 'Kunder', value: 'shortcuts.customers'},
                    {label: 'Timer', value: 'shortcuts.hours'},
                ]
            },
            // {
            //     label: 'Tellere',
            //     value: [
            //         {label: 'Epost', value: ''},
            //         {label: 'EHF', value: ''},
            //         {label: 'PDF', value: ''},
            //         {label: 'Utlegg', value: ''},
            //     ]
            // },
            {
                label: 'Diagram',
                value: [
                    {label: 'Driftsresultater', value: 'charts.operatingProfits'},
                    {label: 'Nøkkeltall', value: 'charts.kpi'},
                    {label: 'Utestående per kunde', value: 'charts.outstandingInvoices'},
                    {label: 'Ansatte per stillingskode', value: 'charts.employeesPerJobCode'},
                ]
            },
            {
                label: 'Klokke',
                value: 'clock'
            },
            {
                label: 'Nyheter',
                value: 'rss'
            },
            {
                label: 'Firmalogo',
                value: 'companyLogo'
            },
            {
                label: 'Siste endringer',
                value: 'lastTransactions'
            }
        ];
    }

}
