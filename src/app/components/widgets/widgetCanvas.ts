import {
    Component,
    Input,
    Output,
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

    @Output()
    private widgetsChange: EventEmitter<IUniWidget[]> = new EventEmitter<IUniWidget[]>();

    private canvasHelper: CanvasHelper;

    private editMode: boolean;
    private mouseMove: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
    private drawAnchorCell: EventEmitter<IUniWidget> = new EventEmitter<IUniWidget>();

    private gridUnitInPx: number;
    private marginInPx: number;

    private gridAnchor: IGridAnchor;

    constructor(
        private cdr: ChangeDetectorRef,
        private toastService: ToastService
    ) {
        this.canvasHelper = new CanvasHelper();
        this.marginInPx = 10;

        Observable.fromEvent(window, 'resize')
            .skip(1)
            .throttleTime(200)
            .subscribe(event => {
                if (this.widgets) {
                    this.widgets.forEach((widget: IUniWidget) => {
                        this.gridUnitInPx = this.canvas.nativeElement.clientWidth / 12;
                        this.setWidgetPosition(widget);
                    });

                    this.cdr.markForCheck();
                }
            });
    }

    public ngOnChanges() {
        if (this.widgets) {
            this.gridUnitInPx = this.canvas.nativeElement.clientWidth / 12;
            this.widgets.forEach(widget => this.addWidget(widget));
            this.cdr.markForCheck();
        }
    }

    private addWidget(widget: IUniWidget) {
        widget._editMode = this.editMode;

        // If widget already has x:y coordinates, just position it and return
        if (widget.x >= 0 && widget.y >= 0) {
            this.setWidgetPosition(widget);
            return;
        }

        // If not, get next available position
        const position = this.canvasHelper.getNextAvailablePosition(widget);
        if (position) {
            widget.x = position.x;
            widget.y = position.y;
            this.widgetsChange.next(this.widgets);
            this.setWidgetPosition(widget);
        } else {
            this.toastService.addToast('Det er ikke plass til denne widgeten', ToastType.warn, 10);
            this.widgets.pop();
            this.widgetsChange.next(this.widgets);
            return;
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
        this.widgetElements.forEach(widget => widget.toggleEditMode());
        this.cdr.markForCheck();
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
                const collidingWidget = this.widgets.find((w: IUniWidget) => {
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
        }

        this.setWidgetPosition(widget);
        this.gridAnchor = undefined;
    }

    public onMouseMove(event: MouseEvent) {
        if (this.editMode) {
            this.mouseMove.next(event);
        }
    }

}
