import {Component, Input, Output, EventEmitter, OnInit, ViewChild, HostListener} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {UniModalService, UniConfirmModalV2, ConfirmActions} from '../../../../../framework/uni-modal';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../../framework/ui/unitable/index';
import {
    SupplierInvoiceService,
    ErrorService
} from '../../../../services/services';
import {UniTable} from '../../../../../framework/ui/unitable/index';
import {KeyCodes} from '../../../../../app/services/common/keyCodes';
import { IUniSaveAction } from '@uni-framework/save/save';
import { Customer, Product, ReInvoice, ReInvoiceItem, SupplierInvoice } from '@app/unientities';
import { CustomerService } from '@app/services/sales/customerService';
import { MatRadioChange } from '@angular/material';
import { ReInvoicingService } from '@app/services/accounting/ReInvoicingService';

@Component({
    selector: 'uni-reinvoice-modal',
    styles: [
        `.reinvoiceContent { display: flex }`,
        `#reinvoiceFormData { flex-grow: 1; position: relative}`,
        `#reinvoiceFormData .totalsum { position: absolute; bottom: 4rem}`,
        `#reinvoiceTypeLabel { position: relative; display: block; width: 12rem; margin-bottom: 1rem; }`,
        `uni-tooltip { right: 0.0rem; top: -0.3rem; }`,
        `uni-information { width: 50%; height: 100%; font-weight: bold}`,
        `uni-information a { position: absolute; right: 1rem; bottom: 0.5rem }`,
        `uni-information span { display: inline-block; margin-bottom: 1rem; margin-top: 1rem }`,
        `dl {  margin: 0; margin-left: 2rem; }`,
        `dd, dt { display: inline-block }`,
        `.comboButton { margin: 1rem 0 0 1rem; top: 0.85rem }`,
        `footer .comboButton_moreList:not(#saveActionMenu).comboButton_moreList li { width: 100% }`,
    ],
    templateUrl: './reinvoiceModal.html'
})
export class UniReinvoiceModal implements OnInit, IUniModal {

    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();

