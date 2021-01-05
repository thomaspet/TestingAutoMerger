import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'uni-annual-settlement-summary',
    templateUrl: './uni-annual-settlement-summary.component.html',
    styleUrls: ['./uni-annual-settlement-summary.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniAnnualSettlementSummaryComponent {
    @Input() title: string;
    @Input() data: any;
}
