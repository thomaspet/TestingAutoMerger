import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'uni-annual-settlement-summary',
    templateUrl: './annual-settlement-summary.component.html',
    styleUrls: ['./annual-settlement-summary.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnualSettlementSummaryComponent {
    @Input() title: string;
    @Input() data: any;
}
