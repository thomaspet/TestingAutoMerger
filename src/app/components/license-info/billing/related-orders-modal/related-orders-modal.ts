import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {BillingData} from '../billing';
import * as moment from 'moment';

@Component({
    selector: 'related-orders-modal',
    templateUrl: './related-orders-modal.html',
    styleUrls: ['./related-orders-modal.sass']
})
export class RelatedOrdersModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    relatedOrders: BillingData[];

    constructor() {}

    ngOnInit() {
        this.relatedOrders = this.options.data || [];
        this.relatedOrders.forEach(order => order['_period'] = this.datePeriodText(order));
    }

    datePeriodText(order: BillingData): string {
        // returns ex: 'Periode 1-16. juli 2020'
        return 'Periode ' + moment(order.FromDate).format('D') + '-' + moment(order.ToDate).format('LL');
    }
}
