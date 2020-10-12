import {Component, Input} from '@angular/core';

@Component({
    selector: 'uni-tooltip',
    template: `
        <i class="material-icons" [ngClass]="type" [matTooltip]="text">
            {{!type || type === 'info' ? 'info_outline' : 'warning'}}
        </i>
    `,
    styleUrls: ['./tooltip.sass']
})
export class UniTooltip {
    @Input() public type: 'info'|'warn'|'error' = 'info';
    @Input() public alignment: 'top'|'bottom'|'left'|'right';
    @Input() public text: string;
}
