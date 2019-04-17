import {Component, Input} from '@angular/core';
import {BillingData} from '../billing';

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

    userListColumns = [
        {header: 'Bruker', field: 'user'},
        {header: 'Totalsum', field: 'sum', format: 'money'}
    ];

    productListColumns = [
        {header: 'Produkt', field: 'productName'},
        {header: 'Pris', field: 'price', format: 'money'},
        {header: 'Dager', field: 'days', format: 'number'},
        {header: 'Rabatt', field: 'discount', format: 'percent', flex: '0 0 3rem'},
        {header: 'Sum', field: 'sum', format: 'money'}
    ];

    ngOnChanges() {
        if (this.billingData && this.billingData.items) {
            this.costPerUser = this.getCostPerUser();
        }
    }

    onRowClick(row) {
        this.selectedUser = row;
        this.detailsVisible = true;
    }

    getCostPerUser() {
        const costPerUser: any = {};
        
        this.billingData.items.forEach(item => {
            if (item.unit === 'bruker') {
                item.details.forEach(itemUsage => {
                    if (!costPerUser[itemUsage.name]) {
                        costPerUser[itemUsage.name] = [];
                    }

                    const transactionItem: any = {
                        productName: item.productName,
                        price: item.price,
                        days: itemUsage.counter,
                        discount: item.discountPrc
                    };

                    // If user has had access for less than the full period
                    // we need to decrease the displayed sum
                    const usageMultiplier = (transactionItem.days / item.days) || 1;

                    let sum = transactionItem.price * usageMultiplier;
                    if (transactionItem.discount) {
                        sum = sum * (1 - (transactionItem.discount / 100));
                    }

                    transactionItem.sum = sum;
                    costPerUser[itemUsage.name].push(transactionItem);
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
