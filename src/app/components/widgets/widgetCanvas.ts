import {
    Component,
    Input,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import {IUniWidget} from './uniWidget';

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

    constructor(private cdr: ChangeDetectorRef) {}

    public ngOnChanges() {
        if (this.widgets) {
            this.cdr.markForCheck();
        }
    }

    public calculatePosition(widget: IUniWidget) {
        const canvas: HTMLElement = this.canvas.nativeElement;

        const left = ((canvas.clientWidth / 12)) * (widget.x);
        const width = ((canvas.clientWidth / 12) * widget.width) - 5;
        const height = 100 * widget.height;


        let widgetsAbove = this.widgets.filter((w: IUniWidget) => {
            return w.x === widget.x && w.y < widget.y;
        });

        let top = 0;
        widgetsAbove.forEach(w => top += (100 * w.height) + 5);

        return {
            top: top + 'px',
            left: left + 'px',
            width: width + 'px',
            height: height + 'px'
        };
    }


}
