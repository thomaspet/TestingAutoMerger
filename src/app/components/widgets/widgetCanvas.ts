import {Component, Input} from '@angular/core';
import {IUniWidget} from './uniWidget';

@Component({
    selector: 'uni-widget-canvas',
    templateUrl: './widgetCanvas.html'
})
export class UniWidgetCanvas {
    @Input()
    private widgets: IUniWidget[]; // TODO: widget interface!
}
