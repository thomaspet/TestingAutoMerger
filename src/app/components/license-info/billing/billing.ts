import {Component} from '@angular/core';
import {ListViewColumn} from '../list-view/list-view';
import {ElsaContractService} from '@app/services/services';
import {saveAs} from 'file-saver';
import * as moment from 'moment';
import {LicenseInfo} from '../license-info';
import {ElsaContractTypePipe} from '@uni-framework/pipes/elsaContractTypePipe';
import {BillingData, BillingDataItem} from '@app/models/elsa-models';
import {UniModalService} from '@uni-framework/uni-modal';
import {ExportBillingModal} from '../export-billing-modal/export-billing-modal';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'license-billing',
    templateUrl: './billing.html',
    styleUrls: ['./billing.sass']
})
export class Billing {
    contractID: number;
    yearSelectOptions: number[];
    periodFilter: { month: number; year: number };
    viewMode: number = 0;

    billingData: BillingData;
    selectedRow: BillingDataItem;
    detailsVisible: boolean;
    hasPermission: boolean;
    totalSumWithPeriods: number;

    emptyData: boolean;
    emptyDataImageUrl = theme.widgets?.empty_state_illustration || 'themes/empty_state.svg';
    emptyDataImageLoaded = false;
    hideEmptyDataImage = false;

    settledUntilInfo: string;

    columns: ListViewColumn[] = [
        {header: 'Varenr', field: 'ProductID'},
        {header: 'Varenavn', field: 'ProductName', flex: '2'},
        {header: 'Antall', field: 'Amount', numberFormat: 'number'},
        {header: 'Enhet', field: 'Unit', flex: '0 0 6rem'},
        {header: 'Pris', field: 'Price', numberFormat: 'money'},
        {header: 'Rabatt', field: 'DiscountPrc', numberFormat: 'percent', flex: '0 0 5rem'},
        {header: 'Sum eks. mva.', field: 'Sum', numberFormat: 'money'},
    ];

    constructor(
        private contractService: ElsaContractService,
        private licenseInfo: LicenseInfo,
        private elsaContractTypePipe: ElsaContractTypePipe,
        private modalService: UniModalService,
    ) {
        const currentYear = new Date().getFullYear();
        this.yearSelectOptions = [currentYear - 2, currentYear - 1, currentYear];
        this.periodFilter = {
            month: new Date().getMonth(),
            year: currentYear
        };
        this.licenseInfo.selectedContractID$.subscribe(id => {
            this.contractID = id;
            this.loadInvoice();
        });
    }

    loadInvoice() {
        this.contractService.getBillingEstimate(
            this.contractID,
            this.periodFilter.year,
            +this.periodFilter.month + 1
        ).subscribe(
            res => {
                this.hasPermission = true;
                this.billingData = res;

                this.settledUntilInfo = moment(this.billingData?.SettledUntil).month() === +this.periodFilter.month
                    ? `I denne perioden starter avregningen fra <b>${moment(this.billingData.SettledUntil).format('DD.MM.YYYY')}</b>`
                    : '';


                if (this.billingData?.Items?.length === 0 && this.billingData?.RelatedOrders?.length === 0) {
                    this.emptyData = true;
                    return;
                }
                this.emptyData = false;

                if (this.billingData?.RelatedOrders?.length > 0) {
                    this.totalSumWithPeriods = 0;
                    this.billingData.RelatedOrders.forEach(order => {
                        order['_period'] = this.setHeaderText(order);
                        this.totalSumWithPeriods += order.Total;
                    });
                    this.billingData.Total += this.totalSumWithPeriods;
                }
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

    setHeaderText(order: BillingData): string {
        // returns ex: 'Delavregning 1-16. juli 2020  --  Lisens: Pluss'
        const period = 'Delavregning ' + moment(order.FromDate).format('D') + '-' + moment(order.ToDate).format('LL');
        const contracttype = 'Lisens: ' + this.elsaContractTypePipe.transform(order.ContractType);
        return period + '&nbsp;&nbsp; &mdash; &nbsp;&nbsp;' + contracttype;
    }

    openExportBillingModal() {
        this.modalService.open(ExportBillingModal, {
            data: {
                contractID: this.contractID,
                selectedYear: this.periodFilter.year,
                selectedMonth: +this.periodFilter.month
            }
        });
    }

    export() {
        const formatNumber = value => value.toString().replace('.', ',');
        const csv = [];

        // csv files has to start with BOM (uFEFF) to support ÆØÅ
        csv.push(
            `\uFEFF${this.billingData.CustomerName};`
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
                    if (details.Tags) {
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
                    } else {
                        csv.push([
                            item.ProductID,
                            item.ProductName,
                            details.Name,
                            '',
                            formatNumber(details.Counter),
                            '',
                            '',
                            item.Unit,
                            formatNumber(item.DiscountPrc),
                            ''
                        ].join(';'));
                    }
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
