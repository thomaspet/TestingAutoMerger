import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'uni-incoming-balance-totals',
    templateUrl: './incoming-balance-totals.component.html',
    styleUrls: ['./incoming-balance-totals.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomingBalanceTotalsComponent implements OnInit {
    @Input() sum: number;
    @Input() diff: number;

    constructor() { }

    ngOnInit(): void {
    }

}
