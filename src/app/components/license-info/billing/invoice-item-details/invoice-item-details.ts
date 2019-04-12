import {Component, Input, HostListener, Output, EventEmitter} from '@angular/core';
import {BillingDataItem} from '../billing';

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
    columns: any[];

    @HostListener('click')
    onBackdropClick() {
        this.close.emit();
    }

    ngOnChanges() {
        if (this.item) {
            const countLabel = this.item.unit === 'bruker' ? 'Dager' : 'Antall';
            let listHeader = this.item.unit;

            // Capitalize
            if (listHeader) {
                listHeader = listHeader.replace(/\b\w/g, l => l.toUpperCase());
            }

            this.columns = [
                {header: listHeader, field: 'name'},
                {header: countLabel, field: 'counter', format: 'number', flex: '0 0 4rem'},
            ];
        }
    }
}
