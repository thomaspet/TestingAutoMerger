import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import {ConfirmActions, IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniModalService} from '../../modalService';
import {UniCompanyAccountingSettingsModal} from '../companyAccountingSettingsModal/companyAccountingSettingsModal';
import {
    UniTableColumn,
    UniTableColumnType,
} from '@uni-framework/ui/unitable/config/unitableColumn';
import { UniTableConfig } from '@uni-framework/ui/unitable/config/unitableConfig';
import { ErrorService, StatisticsService } from '@app/services/services';
import { IUniSaveAction } from '@uni-framework/save/save';
import {
    CompanyAccountingSettings, Customer, Product, ReInvoice, ReInvoiceItem,
    SupplierInvoice, VatType, StatusCodeReInvoice, Tracelink
} from '@app/unientities';
import { CustomerService } from '@app/services/sales/customerService';
import { MatRadioChange } from '@angular/material';
import { ReInvoicingService } from '@app/services/accounting/ReInvoicingService';

import { CompanyAccountingSettingsService } from '@app/services/accounting/companyAccountingSettingsService';
import { ProductService } from '@app/services/common/productService';
import * as moment from 'moment';
import { UniMath } from '@uni-framework/core/uniMath';
import { RequestMethod } from '@angular/http';
import { getNewGuid } from '@app/components/common/utils/utils';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { SupplierInvoiceService } from '@app/services/accounting/supplierInvoiceService';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'uni-reinvoice-modal',
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
        private changeDetectorRef: ChangeDetectorRef,
        private router: Router,
        private statisticsService: StatisticsService,
        private customerService: CustomerService,
        private reinvoiceService: ReInvoicingService,
        private productService: ProductService,
        private supplierInvoiceService: SupplierInvoiceService,
        private companyAccountSettingsService: CompanyAccountingSettingsService,
        private toastr: ToastService,
        private errorService: ErrorService,
        private modalService: UniModalService) {}

    public ngOnInit(skipRebuildTables: boolean = false) {

        if (!skipRebuildTables) {
            this.customersTableConfig = this.updateCustomersTableConfig(false);
            this.customersTableConfigTurnOver = this.updateCustomersTableConfig(true);
            this.itemsTableConfig = this.updateItemsTableConfig(false);
            this.supplierInvoice = this.options.data.supplierInvoice;
        }
        const supplierID = this.supplierInvoice.SupplierID;
        const invoiceNumber = this.supplierInvoice.InvoiceNumber;
        let reinvoiceRequest;
        const expand = [
            'Items', 'Items.Customer', 'Items.Customer.Info', 'Items.SupplierInvoice', 'SupplierInvoice',
            'Product', 'Product.VatType', 'Product.VatType.VatTypePercentages'
        ];
        if (!this.supplierInvoice.ID) {
            // save as draft
            if (!this.supplierInvoice._createguid) {
                this.supplierInvoice._createguid = getNewGuid();
            }
            this.supplierInvoiceService.Post(this.supplierInvoice).subscribe(supplierInvoice => {
                this.router.navigateByUrl('/accounting/bills/' + supplierInvoice.ID);
                this.supplierInvoice = supplierInvoice;
                if (supplierID && invoiceNumber) {
                    reinvoiceRequest = this.reinvoiceService.GetAll(
                        `filter=SupplierInvoice.SupplierID eq ${supplierID} and SupplierInvoice.InvoiceNumber eq '${invoiceNumber}'`
                        + `&orderby=UpdatedAt desc`, expand
                    );
                } else {
                    reinvoiceRequest = Observable.of([]);
                }
                this.runReInvoiceRequest(reinvoiceRequest);
            });
        } else {
            reinvoiceRequest = this.reinvoiceService.GetAll(`filter=SupplierInvoice.ID eq ${this.supplierInvoice.ID}`, expand);
            this.runReInvoiceRequest(reinvoiceRequest);
        }
    }

    public runReInvoiceRequest(reinvoiceRequest) {
        reinvoiceRequest.subscribe((result: ReInvoice[]) => {
            if (result && result.length && result[0] && result[0].SupplierInvoiceID === this.supplierInvoice.ID) {
                this.currentReInvoice = result[0];
                if (result[0] && result[0].Items) {
                    this.AddReinvoiceItemTOFLinks(result[0].Items).subscribe(items => {
                        this.currentReInvoice.Items = _.cloneDeep(items);
                        this.setInitialConfig(this.currentReInvoice);
                    }, err => this.errorService.handle(err));
                } else {
                    this.setInitialConfig(this.currentReInvoice);
                }
            } else if (result && result.length && result[0] && result[0].SupplierInvoiceID !== this.supplierInvoice.ID) {
                this.currentReInvoice = new ReInvoice();
                this.currentReInvoice.SupplierInvoiceID = this.supplierInvoice.ID;
                this.currentReInvoice.SupplierInvoice = this.supplierInvoice;
                this.currentReInvoice.Product = _.cloneDeep(result[0].Product);
                this.currentReInvoice.ProductID = result[0].ProductID;
                this.currentReInvoice.ReInvoicingType = result[0].ReInvoicingType;
                this.currentReInvoice.OwnCostAmount = result[0].OwnCostAmount;
                this.currentReInvoice.OwnCostShare = result[0].OwnCostShare;
                this.currentReInvoice.TaxExclusiveAmount = result[0].TaxExclusiveAmount;
                this.currentReInvoice.TaxInclusiveAmount = result[0].TaxInclusiveAmount;
                this.currentReInvoice.Items = _.cloneDeep(result[0].Items);
            } else {
                this.currentReInvoice = new ReInvoice();
                this.currentReInvoice._createguid = getNewGuid();
                this.currentReInvoice.SupplierInvoiceID = this.supplierInvoice.ID;
                this.currentReInvoice.SupplierInvoice = this.supplierInvoice;
                this.currentReInvoice.TaxInclusiveAmount = this.supplierInvoice.TaxInclusiveAmount;
                this.currentReInvoice.TaxExclusiveAmount = this.supplierInvoice.TaxExclusiveAmount;
                this.currentReInvoice.ReInvoicingType = 0;
                this.onReinvoiceTypeChange(new MatRadioChange(null, 0));
                if (result[0] && result[0].Items) {
                    this.AddReinvoiceItemTOFLinks(result[0].Items).subscribe(items => {
                        this.currentReInvoice.Items = _.cloneDeep(items);
                        this.setInitialConfig(this.currentReInvoice);
                    }, err => this.errorService.handle(err));
                } else {
                    this.setInitialConfig(this.currentReInvoice);
                }
            }

            this.customersTableConfig = this.updateCustomersTableConfig(false);
            this.customersTableConfigTurnOver = this.updateCustomersTableConfig(true);
            this.itemsTableConfig = this.updateItemsTableConfig(false);

            this.companyAccountSettingsService.GetAll('',
                [
                    'ReInvoicingCostsharingProduct', 'ReInvoicingTurnoverProduct',
                    'ReInvoicingCostsharingProduct.Account', 'ReInvoicingTurnoverProduct.Account',
                    'ReInvoicingCostsharingProduct.VatType', 'ReInvoicingTurnoverProduct.VatType',
                    'ReInvoicingCostsharingProduct.VatType.VatTypePercentages', 'ReInvoicingTurnoverProduct.VatType.VatTypePercentages'
                ]
            ).subscribe((data: CompanyAccountingSettings[]) => {
                if (data && data[0] && data[0].ReInvoicingCostsharingProductID && data[0].ReInvoicingTurnoverProductID) {
                    this.companyAccountSettings = data[0];
                    this.updateItemsData();
                    this.updateActions(this.companyAccountSettings.ReInvoicingMethod);
                } else {
                    this.modalService.open(UniCompanyAccountingSettingsModal, {
                        data: {
                            model: (data && data[0]) || null
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


    private AddReinvoiceItemTOFLinks(items: ReInvoiceItem[]): Observable<ReInvoiceItem[]> {
        return this.statisticsService.GetAllUnwrapped(
            `model=Tracelink&select=CustomerInvoice.CustomerID,`
            + `isnull(customerinvoice.invoiceNumber,'kladd') as invoiceNumber,CustomerInvoice.ID`
            + `&filter=DestinationEntityName eq 'CustomerInvoice' `
            + `and SourceEntityName eq 'ReInvoice' and SourceInstanceID eq ` + this.currentReInvoice.ID
            + `&join=CustomerInvoice on Tracelink.DestinationInstanceId eq CustomerInvoice.ID`
        ).pipe(
            switchMap((linkedInvoices) => {
                if (!linkedInvoices.length) {
                    return this.statisticsService.GetAllUnwrapped(
                        `model=Tracelink&select=CustomerOrder.CustomerID,`
                        + `isnull(CustomerOrder.orderNumber, 0) as orderNumber,CustomerOrder.ID`
                        + `&filter=DestinationEntityName eq 'CustomerOrder' `
                        + `and SourceEntityName eq 'ReInvoice' and SourceInstanceID eq ` + this.currentReInvoice.ID
                        + `&join=CustomerOrder on Tracelink.DestinationInstanceId eq CustomerOrder.ID`
                    ).map((linkedOrders) => {
                        items.forEach(reInvoiceItem => {
                            linkedOrders.forEach(lt => {
                                if (lt.CustomerOrderCustomerID === reInvoiceItem.CustomerID) {
                                    reInvoiceItem['_link'] = '/sales/orders/' + lt.CustomerOrderID;
                                    reInvoiceItem['_linkText'] = lt.orderNumber;
                                }
                            });
                        });
                        return items;
                    });
                } else {
                    items.forEach(reInvoiceItem => {
                        linkedInvoices.forEach(lt => {
                            if (lt.CustomerInvoiceCustomerID === reInvoiceItem.CustomerID) {
                                reInvoiceItem['_link'] = '/sales/invoices/' + lt.CustomerInvoiceID;
                                reInvoiceItem['_linkText'] = lt.invoiceNumber;
                            }
                        });
                    });
                    return Observable.of(items);
                }
            })
        );
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
                disabled: !this.isReinvoiceValid || this.currentReInvoice.StatusCode === StatusCodeReInvoice.ReInvoiced
            },
            {
                label: 'Lag faktura (Fakturert)',
                action: () => {
                    this.saveReinvoiceAs('create-invoices');
                },
                main: type === 1,
                disabled: !this.isReinvoiceValid || this.currentReInvoice.StatusCode === StatusCodeReInvoice.ReInvoiced
            },
            {
                label: 'Lag ordre (Registrert)',
                action: () => {
                    this.saveReinvoiceAs('create-orders');
                },
                main: type === 2,
                disabled: !this.isReinvoiceValid || this.currentReInvoice.StatusCode === StatusCodeReInvoice.ReInvoiced
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
        this.currentReInvoice.Product = null;
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

        if (!this.supplierInvoice.ID) {
            this.currentReInvoice.SupplierInvoice = this.supplierInvoice;
        }
        let validationRequest = this.reinvoiceService.ActionWithBody(null, this.currentReInvoice, 'valid-message', RequestMethod.Put);
        if (type === '') {
            validationRequest = Observable.of(null);
        } else {
            if (!this.isSupplierInvoiceJournaled() && this.currentReInvoice.ReInvoicingType === 1) {
                this.toastr.addToast('', ToastType.bad, 10, 'Leverandørfakturaen må være bokført før du kan lage Viderefakturering, omsetning');
                this.isSaving = false;
                return;
            }
            this.toastr.addToast('Faktura / ordre opprettes ...', ToastType.warn, 2);
        }
        validationRequest.subscribe(errorMsg => {
            if (!errorMsg) {
                this.currentReInvoice.SupplierInvoiceID = this.supplierInvoice.ID;
                this.currentReInvoice.SupplierInvoice = this.supplierInvoice;
                let saveRequest = this.reinvoiceService.Put(this.currentReInvoice.ID, this.currentReInvoice);
                if (!this.currentReInvoice.ID) {
                    saveRequest = this.reinvoiceService
                        .ActionWithBody(
                            null, this.currentReInvoice, 'mark-create', RequestMethod.Post,
                            'supplierInvoiceID=' + this.supplierInvoice.ID
                        );
                }
                saveRequest
                    .finally(() => this.isSaving = false)
                    .subscribe(reinvoice => {
                        if (type !== '') {
                            this.reinvoiceService.Action(reinvoice.ID, type).subscribe(() => {
                                this.ngOnInit(true);
                                this.toastr.addToast('Faktura / ordre ble opprettet!', ToastType.good, 6);
                                this.isSaving = false;
                            });
                        } else {
                            this.ngOnInit(true);
                            this.toastr.addToast('Viderefakturering ble lagret !', ToastType.good, 6);
                            this.isSaving = false;
                        }
                    });
            } else {
                this.toastr.addToast(errorMsg);
                this.isSaving = false;
            }
        });
    }

    public setInitialConfig(lastReinvoicing: ReInvoice | null) {
        this.reinvoiceType = lastReinvoicing === null ? 0 : lastReinvoicing.ReInvoicingType;
        this.reinvoicingCustomers = this.setInitialCustomerData(
            lastReinvoicing === null ? null : lastReinvoicing,
            lastReinvoicing === null ? null : lastReinvoicing.Product,
            this.reinvoiceType === 0 ? this.supplierInvoice.TaxInclusiveAmount : this.supplierInvoice.TaxExclusiveAmount);

        this.items = this.setInitialItemsData(lastReinvoicing === null ? null : lastReinvoicing.Product);
    }

    public setInitialCustomerData(reinvoice: ReInvoice | null, product: Product, totalAmount: number) {
        if (!reinvoice) {
            const initialItem = new ReInvoiceItem();
            initialItem.ID = 0;
            initialItem.Customer = new Customer();
            initialItem.Customer.ID = 0;
            if (this.reinvoiceType === 0) {
                initialItem.GrossAmount = totalAmount;
            } else {
                initialItem.NetAmount = totalAmount;
            }
            initialItem.Share = 100;
            return [initialItem];
        }

        const copyOfItems = [new ReInvoiceItem()].concat(reinvoice.Items || []);
        copyOfItems[0].ID = 0;
        copyOfItems[0].Customer = new Customer();
        copyOfItems[0].Customer.ID = 0;
        if (this.reinvoiceType === 0) {
            copyOfItems[0].GrossAmount = (1 + ((reinvoice.OwnCostShare || 0) / 100)) * totalAmount;
        } else {
            copyOfItems[0].NetAmount = (1 + ((reinvoice.OwnCostShare || 0) / 100)) * totalAmount;
        }
        copyOfItems[0].NetAmount = (1 + ((reinvoice.OwnCostShare || 0) / 100)) * totalAmount;
        copyOfItems[0].Share = 100 - copyOfItems.reduce((previous, current) => previous + (current && current.Share || 0), 0);
        return copyOfItems.map(item => {
            if (!item) {
                item = new ReInvoiceItem();
            }
            if (this.reinvoiceType === 1) {
                item.NetAmount = totalAmount * ((item && item.Share || 0) / 100);
                const priceWithoutTaxes = (item && item.NetAmount || 0) * (1 + ((item && item.Surcharge || 0) / 100));
                const vatPercent = (product && product.VatType && product.VatType.VatPercent) || 0;
                item.GrossAmount = priceWithoutTaxes * (1 + (vatPercent / 100));
            } else {
                item.GrossAmount = totalAmount * ((item && item.Share || 0) / 100);
                item.NetAmount = item.GrossAmount / (1 + (item && item.Share || 0) / 100)
            }
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
                NetAmount: this.supplierInvoice.TaxExclusiveAmount,
                VatType: product.VatType,
                GrossAmount: this.supplierInvoice.TaxInclusiveAmount
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
            if (this.companyAccountSettings) {
                line.Product = this.reinvoiceType === 0 ? this.companyAccountSettings.ReInvoicingCostsharingProduct : this.companyAccountSettings.ReInvoicingTurnoverProduct;
            } else {
                line.Product = new Product();
            }
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
        return UniMath.round((line.NetAmount || 0) * (1 + ((vatPercent / 100) || 0)));
    }

    public updateItemsTableConfig(isTurnOver = false) {

        const itemNameColumn = new UniTableColumn('Product', 'Produkt', UniTableColumnType.Lookup, true);
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
        const itemNetColumn = new UniTableColumn('NetAmount', 'Netto', UniTableColumnType.Money, false)
            .setWidth('2rem');
        const itemVatCodeColumn = new UniTableColumn('VatCode', 'Mva-kode', UniTableColumnType.Text, false);
        itemVatCodeColumn
            .setWidth('2rem')
            .setTemplate((row) => {
                return row.VatType ? (row.VatType.VatCode || '-') + ': ' + row.VatType.VatPercent || 0 + '%' : '';
            });
        const itemGrossColumn = new UniTableColumn('GrossAmount', 'Brutto', UniTableColumnType.Money, false)
            .setWidth('2rem');


        return new UniTableConfig('reinvoicingItems.table', this.currentReInvoice && this.currentReInvoice.StatusCode !== StatusCodeReInvoice.ReInvoiced, false)
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
        const customerColumn = new UniTableColumn('Customer', 'Kunde', UniTableColumnType.Lookup, true);
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
        const shareColumn = new UniTableColumn('Share', 'Andel', UniTableColumnType.Percent, true)
            .setWidth('2rem');
        const netColumn = new UniTableColumn('NetAmount', 'Netto', UniTableColumnType.Money, true)
            .setWidth('2rem')
            .setIsSumColumn(true);

        const surchargeColumn = new UniTableColumn('Surcharge', 'Påslag %', UniTableColumnType.Percent, true)
            .setWidth('2rem');
        const vatColumn = new UniTableColumn('Vat', 'Mva', UniTableColumnType.Money, false)
            .setWidth('2rem');
        const grossColumn = new UniTableColumn('GrossAmount', isTurnOver ? 'Brutto' : 'Beløp', UniTableColumnType.Money, true)
            .setWidth('2rem');
        const linkColumn = new UniTableColumn('_link', 'Link', UniTableColumnType.Text, false)
            .setWidth(40)
            .setTemplate(rowModel => {
                if (!rowModel._link) {
                    return '';
                }
                return rowModel._linkText;
            })
            .setLinkClick((rowModel => {
                this.router.navigateByUrl(rowModel._link).then(() => this.onClose.emit(false));
            }));
        let columns = [
            customerColumn,
            shareColumn
        ];
        if (isTurnOver) {
            columns = columns.concat([
                netColumn,
                surchargeColumn,
                vatColumn,
                grossColumn
            ]);
        } else {
            columns = columns.concat([grossColumn.setIsSumColumn(true)]);
        }


        columns.push(linkColumn);

        return new UniTableConfig('reinvoicing.table', this.currentReInvoice && this.currentReInvoice.StatusCode !== StatusCodeReInvoice.ReInvoiced, false)
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
        if (this.reinvoiceType === 1 && !this.isSupplierInvoiceJournaled()) {
            this.toastr.addToast('', ToastType.bad, 10, 'Leverandørfakturaen må bokføres før du kan velge Viderefakturering, omsetning');
            this.reinvoiceType = 0;
            this.changeDetectorRef.markForCheck();
        }

        if (this.reinvoiceType === 0) {
            this.removeSurchargeAndVat();
            this.updateItemsData(this.companyAccountSettings && this.companyAccountSettings.ReInvoicingCostsharingProduct);
            this.reinvoicingCustomers = this.setInitialCustomerData(this.currentReInvoice, this.items[0].Product, this.supplierInvoice.TaxInclusiveAmount);
            this.onReinvoicingCustomerChange(null);
        } else {
            this.updateItemsData(this.companyAccountSettings && this.companyAccountSettings.ReInvoicingTurnoverProduct);
            this.reinvoicingCustomers = this.setInitialCustomerData(this.currentReInvoice, this.items[0].Product, this.supplierInvoice.TaxExclusiveAmount);
            this.onReinvoicingCustomerTurnOverChange(null);
        }
    }

    private isSupplierInvoiceJournaled(): boolean {
        if (!this.supplierInvoice.TaxExclusiveAmount || this.supplierInvoice.TaxExclusiveAmount === 0)
        { return false; } else { return true; }
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
        const total = this.currentReInvoice && this.currentReInvoice.TaxInclusiveAmount;
        const data = [].concat(this.reinvoicingCustomers);
        if (data.length === 0) {
            return;
        }
        let cumulativePercentage = 0;
        const vatPercent = (this.items[0] && this.items[0].VatType && this.items[0].VatType.VatPercent) || 0;
        let netAmount = 0;
        for (let i = 1; i < data.length; i++) {
            if (data[i].Customer && data[i].Customer.ID === 0) {
                data[i].Customer = null;
            }
            if (change) {
                switch (change.field) {
                    case 'GrossAmount':
                        netAmount = UniMath.round(data[i].GrossAmount / (1 + vatPercent / 100));
                        data[i].Vat = UniMath.round(netAmount * (vatPercent / 100));
                        data[i].Share = UniMath.round(((data[i].GrossAmount || 0) / total) * 100);
                        data[i].NetAmount = netAmount;
                        break;
                    case 'Share':
                        data[i].GrossAmount = UniMath.round(total * ((data[i].Share || 0) / 100));
                        netAmount = UniMath.round(data[i].GrossAmount / (1 + vatPercent / 100));
                        data[i].NetAmount = netAmount;
                        data[i].Vat = UniMath.round(netAmount * (vatPercent / 100));
                        break;
                }
            }
            cumulativePercentage += UniMath.round(data[i].Share || 0);
        }

        data[0].Share = 100 - cumulativePercentage;
        data[0].GrossAmount = UniMath.round(total * ((data[0].Share || 0) / 100));
        data[0].NetAmount = UniMath.round(data[0].GrossAmount / (1 + vatPercent));
        this.reinvoicingCustomers = data;
        this.items[0].NetAmount = this.calcItemNetAmount();
        this.items[0].GrossAmount = this.calcItemGrossAmount(this.items[0]);
        this.items = [].concat(this.items);
        this.isReinvoiceValid = true;
        const mainActionIndex = this.saveactions.findIndex(item => item === this.getMainAction());
        this.updateActions(mainActionIndex);
    }

    onReinvoicingCustomerTurnOverChange(change) {
        const total = this.currentReInvoice && this.currentReInvoice.TaxExclusiveAmount;
        const data = [].concat(this.reinvoicingCustomers);
        if (data.length === 0) {
            return;
        }
        let cumulativePercentage = 0;
        const vatPercent = (this.items[0] && this.items[0].VatType && this.items[0].VatType.VatPercent) || 0;
        let netAmountWithSurcharge = 0;
        for (let i = 1; i < data.length; i++) {
            if (data[i].Customer && data[i].Customer.ID === 0) {
                data[i].Customer = null;
            }
            if (change) {
                switch (change.field) {
                    case 'GrossAmount':
                        netAmountWithSurcharge = UniMath.round(data[i].GrossAmount / (1 + vatPercent / 100));
                        data[i].Vat = data[i].GrossAmount - netAmountWithSurcharge;
                        data[i].NetAmount = netAmountWithSurcharge / (1 + ((data[i].Surcharge / 100) || 0));
                        data[i].Share = UniMath.round(((data[i].NetAmount || 0) / total) * 100);
                        break;
                    case 'Share':
                        data[i].NetAmount = UniMath.round(total * ((data[i].Share || 0) / 100));
                        data[i].Vat = UniMath.round((data[i].NetAmount * (1 + ((data[i].Surcharge / 100) || 0))) * (vatPercent / 100));
                        data[i].GrossAmount = UniMath.round(data[i].NetAmount  * (1 + (data[i].Surcharge || 0)) + data[i].Vat);
                        break;
                    case 'Surcharge':
                        data[i].Vat = UniMath.round((data[i].NetAmount * (1 + ((data[i].Surcharge / 100) || 0))) * (vatPercent / 100));
                        data[i].GrossAmount = UniMath.round(data[i].NetAmount * (1 + ((data[i].Surcharge / 100) || 0)) + data[i].Vat);
                        break;
                    case 'NetAmount':
                        data[i].Share = UniMath.round(((data[i].NetAmount || 0) / total) * 100);
                        data[i].Vat = UniMath.round((data[i].NetAmount * (1 + ((data[i].Surcharge / 100) || 0))) * (vatPercent / 100));
                        data[i].GrossAmount = UniMath.round(data[i].NetAmount * (1 + ((data[i].Surcharge / 100) || 0)) + data[i].Vat);
                        break;
                }
            }
            cumulativePercentage += UniMath.round(data[i].Share || 0);
        }

        data[0].Share = 100 - cumulativePercentage;
        data[0].NetAmount = UniMath.round(total * ((data[0].Share || 0) / 100));
        data[0].GrossAmount = UniMath.round(data[0].NetAmount * (1 + (vatPercent || 0) / 100));
        data[0].Vat = UniMath.round(data[0].NetAmount * ((vatPercent || 0) / 100));

        this.reinvoicingCustomers = data;
        this.items[0].NetAmount = this.calcItemNetAmount();
        this.items[0].GrossAmount = this.calcItemGrossAmount(this.items[0]);
        this.items = [].concat(this.items);
        this.isReinvoiceValid = true;
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
