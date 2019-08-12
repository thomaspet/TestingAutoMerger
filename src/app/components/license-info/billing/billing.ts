import {Component} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http/http';
import {AuthService} from '@app/authService';
import {ListViewColumn} from '../list-view/list-view';
import {ElsaContractService} from '@app/services/services';
import {saveAs} from 'file-saver';
import * as moment from 'moment';
import {ElsaUserLicenseType} from '@app/models';

export interface BillingDataItem {
    ProductID: number;
    ProductName: string;
    Days: number;
    Amount: number;
    Unit: string;
    Price: number;
    DiscountPrc: number;
    Sum: number;
    Details: {Name: string; Counter: number, Tags?: string[]}[];
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
        private contractService: ElsaContractService
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
            + `&month=${+this.periodFilter.month + 1}`
            + `&tags=true`;

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

    export() {
        const formatNumber = value => value.toString().replace('.', ',');
        const csv = [];

        csv.push(
            `${this.billingData.CustomerName};`
            + `${this.contractService.getContractTypeText(this.billingData.ContractType)};`
            + `${moment(this.billingData.FromDate).format('DD.MM.YYYY')};`
            + `${moment(this.billingData.ToDate).format('DD.MM.YYYY')};`
            + `;;;;;;`
        );

        csv.push(';;;;;;;;;;');
        csv.push('ProductID;ProductName;User;Company;Days;Amount;Price;Unit;DiscountPrc;Sum');

        this.billingData.Items.forEach(item => {
            if (item.Unit === 'bruker') {
                csv.push([
                    item.ProductID,
                    item.ProductName,
                    '',
                    '',
                    item.Days,
                    formatNumber(item.Amount),
                    formatNumber(item.Price),
                    item.Unit,
                    formatNumber(item.DiscountPrc),
                    formatNumber(item.Sum)
                ].join(';'));

                item.Details.forEach(details => {
                    details.Tags.forEach(tag => {
                        csv.push([
                            item.ProductID,
                            item.ProductName,
                            details.Name,
                            tag,
                            formatNumber(details.Counter),
                            '',
                            '',
                            item.Unit,
                            formatNumber(item.DiscountPrc),
                            ''
                        ].join(';'));
                    });
                });
            } else if (item.Unit === 'stk') {
                csv.push([
                    item.ProductID,
                    item.ProductName,
                    '',
                    '',
                    '',
                    formatNumber(item.Amount),
                    formatNumber(item.Price),
                    item.Unit,
                    formatNumber(item.DiscountPrc),
                    formatNumber(item.Sum)
                ].join(';'));

                item.Details.forEach(details => {
                    csv.push([
                        item.ProductID,
                        item.ProductName,
                        '',
                        details.Name,
                        '',
                        formatNumber(details.Counter),
                        '',
                        item.Unit,
                        formatNumber(item.DiscountPrc),
                        ''
                    ].join(';'));
                });
            }
        });

        const csvBlob = new Blob([csv.join('\n')], {type: 'text/csv;charset=utf-8;'});
        saveAs(csvBlob, 'estimert-forbruk.csv');
    }
}
