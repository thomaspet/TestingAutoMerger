import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {BillingData} from '../billing';
import * as moment from 'moment';
import {ElsaContractTypePipe} from '@uni-framework/pipes/elsaContractTypePipe';

@Component({
    selector: 'related-orders-modal',
    templateUrl: './related-orders-modal.html',
    styleUrls: ['./related-orders-modal.sass']
})
export class RelatedOrdersModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    relatedOrders: BillingData[];

    constructor(private elsaContractTypePipe: ElsaContractTypePipe) {}

    ngOnInit() {
        this.relatedOrders = this.options.data || [];
        this.relatedOrders.forEach(order => order['_period'] = this.setHeaderText(order));
    }

    setHeaderText(order: BillingData): string {
        // returns ex: 'Periode 1-16. juli 2020  --  Lisens: Pluss'
        const period = 'Periode ' + moment(order.FromDate).format('D') + '-' + moment(order.ToDate).format('LL');
        const contracttype = 'Lisens: ' + this.elsaContractTypePipe.transform(order.ContractType);
        return period + '&nbsp;&nbsp; &mdash; &nbsp;&nbsp;' + contracttype;
    }
}
