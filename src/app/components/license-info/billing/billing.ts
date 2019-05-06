import {Component} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http/http';
import {AuthService} from '@app/authService';

export interface BillingDataItem {
    ProductID: number;
    ProductName: string;
    Days: number;
    Amount: number;
    Unit: string;
    Price: number;
    DiscountPrc: number;
    Sum: number;
    Details: {Name: string; Counter: number}[];
}

export interface BillingData {
    CustomerName: string;
    CustomerID: number;
    ContractID: number;
    ContractType: number;
    FromDate: string;
    ToDate: string;
    Total: number;
    TotalDiscount: number;
    OrderDays: number;
    Items: BillingDataItem[];
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
        {header: 'Varenr', field: 'ProductID'},
        {header: 'Varenavn', field: 'ProductName', flex: '2'},
        {header: 'Antall', field: 'Amount', format: 'number'},
        {header: 'Enhet', field: 'Unit', flex: '0 0 6rem'},
        {header: 'Pris', field: 'Price', format: 'money'},
        {header: 'Rabatt', field: 'DiscountPrc', format: 'percent', flex: '0 0 5rem'},
        {header: 'Sum', field: 'Sum', format: 'money'},
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
