import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {ConfirmActions, IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniModalService} from '../../modalService';
import {UniCompanyAccountingSettingsModal} from '../companyAccountingSettingsModal/companyAccountingSettingsModal';
import {
    UniTableColumn,
    UniTableColumnType,
} from '@uni-framework/ui/unitable/config/unitableColumn';
import { UniTableConfig } from '@uni-framework/ui/unitable/config/unitableConfig';
import { ErrorService } from '@app/services/services';
import { IUniSaveAction } from '@uni-framework/save/save';
import {
    CompanyAccountingSettings, Customer, Product, ReInvoice, ReInvoiceItem,
    SupplierInvoice, VatType, StatusCodeReInvoice
} from '@app/unientities';
import { CustomerService } from '@app/services/sales/customerService';
import { MatRadioChange } from '@angular/material';
import { ReInvoicingService } from '@app/services/accounting/ReInvoicingService';
import { CompanyAccountingSettingsService } from '@app/services/accounting/companyAccountingSettingsService';
import { ProductService } from '@app/services/common/productService';
import { VatTypeService } from '@app/services/accounting/vatTypeService';
import * as moment from 'moment';
import { UniMath } from '@uni-framework/core/uniMath';
import { RequestMethod } from '@angular/http';
import { getNewGuid } from '@app/components/common/utils/utils';
import { Observable } from 'rxjs';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { SupplierInvoiceService } from '@app/services/accounting/supplierInvoiceService';
import * as _ from 'lodash';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'uni-reinvoice-modal',
    styles: [
        `.reinvoiceContent { display: flex }`,
        `#reinvoiceFormData { flex-grow: 1; position: relative}`,
        `#reinvoiceFormData .totalsum { position: absolute; bottom: 0rem}`,
        `#reinvoiceTypeLabel { position: relative; display: block; width: 12rem; margin-bottom: 1rem; }`,
        `uni-tooltip { right: 0.0rem; top: -0.3rem; }`,
        `uni-information { width: 50%; height: 100%; font-weight: bold; margin-bottom: 0rem }`,
        `uni-information a { position: absolute; right: 1rem; bottom: 0.5rem }`,
        `uni-information span { display: inline-block; margin-bottom: 1rem; margin-top: 1rem }`,
        `dl {  margin: 0; margin-left: 2rem; }`,
        `dd, dt { display: inline-block }`,
        `dt { width: 7rem}`,
        `.comboButton { margin: 1rem 0 0 1rem; top: 0.85rem }`,
        `footer .comboButton_moreList:not(#saveActionMenu).comboButton_moreList li { width: 100% }`,
    ],
    templateUrl: './reinvoiceModal.html'
})
export class UniReinvoiceModal implements OnInit, IUniModal {

    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();

    public isSaving = false;
    public isReinvoiceValid = true;
    public currentReInvoice: ReInvoice;
    public supplierInvoice: SupplierInvoice;
    public open = false;
    public saveactions: IUniSaveAction[] = [];
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
    public companyAccountSettings: CompanyAccountingSettings;
    constructor(
        private customerService: CustomerService,
        private reinvoiceService: ReInvoicingService,
        private productService: ProductService,
        private vatTypeService: VatTypeService,
        private supplierInvoiceService: SupplierInvoiceService,
        private companyAccountSettingsService: CompanyAccountingSettingsService,
        private toastr: ToastService,
        private errorService: ErrorService,
        private modalService: UniModalService) {}

