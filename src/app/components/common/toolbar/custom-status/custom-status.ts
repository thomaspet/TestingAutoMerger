import {Component, Input} from '@angular/core';
import {StatusIndicator} from '../toolbar';

@Component({
    selector: 'toolbar-custom-status',
    templateUrl: './custom-status.html',
    styleUrls: ['./custom-status.sass']
})
export class ToolbarCustomStatus {
    @Input() status: StatusIndicator;
}
