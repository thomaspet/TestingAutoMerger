import {Component, Input} from '@angular/core';

@Component({
    selector: 'uni-tooltip',
    template: `
        <i class="material-icons" [ngClass]="type">
            {{!type || type === 'info' ? 'info' : 'warning'}}
        </i>

        <aside class="tooltip" *ngIf="text"
            [innerHTML]="text"
            [ngClass]="alignment">
        </aside>
    `,
    styleUrls: ['./tooltip.sass']
})
export class UniTooltip {
    @Input() public type: 'info'|'warn'|'error' = 'info';
    @Input() public alignment: 'top'|'bottom'|'left'|'right';
    @Input() public text: string;
}