    public ngOnInit() {
        this.customersTableConfig = this.updateCustomersTableConfig(false);
        this.customersTableConfigTurnOver = this.updateCustomersTableConfig(true);
        this.itemsTableConfig = this.updateItemsTableConfig(false);
        this.supplierInvoice = this.options.data.supplierInvoice;

        const supplierID = this.supplierInvoice.SupplierID;
        const invoiceNumber = this.supplierInvoice.InvoiceNumber;
        let reinvoiceRequest;
        const expand = [
            'Items', 'Items.Customer', 'Items.Customer.Info', 'Items.SupplierInvoice', 'SupplierInvoice',
            'Product', 'Product.VatType', 'Product.VatType.VatTypePercentages'
        ];
        if (this.supplierInvoice.ID) {
            reinvoiceRequest = this.reinvoiceService.GetAll(`filter=SupplierInvoice.ID eq ${this.supplierInvoice.ID}`, expand);
        } else if (supplierID && invoiceNumber) {
            reinvoiceRequest = this.reinvoiceService.GetAll(
                `filter=SupplierInvoice.SupplierID eq ${supplierID} and SupplierInvoice.InvoiceNumber eq '${invoiceNumber}'`
                + `&orderby=UpdatedAt desc`, expand
            );
        } else {
            reinvoiceRequest = Observable.of([]);
        }
        reinvoiceRequest.subscribe((result: ReInvoice[]) => {
            if (result && result.length && result[0] && result[0].SupplierInvoiceID === this.supplierInvoice.ID) {
                this.currentReInvoice = result[0];
            } else if (result && result.length && result[0] && result[0].SupplierInvoiceID !== this.supplierInvoice.ID) {
                this.currentReInvoice = new ReInvoice();
                this.currentReInvoice.SupplierInvoiceID = this.supplierInvoice.ID;
                this.currentReInvoice.SupplierInvoice = this.supplierInvoice;
                this.currentReInvoice.Product = _.cloneDeep(result[0].Product);
                this.currentReInvoice.ProductID = result[0].ProductID;
                this.currentReInvoice.ReInvoicingType = result[0].ReInvoicingType;
                this.currentReInvoice.OwnCostAmount = result[0].OwnCostAmount;
                this.currentReInvoice.OwnCostShare = result[0].OwnCostShare;
                this.currentReInvoice.TaxInclusiveAmount = result[0].TaxInclusiveAmount;
                this.currentReInvoice.TaxExclusiveAmount = result[0].TaxExclusiveAmount;
                this.currentReInvoice.Items = _.cloneDeep(result[0].Items);
            } else {
                this.currentReInvoice = null;
            }
            this.setInititalConfig(this.currentReInvoice);

            this.companyAccountSettingsService.GetAll('',
                [
                    'ReInvoicingCostsharingProduct', 'ReInvoicingTurnoverProduct',
                    'ReInvoicingCostsharingProduct.Account', 'ReInvoicingTurnoverProduct.Account',
                    'ReInvoicingCostsharingProduct.VatType', 'ReInvoicingTurnoverProduct.VatType',
                    'ReInvoicingCostsharingProduct.VatType.VatTypePercentages', 'ReInvoicingTurnoverProduct.VatType.VatTypePercentages'
                ]
            ).subscribe((result: CompanyAccountingSettings[]) => {
                if (result && result[0] && result[0].ReInvoicingCostsharingProductID && result[0].ReInvoicingTurnoverProductID) {
                    this.companyAccountSettings = result[0];
                    this.updateItemsData();
                    this.updateActions(this.companyAccountSettings.ReInvoicingMethod);
                } else {
                    this.modalService.open(UniCompanyAccountingSettingsModal, {
                        data: {
                            model: (result && result[0]) || null
                        }
                    }).onClose.subscribe(settings => {
                        if (settings) {
                            this.companyAccountSettings = settings;
                            this.updateActions(this.companyAccountSettings.ReInvoicingMethod);
                        }
                    });
                }
            });
        });
    }
    public getMainAction() {
        return this.saveactions.find((item) => item.main);
    }
    public updateActions(type: number) {
        this.saveactions = [
            {
                label: 'Lag faktura (Kladd)',
                action: () => {
                    this.saveReinvoiceAs('create-invoices-draft');
                },
                main: type === 0,
                disabled: !this.isReinvoiceValid
            },
            {
                label: 'Lag faktura (Fakturert)',
                action: () => {
                    this.saveReinvoiceAs('create-invoices');
                },
                main: type === 1,
                disabled: !this.isReinvoiceValid
            },
            {
                label: 'Lag ordre (Registrert)',
                action: () => {
                    this.saveReinvoiceAs('create-orders');
                },
                main: type === 2,
                disabled: !this.isReinvoiceValid
            },
            {
                label: 'Slett viderefakturering',
                action: () => {
                    this.deleteReinvoice();
                },
                disabled: (!this.currentReInvoice || this.currentReInvoice.ID === 0)
            }
        ];
    }

