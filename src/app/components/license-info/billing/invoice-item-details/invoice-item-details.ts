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
            const countLabel = this.item.Unit === 'bruker' ? 'Dager' : 'Antall';
            let listHeader = this.item.Unit;

            // Capitalize
            if (listHeader) {
                listHeader = listHeader.replace(/\b\w/g, l => l.toUpperCase());
            }

            this.columns = [
                {header: listHeader, field: 'Name'},
                {header: countLabel, field: 'Counter', format: 'number', flex: '0 0 4rem'},
            ];
        }
    }
}
