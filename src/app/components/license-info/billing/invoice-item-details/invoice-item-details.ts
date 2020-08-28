import {Component, Input, HostListener, Output, EventEmitter} from '@angular/core';
import {ListViewColumn} from '../../list-view/list-view';
import {BillingDataItem} from '@app/models/elsa-models';

@Component({
    selector: 'invoice-item-details',
    templateUrl: './invoice-item-details.html',
    styleUrls: ['./invoice-item-details.sass']
})
export class InvoiceItemDetails {
    @Input() item: BillingDataItem;
    @Output() close = new EventEmitter();

    listHeader: string;
    countLabel: string;
    columns: ListViewColumn[];

    @HostListener('click')
    onBackdropClick() {
        this.close.emit();
    }

    ngOnChanges() {
        if (this.item) {
            const countLabel = this.item.Unit === 'bruker' ? 'Dager' : 'Antall';
            let listHeader = this.item.Unit;

            // Capitalize
            if (listHeader) {
                listHeader = listHeader.replace(/\b\w/g, l => l.toUpperCase());
            }

            this.columns = [
                {header: listHeader, field: 'Name'},
                {header: countLabel, field: 'Counter', numberFormat: 'number', flex: '0 0 4rem'},
            ];
        }
    }
}
