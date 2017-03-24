import {
    Component,
    Input,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    HostListener,
    EventEmitter
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {IUniWidget} from './uniWidget';

interface IGridCell {
    available: boolean;
    position: any;
}

@Component({
    selector: 'uni-widget-canvas',
    templateUrl: './widgetCanvas.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniWidgetCanvas {
    @ViewChild('canvas')
    private canvas: ElementRef;

    @Input()
    private widgets: IUniWidget[];

    private dragObject: {
        offsetX: number;
        offsetY: number;
        widget: IUniWidget;
    };
    private dragEvent: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    constructor(private cdr: ChangeDetectorRef) {}


    public ngOnChanges() {
        if (this.widgets) {
            this.widgets.forEach(widget => this.calculatePosition(widget));
            this.cdr.markForCheck();
        }
    }

    public ngAfterViewInit() {
        const canvasRect = this.canvas.nativeElement.getBoundingClientRect();

        Observable.fromEvent(document, 'mouseup').subscribe(
            (event: MouseEvent) => this.stopDrag(event)
        );

        this.dragEvent
            .throttleTime(5)
            .subscribe((event: MouseEvent) => {
                let x = event.clientX - canvasRect.left - this.dragObject.offsetX;
                let y = event.clientY - canvasRect.top - this.dragObject.offsetY;

                this.dragObject.widget._position.left = x + 'px';
                this.dragObject.widget._position.top = y + 'px';
            });
    }

    public calculatePosition(widget: IUniWidget) {
        const canvas: HTMLElement = this.canvas.nativeElement;

        const left = ((canvas.clientWidth / 12)) * (widget.x);
        const width = ((canvas.clientWidth / 12) * widget.width) - 5;
        const height = ((canvas.clientHeight / 9) * widget.height) - 5;
        const top = (canvas.clientHeight / 9) * widget.y;

        widget._position = {
            top: top + 'px',
            left: left + 'px',
            width: width + 'px',
            height: height + 'px'
        };
    }

    public startDrag(event: MouseEvent, widget: IUniWidget) {
        event.preventDefault();
        const elemBounds = event.srcElement.getBoundingClientRect();

        this.dragObject = {
            offsetX: event.x - elemBounds.left,
            offsetY: event.y - elemBounds.top,
            widget: widget
        };
    }

    public stopDrag(event: MouseEvent) {
        if (!this.dragObject) {
            return;
        }

        const canvas: HTMLElement = this.canvas.nativeElement;
        const canvasRect = canvas.getBoundingClientRect();

        const cellLength = (canvas.clientWidth / 12);
        const cellHeight = (canvas.clientHeight / 9);

        const x = Math.floor((event.x - canvasRect.left) / cellLength);
        const y = Math.floor((event.y - canvasRect.top) / cellHeight);


        if (x >= 0 && y >= 0) {
            this.dragObject.widget.x = x;
            this.dragObject.widget.y = y;
        }

        this.calculatePosition(this.dragObject.widget);
        this.dragObject = undefined;
    }

    public onMouseMove(event: MouseEvent) {
        if (!!this.dragObject) {
            this.dragEvent.next(event);
        }
    }

}
