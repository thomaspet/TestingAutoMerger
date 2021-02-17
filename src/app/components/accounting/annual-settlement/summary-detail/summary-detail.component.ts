import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';

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
    @Output() changeSummaryLine = new EventEmitter<any>(true);

    onItemChange(item, newValue) {
        item.Amount = newValue;
        this.changeSummaryLine.emit(item);
    }
}
