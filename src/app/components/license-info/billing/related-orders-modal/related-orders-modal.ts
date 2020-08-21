import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {BillingData} from '../billing';

@Component({
    selector: 'related-orders-modal',
    templateUrl: './related-orders-modal.html',
    styleUrls: ['./related-orders-modal.sass']
})
export class RelatedOrdersModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    relatedOrder: BillingData;

    constructor() {}

    ngOnInit() {
        this.relatedOrder = this.options.data || {};
        this.relatedOrder['_period'] = this.relatedOrder['_period'].replace('Delavregning', 'Periode');
    }
}
