import {Component} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http/http';
import {AuthService} from '@app/authService';
import {ListViewColumn} from '../list-view/list-view';

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
    hasPermission: boolean;

    columns: ListViewColumn[] = [
        {header: 'Varenr', field: 'ProductID'},
        {header: 'Varenavn', field: 'ProductName', flex: '2'},
        {header: 'Antall', field: 'Amount', numberFormat: 'number'},
        {header: 'Enhet', field: 'Unit', flex: '0 0 6rem'},
        {header: 'Pris', field: 'Price', numberFormat: 'money'},
        {header: 'Rabatt', field: 'DiscountPrc', numberFormat: 'percent', flex: '0 0 5rem'},
        {header: 'Sum', field: 'Sum', numberFormat: 'money'},
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
                    this.hasPermission = true;
                    this.billingData = res.json();
                },
                err => {
                    console.error(err);
                    if (err.status === 403) {
                        this.hasPermission = false;
                    }
                }
            );
    }

    onRowClick(row) {
        this.selectedRow = row;
        this.detailsVisible = true;
    }
}
