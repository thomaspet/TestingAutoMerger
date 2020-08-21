import {Component, Input} from '@angular/core';
import {BillingData} from '../billing';
import {ListViewColumn} from '../../list-view/list-view';
import * as moment from 'moment';

@Component({
    selector: 'cost-per-user',
    templateUrl: './cost-per-user.html',
    styleUrls: ['./cost-per-user.sass']
})
export class CostPerUser {
    @Input() billingData: BillingData;

    costPerUser: any[];
    selectedUser: any;
    detailsVisible: boolean;

    userListColumns: ListViewColumn[] = [
        {header: 'Bruker', field: 'user'},
        {header: 'Totalsum', field: 'sum', numberFormat: 'money'}
    ];

    productListColumns: ListViewColumn[] = [
        {header: 'Produkt', field: 'productName'},
        {header: 'Pris', field: 'price', numberFormat: 'money'},
        {header: 'Dager', field: 'days', numberFormat: 'number'},
        {header: 'Rabatt', field: 'discount', numberFormat: 'percent', flex: '0 0 3rem'},
        {header: 'Sum', field: 'sum', numberFormat: 'money'}
    ];

    ngOnChanges() {
        if (this.billingData && this.billingData.Items) {
            this.costPerUser = this.getCostPerUser();
        }
    }

    onRowClick(row) {
        this.selectedUser = row;
        console.log(this.selectedUser);
        this.detailsVisible = true;
    }

    getCostPerUser() {
        const costPerUser: any = {};

        const daysInPeriod = moment(this.billingData.FromDate).daysInMonth();

        this.billingData.Items.forEach(item => {
            if (item.Unit === 'bruker') {
                item.Details.forEach(itemUsage => {
                    if (!costPerUser[itemUsage.Name]) {
                        costPerUser[itemUsage.Name] = [];
                    }

                    const transactionItem: any = {
                        productName: item.ProductName,
                        price: item.Price,
                        days: itemUsage.Counter,
                        discount: item.DiscountPrc
                    };

                    // If user has had access for less than the full period
                    // we need to decrease the displayed sum
                    const usageMultiplier = (transactionItem.days / daysInPeriod) || 1;

                    let sum = transactionItem.price * +usageMultiplier.toFixed(2);
                    if (transactionItem.discount) {
                        sum = sum * (1 - (transactionItem.discount / 100));
                    }

                    transactionItem.sum = sum;
                    costPerUser[itemUsage.Name].push(transactionItem);
                });
            }
        });

        const data = [];
        Object.keys(costPerUser).forEach(key => {
            const transactions = costPerUser[key];
            const sum = transactions.reduce((total, transaction) => {
                return total + (transaction.sum || 0);
            }, 0);

            data.push({
                user: key,
                sum: sum,
                transactions: transactions
            });
        });

        return data;
    }
}