    public deleteReinvoice() {
        this.modalService.confirm({
            header: 'Bekreft sletting',
            message: 'Er du sikker på at du vil slette viderefakturering?',
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(modalResponse => {
            if (modalResponse === ConfirmActions.ACCEPT) {
                this.reinvoiceService.Remove(this.currentReInvoice.ID).subscribe(
                    () => {
                        this.currentReInvoice = null;
                        this.onClose.emit(false);
                    },
                    error => 
                    {
                        if (!isNullOrUndefined(error._body)) {
                            const msg = this.errorService.extractMessage(error);
                            this.toastr.addToast(msg, ToastType.warn, ToastTime.forever);
                        } else {
                            this.errorService.handle(error);
                        }
                    }
                )
            }
        });
    }

    public saveReinvoiceAs(type: string) {
        this.isSaving = true;
        if (!this.currentReInvoice) {
            this.currentReInvoice = new ReInvoice();
            this.currentReInvoice._createguid = getNewGuid();
        }
        this.currentReInvoice.OwnCostShare = this.reinvoicingCustomers[0].Share;
        this.currentReInvoice.OwnCostAmount = this.reinvoicingCustomers[0].NetAmount;
        this.currentReInvoice.ProductID = this.items[0].Product.ID;
        this.currentReInvoice.Product = this.items[0].Product;
        this.currentReInvoice.Items = this.reinvoicingCustomers.reduce((prev: ReInvoiceItem[], current: ReInvoiceItem) => {
            if (current.Customer && current.Customer.ID > 0) {
                if (!current.ID) {
                    current._createguid = getNewGuid();
                }
                prev.push(current);
                return prev;
            }
            return prev;
        }, []);
        this.currentReInvoice.TaxInclusiveAmount = this.calcReinvoicingGrossAmount();
        this.currentReInvoice.TaxExclusiveAmount = this.calcReinvoicingAmount();
        this.currentReInvoice.ReInvoicingType = this.reinvoiceType;
        this.currentReInvoice.SupplierInvoiceID = this.supplierInvoice.ID;
        let saveSupplierInvoiceRequest = Observable.of(this.supplierInvoice);
        if (!this.supplierInvoice.ID) {
            this.currentReInvoice.SupplierInvoice = this.supplierInvoice;
            this.supplierInvoice._createguid = getNewGuid();
            saveSupplierInvoiceRequest = this.supplierInvoiceService.Post(this.supplierInvoice);
        }
        let validationRequest = this.reinvoiceService.ActionWithBody(null, this.currentReInvoice, 'valid-message', RequestMethod.Put);
        if (type === '') {
            validationRequest = Observable.of(String);
        }
        validationRequest.subscribe(validMsg => {
                if (validMsg === '') {
                    saveSupplierInvoiceRequest
                        .finally(() => this.isSaving = false)
                        .subscribe(supplierInvoice => {
                        this.currentReInvoice.SupplierInvoiceID = supplierInvoice.ID;
                        this.currentReInvoice.SupplierInvoice = supplierInvoice;
                        let saveRequest = this.reinvoiceService.Put(this.currentReInvoice.ID, this.currentReInvoice);
                        if (!this.currentReInvoice.ID) {
                            saveRequest = this.reinvoiceService
                                .ActionWithBody(
                                    null, this.currentReInvoice, 'mark-create', RequestMethod.Post,
                                    'supplierInvoiceID=' + supplierInvoice.ID
                                );
                        }
                        saveRequest
                            .finally(() => this.isSaving = false)
                            .subscribe(reinvoice => {
                            if (type !== '') {
                                this.reinvoiceService.Action(reinvoice.ID, type).subscribe(() => {
                                    this.onClose.emit({
                                        supplierInvoice: supplierInvoice,
                                        reinvoice: reinvoice
                                    });
                                    this.isSaving = false;
                                });
                            } else {
                                this.onClose.emit({
                                    supplierInvoice: supplierInvoice,
                                    reinvoice: reinvoice
                                });
                                this.isSaving = false;
                            }
                        });
                    });
                } else {
                    this.toastr.addToast(validMsg);
                    this.isSaving = false;
                }
            });
    }

    public setInititalConfig(lastReinvoicing: ReInvoice | null) {
        this.reinvoiceType = lastReinvoicing === null ? 0 : lastReinvoicing.ReInvoicingType;
        this.reinvoicingCustomers = this.setInitialCustomerData(
            lastReinvoicing === null ? null : lastReinvoicing,
            lastReinvoicing === null ? null : lastReinvoicing.Product,
            this.supplierInvoice.TaxInclusiveAmountCurrency);

        this.items = this.setInitialItemsData(lastReinvoicing === null ? null : lastReinvoicing.Product);
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
        copyOfItems[0].NetAmount = (1 + ((reinvoice.OwnCostShare || 0) / 100)) * totalAmount;
        copyOfItems[0].Share = 100 - copyOfItems.reduce((previous, current) => previous + (current && current.Share || 0), 0);
        return copyOfItems.map(item => {
            if (!item) {
                item = new ReInvoiceItem();
            }
            item.NetAmount = totalAmount * ((item && item.Share || 0) / 100);
            const priceWithoutTaxes = (item && item.NetAmount || 0) * (1 + ((item && item.Surcharge || 0) / 100));
            const vatPercent = (product && product.VatType && product.VatType.VatPercent) || 0;
            item.GrossAmount = priceWithoutTaxes * (1 + (vatPercent / 100));
            return item;
        });
    }

    public setInitialItemsData(product: any) {
        if (product) {
            if (product.VatType) {
                const today = moment(new Date());
                const vatType = product.VatType;
                const currentPercentage =
                    vatType.VatTypePercentages.find(y =>
                    (moment(y.ValidFrom) <= today && y.ValidTo && moment(y.ValidTo) >= today)
                    || (moment(y.ValidFrom) <= today && !y.ValidTo));

                if (currentPercentage) {
                    product.VatType.VatPercent = currentPercentage.VatPercent;
                }
            }
            return [{
                Product: product,
                NetAmount: 0,
                VatType: product.VatType,
                GrossAmount: 0
            }];
        } else {
            return [];
        }
    }

    public updateItemsData(product?: Product) {
        const line: any = {};
        if (product) {
            line.Product = product;
        } else {
            line.Product = this.reinvoiceType === 0 ? this.companyAccountSettings.ReInvoicingCostsharingProduct : this.companyAccountSettings.ReInvoicingTurnoverProduct;
        }
        line.NetAmount = this.calcItemNetAmount();
        line.VatType = line.Product.VatType;
        if (line.VatType) {
            const today = moment(new Date());
            const vatType = line.VatType;
            const currentPercentage =
                vatType.VatTypePercentages.find(y =>
                (moment(y.ValidFrom) <= today && y.ValidTo && moment(y.ValidTo) >= today)
                || (moment(y.ValidFrom) <= today && !y.ValidTo));

            if (currentPercentage) {
                line.VatType.VatPercent = currentPercentage.VatPercent;
            }
        }
        line.GrossAmount = this.calcItemGrossAmount(line);
        this.items = [line];
    }

    public calcReinvoicingAmount() {
        return UniMath.round(this.reinvoicingCustomers.reduce((previous, current) => {
            return previous + (current.NetAmount || 0);
        }, 0));
    }

    public calcReinvoicingGrossAmount() {
        return UniMath.round(this.reinvoicingCustomers.reduce((previous, current) => {
            return previous + (current.NetAmount || 0);
        }, 0));
    }

    public calcItemNetAmount() {
        return UniMath.round(this.reinvoicingCustomers.slice(1).reduce((previous, current) => {
            return previous + (current.NetAmount || 0) * (1 + (current.Surcharge / 100 || 0));
        }, 0));
    }

    public calcItemGrossAmount(line) {
        const vatPercent = line && line.VatType && line.VatType.VatPercent || 0;
        return UniMath.round((line.GrossAmount || 0) * (1 + ((vatPercent / 100) || 0)));
    }

    public updateItemsTableConfig(isTurnOver = false) {

        const itemNameColumn = new UniTableColumn('Product', 'Vare', UniTableColumnType.Lookup, true);
        itemNameColumn.setTemplate((row) => row.Product ? row.Product.ID + ' - ' + row.Product.Name : '');
        itemNameColumn.setOptions({
            itemTemplate: (item: Product) => {
                if (item && item.Name) {
                    return item.ID + ' - ' + item.Name;
                }
                return '';
            },
            lookupFunction: (query) => {
                return this.productService.GetAll(
                    `filter=startswith(ID,'${query}') or contains(Name,'${query}')&top=50`,
                    ['Account', 'VatType', 'VatType.VatTypePercentages']
                );
            },
        });
        const itemNetColumn = new UniTableColumn('NetAmount', 'Netto', UniTableColumnType.Money, false);
        const itemVatCodeColumn = new UniTableColumn('VatCode', 'Mva-kode', UniTableColumnType.Text, false);
        itemVatCodeColumn
            .setTemplate((row) => {
                return row.VatType ? (row.VatType.VatCode || '-') + ': ' + row.VatType.VatPercent || 0 + '%' : '';
            });
        const itemGrossColumn = new UniTableColumn('GrossAmount', 'Brutto', UniTableColumnType.Money, false);


        return new UniTableConfig('reinvoicingItems.table', false, false)
            .setColumns([
                itemNameColumn,
                itemNetColumn,
                itemVatCodeColumn,
                itemGrossColumn
            ])
            .setEditable(true)
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
        const customerColumn = new UniTableColumn('Customer', 'Kunde', UniTableColumnType.Lookup, (rowModel) => !rowModel.Customer || rowModel.Customer.ID !== 0);
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
        const shareColumn = new UniTableColumn('Share', 'Andel', UniTableColumnType.Percent, (rowModel) => rowModel.Customer && rowModel.Customer.ID !== 0);
        const netColumn = new UniTableColumn('NetAmount', isTurnOver ? 'Netto' : 'Beløp', UniTableColumnType.Money, (rowModel) => rowModel.Customer && rowModel.Customer.ID !== 0)
            .setIsSumColumn(true);

        const surchargeColumn = new UniTableColumn('Surcharge', 'Påslag %', UniTableColumnType.Percent, (rowModel) => rowModel.Customer && rowModel.Customer.ID !== 0);
        const vatColumn = new UniTableColumn('Vat', 'Mva', UniTableColumnType.Money, false);
        const grossColumn = new UniTableColumn('GrossAmount', 'Brutto', UniTableColumnType.Money, (rowModel) => rowModel.Customer && rowModel.Customer.ID !== 0);
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
            .setConditionalRowCls(row => this.isReinvoiceValid ? '' : 'bad')
            .setDefaultRowData({
                Customer: {ID: null}
            });
    }

    onReinvoiceTypeChange(change: MatRadioChange) {
        this.reinvoiceType = change.value;
        if (this.reinvoiceType === 0) {
            this.removeSurchargeAndVat();
            this.updateItemsData(this.items[0] && this.items[0].Product);
            this.onReinvoicingCustomerChange(null);
        }
    }

    onItemChange(change) {
        this.updateItemsData(change.newValue);
        this.onReinvoicingCustomerChange(null);
    }

    removeSurchargeAndVat() {
        this.reinvoicingCustomers = this.reinvoicingCustomers.map((item: ReInvoiceItem, index: number) => {
            if (index === 0) {
                return item;
            }
            item.Surcharge = 0;
            item.Vat = 0;
            return item;
        });
    }

    onReinvoicingCustomerChange(change) {
        const total = this.supplierInvoice.TaxInclusiveAmountCurrency;
        const data = [].concat(this.reinvoicingCustomers);
        let cumulativePercentage = 0;
        for (let i = 1; i < data.length; i++) {
            if (data[i].Customer && data[i].Customer.ID === 0) {
                data[i].Customer = null;
            }
            if (change) {
                switch (change.field) {
                    case 'NetAmount':
                        data[i].Share = UniMath.round(((data[i].NetAmount || 0) / total) * 100);
                        break;
                    case 'Share':
                        data[i].NetAmount = UniMath.round(total * ((data[i].Share || 0) / 100));
                        break;
                }
            }
            const vatPercent = (this.items[0] && this.items[0].VatType && this.items[0].VatType.VatPercent) || 0;
            data[i].Vat = UniMath.round(data[i].NetAmount * (1 + ((data[i].Surcharge || 0) / 100)) * vatPercent / 100);
            data[i].GrossAmount = UniMath.round(data[i].NetAmount * (1 + ((data[i].Surcharge || 0) / 100)) + data[i].Vat);
            cumulativePercentage += UniMath.round(data[i].Share || 0);
        }
        data[0].Share = 100 - cumulativePercentage;
        data[0].NetAmount = UniMath.round(total * ((data[0].Share || 0) / 100));
        this.reinvoicingCustomers = data;
        this.items[0].NetAmount = this.calcItemNetAmount();
        this.items[0].GrossAmount = this.calcItemGrossAmount(this.items[0]);
        this.items = [].concat(this.items);
        this.isReinvoiceValid = this.validate(this.reinvoicingCustomers);
        const mainActionIndex = this.saveactions.findIndex(item => item === this.getMainAction());
        this.updateActions(mainActionIndex);
    }

    validate(items: ReInvoiceItem[]) {
        let totalShare = 0;
        const checkedCustomers: ReInvoiceItem[] = [];
        let customerRepeated = false;
        for (let i = 0; i < items.length; i++) {
            totalShare += (items[i].Share || 0);
            if (checkedCustomers.findIndex(item => items[i].Customer && item.Customer && item.Customer.ID === items[i].Customer.ID && items[i].Customer.ID !== null) >= 0) {
                customerRepeated = true;
            }
            checkedCustomers.push(items[i]);
        }
        let emptyCustomer = false;
        for (let i = 0; i < items.length; i++) {
            if (!items[i].Customer) {
                emptyCustomer = true;
            }
        }
        const amount = this.calcReinvoicingAmount();
        const total = this.supplierInvoice.TaxInclusiveAmountCurrency;
        return (totalShare === 100 && items[0].Share >= 0 && !customerRepeated && !emptyCustomer && total === amount);
    }

    openSettingsModal() {
        this.modalService.open(UniCompanyAccountingSettingsModal, {
            data: {
                model: this.companyAccountSettings
            }
        }).onClose.subscribe(result => {
            if (result) {
                this.companyAccountSettings = result;
                this.updateActions(this.companyAccountSettings.ReInvoicingMethod);
                this.updateItemsData();
            }
        });
    }
}
