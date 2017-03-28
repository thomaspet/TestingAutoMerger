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

    private gridAnchor: IGridAnchor;

    constructor(
        private cdr: ChangeDetectorRef,
        private toastService: ToastService
    ) {
        this.canvasHelper = new CanvasHelper();
    }

    public ngOnChanges() {
        if (this.widgets) {
            this.widgets.forEach(widget => this.addWidget(widget));
            this.cdr.markForCheck();
        }
    }

    private addWidget(widget: IUniWidget) {
        const canvas: HTMLElement = this.canvas.nativeElement;

        if (!widget.hasOwnProperty('x') || !widget.hasOwnProperty('y')) {
            const position = this.canvasHelper.getNextAvailablePosition(widget);
            if (position) {
                widget.x = position.x;
                widget.y = position.y;
                this.widgetsChange.next(this.widgets);
            } else {
                this.toastService.addToast('Det er ikke plass til denne widgeten', ToastType.warn, 10);
                this.widgets.pop();
                this.widgetsChange.next(this.widgets);
                return;
            }
        }

        this.canvasHelper.reserveGridSpace(widget);

        widget._editMode = this.editMode;
        widget._position = {
            top: (canvas.clientHeight / 9) * widget.y,
            left: (canvas.clientWidth / 12) * widget.x,
            width: ((canvas.clientWidth / 12) * widget.width) - 5,
            height: ((canvas.clientHeight / 9) * widget.height) - 5
        };
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
            .finally(() => this.snapToGrid(widget))
            .subscribe((moveEvent: MouseEvent) => {
                widget._position.left = moveEvent.clientX - canvasBounds.left - offsetX;
                widget._position.top = moveEvent.clientY - canvasBounds.top - offsetY;

                this.drawAnchorCell.next(widget);
            });

        this.drawAnchorCell
            .throttleTime(50)
            .subscribe((w: IUniWidget) => {
                const gridIndex = this.canvasHelper.getClosestGridIndex(
                    this.canvas.nativeElement,
                    w._position.top,
                    w._position.left
                );

                const position = this.canvasHelper.getAbsolutePosition(
                    this.canvas.nativeElement,
                    gridIndex.y,
                    gridIndex.x
                );

                if (gridIndex.x >= 0 && gridIndex.x < 12 && gridIndex.y >= 0 && gridIndex.y < 9) {
                    this.gridAnchor = {
                        top: position.top,
                        left: position.left,
                        x: gridIndex.x,
                        y: gridIndex.y,
                        valid: gridIndex.x + w.height <= 12 && gridIndex.y + w.height <= 9
                    };
                } else {
                    this.gridAnchor = undefined;
                }
            });
    }

    public snapToGrid(widget: IUniWidget) {
        if (this.gridAnchor && this.gridAnchor.valid) {
            let collision = this.canvasHelper.checkForCollision(
                this.gridAnchor.y,
                this.gridAnchor.x,
                widget.height,
                widget.width
            );

            if (collision) {
                // TODO: check if we can swap the widgets (same size)
            } else {
                widget.x = this.gridAnchor.x;
                widget.y = this.gridAnchor.y;
            }
        }

        const position = this.canvasHelper.getAbsolutePosition(
            this.canvas.nativeElement,
            widget.y,
            widget.x
        );

        widget._position.top = position.top;
        widget._position.left = position.left;

        this.canvasHelper.reserveGridSpace(widget);
        this.gridAnchor = undefined;
    }

    public onMouseMove(event: MouseEvent) {
        if (this.editMode) {
            this.mouseMove.next(event);
        }
    }

}
