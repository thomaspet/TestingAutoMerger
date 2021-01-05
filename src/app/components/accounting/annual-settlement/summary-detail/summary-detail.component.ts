import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'summary-detail-component',
    templateUrl: './summary-detail.component.html',
    styleUrls: ['./summary-detail.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryDetailComponent {
    @Input() title: string;
    @Input() data: any;
}
