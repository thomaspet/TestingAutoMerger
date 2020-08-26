import {Component, Input} from '@angular/core';
import {ListViewColumn} from '../../list-view/list-view';
import {BillingData} from '@app/models/elsa-models';

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

    companyListColumns: ListViewColumn[] = [
        {header: 'Selskap', field: 'companyName'},
        {header: 'Totalsum', field: 'sum', numberFormat: 'number'}
    ];

    transactionListColumns: ListViewColumn[] = [
        {header: 'Produkt', field: 'productName'},
        {header: 'Antall', field: 'count', numberFormat: 'number', flex: '0 0 4rem'},
        {header: 'Pris', field: 'price', numberFormat: 'number'},
        {header: 'Rabatt', field: 'discount', numberFormat: 'percent', flex: '0 0 3rem'},
        {header: 'Sum', field: 'sum', numberFormat: 'number'}
    ];

    ngOnChanges() {
        if (this.billingData && this.billingData.Items) {
            this.transactionsPerCompany = this.getTransactionsPerCompany();
        }
    }

    onRowClick(row) {
        this.selectedCompany = row;
        this.detailsVisible = true;
    }

    getTransactionsPerCompany() {
        const transactionsPerCompany: any = {};
        this.billingData.Items.forEach(item => {
            if (item.Unit === 'selskap' || item.Unit === 'stk') {
                item.Details.forEach(itemUsage => {
                    if (!transactionsPerCompany[itemUsage.Name]) {
                        transactionsPerCompany[itemUsage.Name] = [];
                    }

                    const transactionItem: any = {
                        productName: item.ProductName,
                        count: itemUsage.Counter,
                        price: item.Price,
                        discount: item.DiscountPrc
                    };

                    let sum = transactionItem.price * transactionItem.count;
                    if (sum && transactionItem.discount) {
                        sum = sum * (1 - (transactionItem.discount / 100));
                    }

                    transactionItem.sum = sum;
                    transactionsPerCompany[itemUsage.Name].push(transactionItem);
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