    public supplierInvoice: SupplierInvoice;
    public open = false;
    public saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre faktur (Fakturert)',
            action: (done) => {
                console.log(done);
            },
            main: true,
            disabled: false
        },
        {
            label: 'Lagre faktur (Kladd)',
            action: (done) => {
                console.log(done);
            },
            main: false,
            disabled: false
        },
        {
            label: 'Lagre ordre (Registrert)',
            action: (done) => {
                console.log(done);
            },
            main: false,
            disabled: false
        }
    ];
    public reinvoicingCustomers = [];
    public items = [];
    public customersTableConfig = null;
    public customersTableConfigTurnOver = null;
    public itemsTableConfig = null;
    public invoiceSum: number = 4000;
    public forReinvoice: boolean = false;
    public reinvoiceType: number = 1;
    public infoText: string = `
        Velg kostandsdeling dersom to eller flere har gått sammen om å anskaffe
        en vare/tjeneste i fellesskap. Ditt firma er mottaker av leverandørfakturaen
        og belaster de øvrige partene for deres andel. Den andelen som skal viderebelastes
        andre balanseføres som en fordring på motpart.
        
        Velg viderefakturering, omsetning dersom leveringen av varen/tjenesten
        skal føres som omsetning. Den andelen som skal viderebelastes andre
        balanseføres som en fordring på motpart.
    `;

    constructor(
        private customerService: CustomerService,
        private reinvoiceService: ReInvoicingService,
        private errorService: ErrorService,
        private modalService: UniModalService) {}

    public ngOnInit() {
        this.customersTableConfig = this.updateCustomersTableConfig(false);
        this.customersTableConfigTurnOver = this.updateCustomersTableConfig(true);
        this.itemsTableConfig = this.updateItemsTableConfig(false);
        this.supplierInvoice = this.options.data.supplierInvoice;

        const supplierID = this.supplierInvoice.SupplierID;
        const invoiceNumber = this.supplierInvoice.InvoiceNumber;
        this.reinvoiceService.GetAll(`filter=SupplierInvoice.SupplierID eq ${supplierID} and SupplierInvoice.InvoiceNumber eq ${invoiceNumber}&orderby=UpdatedAt desc`,
            ['SupplierInvoice', 'Product', 'Product.VatType']).subscribe((result) => {
            this.setInititalConfig(result.length > 0 ? result[0] : null);
        });
    }

    public setInititalConfig(lastReinvoicing: ReInvoice | null) {
        this.reinvoiceType = lastReinvoicing === null ? 0 : lastReinvoicing.ReInvoicingType;
        this.reinvoicingCustomers = this.setInitialCustomerData(
            lastReinvoicing === null ? null : lastReinvoicing,
            lastReinvoicing === null ? null : lastReinvoicing.Product,
            this.supplierInvoice.TaxInclusiveAmount);

        this.items = this.setInitialItemsData(lastReinvoicing === null ? null : lastReinvoicing.Product, this.reinvoicingCustomers);
    }

    public setInitialCustomerData(reinvoice: ReInvoice | null, product: Product, totalAmount: number) {
        if (!reinvoice) {
            const initialItem = new ReInvoiceItem();
            initialItem.ID = 0;
            initialItem.Customer = new Customer();
            initialItem.Customer.ID = 0;
            initialItem.NetAmount = totalAmount;
            initialItem.Share = 100;
            return [initialItem];
        }

        const copyOfItems = [new ReInvoiceItem()].concat(reinvoice.Items);
        copyOfItems[0].ID = 0;
        copyOfItems[0].Customer = new Customer();
        copyOfItems[0].Customer.ID = 0;
        copyOfItems[0].NetAmount = (1 + (reinvoice.OwnCostShare / 100)) * totalAmount;
        copyOfItems[0].Share = 100 - copyOfItems.reduce((previous, current) => previous + current.Share, 0);
        return copyOfItems.map(item => {
            item.NetAmount = totalAmount * (item.Share / 100);
            const priceWithoutTaxes = item.NetAmount * (1 + (item.Surcharge / 100));
            item.GrossAmount = priceWithoutTaxes * (1 + (product.VatType.VatPercent / 100));
            return item;
        });
    }

    public setInitialItemsData(product: any, reinvoicingItems: ReInvoiceItem[]) {
        if (product) {
            return [{
                Product: product,
                NetAmount: 1,
                VatCode: product.VatType,
                GrossAmount: 1
            }];
        } else {
            return [];
        }
    }

    public updateItemsTableConfig(isTurnOver = false) {

        const itemNumberColumn = new UniTableColumn('Product', 'Varenr', UniTableColumnType.Text);
        const itemNameColumn = new UniTableColumn('Product', 'Varenavn', UniTableColumnType.Lookup);
        const itemNetColumn = new UniTableColumn('NetAmount', 'Netto', UniTableColumnType.Money);
        const itemVatCodeColumn = new UniTableColumn('VatCode', 'Mva-kode', UniTableColumnType.Text);
        const itemGrossColumn = new UniTableColumn('GrossAmount', 'Brutto', UniTableColumnType.Money);


        return new UniTableConfig('reinvoicingItems.table', false, false)
            .setColumns([
                itemNumberColumn,
                itemNameColumn,
                itemNetColumn,
                itemVatCodeColumn,
                itemGrossColumn
            ])
            .setEditable(false)
            .setAutoAddNewRow(false)
            .setDeleteButton(false)
            .setColumnMenuVisible(false);

    }

    public updateCustomersTableConfig(isTurnOver = false) {
        const customerTemplateFn = (item: any): string => {
            if (item && item.Customer && item.Customer.ID === 0) {
                return 'Egen kostnad';
            } else {
                if (item && item.Customer && item.Customer.Info) {
                    return item.Customer.CustomerNumber + ' - ' + item.Customer.Info.Name;
                } else {
                    return item && item.Customer ? item.Customer.CustomerNumber : '';
                }
            }
            return '';
        };
        const customerColumn = new UniTableColumn('Customer', 'Kunde', UniTableColumnType.Lookup, (rowModel) => rowModel.Customer.ID !== 0);
        customerColumn.setTemplate(customerTemplateFn)
            .setWidth('10rem')
            .setDisplayField('Info.Name')
            .setOptions({
                itemTemplate: (item: Customer) => {
                    if (item && item.Info) {
                        return item.CustomerNumber + ' - ' + item.Info.Name;
                    } else {
                        return item ? item.CustomerNumber : '';
                    }
                    return '';
                },
                lookupFunction: (query) => {
                    return this.customerService.GetAll(`contains(Info.Name,${query}&top=50`, ['Info']);
                },
            });
        const shareColumn = new UniTableColumn('Share', 'Andel', UniTableColumnType.Percent, (rowModel) => rowModel.Customer.ID !== 0);
        const netColumn = new UniTableColumn('NetAmount', isTurnOver ? 'Netto' : 'Beløp', UniTableColumnType.Money, (rowModel) => rowModel.Customer.ID !== 0)
            .setIsSumColumn(true);

        const surchargeColumn = new UniTableColumn('Surcharge', 'Påslag %', UniTableColumnType.Percent, (rowModel) => rowModel.Customer.ID !== 0);
        const vatColumn = new UniTableColumn('Vat', 'Mva', UniTableColumnType.Money, (rowModel) => rowModel.Customer.ID !== 0);
        const grossColumn = new UniTableColumn('GrossAmount', 'Brutto', UniTableColumnType.Money, (rowModel) => rowModel.Customer.ID !== 0);
        let columns = [
            customerColumn,
            shareColumn,
            netColumn
        ];
        if (isTurnOver) {
            columns = columns.concat([
                surchargeColumn,
                vatColumn,
                grossColumn
            ]);
        }
        return new UniTableConfig('reinvoicing.table', true, false)
            .setIsRowReadOnly((row => row.Customer && row.Customer.ID === 0))
            .setColumns(columns)
            .setColumnMenuVisible(false)
            .setDeleteButton(true, true)
            .setDefaultRowData({
                Customer: {ID: null}
            });
    }

    onReinvoiceTypeChange(change: MatRadioChange) {
        this.reinvoiceType = change.value;
    }

    onReinvoicingCustomerChange(change) {
        const total = this.supplierInvoice.TaxInclusiveAmount;
        const data = [].concat(this.reinvoicingCustomers);
        let cumulativePercentage = 0;
        switch (change.field) {
            case 'Share':
                for (let i = 1; i < data.length; i++) {
                    data[i].NetAmount = total * (data[i].Share / 100);
                    cumulativePercentage += data[i].Share || 0;
                }
                break;
            case 'NetAmount':
                for (let i = 1; i < data.length; i++) {
                    data[i].Share = (data[i].NetAmount / total) * 100;
                    cumulativePercentage += data[i].Share || 0;
                }
                break;
            case 'Surcharge':
                break;
            case 'GrossAmount':
                break;
        }
        data[0].Share = 100 - cumulativePercentage;
        data[0].NetAmount = total * (data[0].Share / 100);
        this.reinvoicingCustomers = data;
    }
}
