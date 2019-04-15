import {Component} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http/http';
import {AuthService} from '@app/authService';

export interface BillingDataItem {
    productID: number;
    productName: string;
    days: number;
    amount: number;
    unit: string;
    price: number;
    discountPrc: number;
    sum: number;
    details: {name: string; counter: number}[];
}

export interface BillingData {
    customerName: string;
    customerID: number;
    contractID: number;
    contractType: number;
    fromDate: string;
    toDate: string;
    total: number;
    totalDiscount: number;
    orderDays: number;
    items: BillingDataItem[];
}

@Component({
    selector: 'license-billing',
    templateUrl: './billing.html',
    styleUrls: ['./billing.sass']
})
export class Billing {
    yearSelectOptions: number[];
    periodFilter: { month: number; year: number };
    viewMode: number = 0;

    billingData: BillingData;
    selectedRow: BillingDataItem;
    detailsVisible: boolean;

    columns = [
        {header: 'Varenr', field: 'productID'},
        {header: 'Varenavn', field: 'productName', flex: '2'},
        {header: 'Antall', field: 'amount', format: 'number'},
        {header: 'Enhet', field: 'unit', flex: '0 0 6rem'},
        {header: 'Pris', field: 'price', format: 'money'},
        {header: 'Rabatt', field: 'discountPrc', format: 'percent', flex: '0 0 5rem'},
        {header: 'Sum', field: 'sum', format: 'money'},
    ];

    constructor(
        private authService: AuthService,
        private http: UniHttp,
    ) {
        const currentYear = new Date().getFullYear();
        this.yearSelectOptions = [currentYear - 2, currentYear - 1, currentYear];
        this.periodFilter = {
            month: new Date().getMonth(),
            year: currentYear
        };

        this.loadInvoice();
    }

    loadInvoice() {
        const contractID = this.authService.currentUser.License.Company.ContractID;
        const endpoint = `/api/billing/contract/${contractID}`
            + `?year=${this.periodFilter.year}`
            + `&month=${+this.periodFilter.month + 1}`;

        this.http.asGET()
            .usingElsaDomain()
            .withEndPoint(endpoint)
            .send()
            .subscribe(
                res => {
                    this.billingData = res.json();
                },
                err => {
                    this.billingData = undefined;
                    console.error(err);
                }
            );
    }

    onRowClick(row) {
        this.selectedRow = row;
        this.detailsVisible = true;
    }
}
