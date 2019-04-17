import {Component, Input} from '@angular/core';
import {BillingData} from '../billing';

@Component({
    selector: 'transactions-per-company',
    templateUrl: './transactions-per-company.html',
    styleUrls: ['./transactions-per-company.sass']
})
export class TransactionsPerCompany {
    @Input() billingData: BillingData;

    transactionsPerCompany: any[];
    selectedCompany: any;
    detailsVisible: boolean;

    companyListColumns = [
        {header: 'Selskap', field: 'companyName'},
        {header: 'Totalsum', field: 'sum', format: 'number'}
    ];

    transactionListColumns = [
        {header: 'Produkt', field: 'productName'},
        {header: 'Antall', field: 'count', format: 'number', flex: '0 0 4rem'},
        {header: 'Pris', field: 'price', format: 'number'},
        {header: 'Rabatt', field: 'discount', format: 'percent', flex: '0 0 3rem'},
        {header: 'Sum', field: 'sum', format: 'number'}
    ];

    ngOnChanges() {
        if (this.billingData && this.billingData.items) {
            this.transactionsPerCompany = this.getTransactionsPerCompany();
        }
    }

    onRowClick(row) {
        this.selectedCompany = row;
        this.detailsVisible = true;
    }

    getTransactionsPerCompany() {
        const transactionsPerCompany: any = {};
        this.billingData.items.forEach(item => {
            if (item.unit === 'selskap') {
                item.details.forEach(itemUsage => {
                    if (!transactionsPerCompany[itemUsage.name]) {
                        transactionsPerCompany[itemUsage.name] = [];
                    }

                    const transactionItem: any = {
                        productName: item.productName,
                        count: itemUsage.counter,
                        price: item.price,
                        discount: item.discountPrc
                    };

                    let sum = transactionItem.price * transactionItem.count;
                    if (sum && transactionItem.discount) {
                        sum = sum * (1 - (transactionItem.discount / 100));
                    }

                    transactionItem.sum = sum;
                    transactionsPerCompany[itemUsage.name].push(transactionItem);
                });
            }
        });

        const data = [];
        Object.keys(transactionsPerCompany).forEach(key => {
            const transactions = transactionsPerCompany[key];
            const sum = transactions.reduce((total, transaction) => {
                return total + (transaction.sum || 0);
            }, 0);

            data.push({
                companyName: key,
                sum: sum,
                transactions: transactions
            });
        });

        return data;
    }
}
