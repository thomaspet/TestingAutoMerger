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
import {
    CompanyAccountingSettings, Customer, Product, ReInvoice, ReInvoiceItem,
    SupplierInvoice, StatusCodeReInvoice, Tracelink
} from '@app/unientities';
import { CustomerService } from '@app/services/sales/customerService';
import { MatRadioChange } from '@angular/material';
import { ReInvoicingService } from '@app/services/accounting/ReInvoicingService';

import { CompanyAccountingSettingsService } from '@app/services/accounting/companyAccountingSettingsService';
import { ProductService } from '@app/services/common/productService';
import * as moment from 'moment';
import { UniMath } from '@uni-framework/core/uniMath';
import { RequestMethod } from '@uni-framework/core/http';
import { getNewGuid } from '@app/components/common/utils/utils';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { SupplierInvoiceService } from '@app/services/accounting/supplierInvoiceService';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import {ComboButtonAction} from '@uni-framework/ui/combo-button/combo-button';

@Component({
    selector: 'uni-reinvoice-modal',
    templateUrl: './reinvoiceModal.html'
})
export class UniReinvoiceModal implements OnInit, IUniModal {

    @Input() options: IModalOptions;
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    private hasChanges: boolean = false;

    isSaving = false;
    isReinvoiceValid = true;
    currentReInvoice: ReInvoice;
    supplierInvoice: SupplierInvoice;
    open = false;
    reinvoicingCustomers = [];
    items = [];
    customersTableConfig = null;
    customersTableConfigTurnOver = null;
    itemsTableConfig = null;
    invoiceSum: number = 4000;
    forReinvoice: boolean = false;
    reinvoiceType: number = 0;
    companyAccountSettings: CompanyAccountingSettings;

    actions: ComboButtonAction[] = [];
    mainAction: ComboButtonAction;

    constructor(
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
                this.getCompanyAccountSettings(reinvoiceRequest);
            });
        } else {
            reinvoiceRequest = this.reinvoiceService.GetAll(`filter=SupplierInvoice.ID eq ${this.supplierInvoice.ID}`, expand);
            this.getCompanyAccountSettings(reinvoiceRequest);
        }
    }

    public getCompanyAccountSettings(reinvoiceRequest) {
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
                this.runReinvoiceRequest(reinvoiceRequest);
            } else {
                this.modalService.open(UniCompanyAccountingSettingsModal, {
                    data: {
                        model: (data && data[0]) || null
                    }
                }).onClose.subscribe(settings => {
                    if (settings) {
                        this.companyAccountSettings = settings;
                        this.updateItemsData();
                        this.runReinvoiceRequest(reinvoiceRequest);
                    }
                });
            }
        });
    }

    public runReinvoiceRequest(reinvoiceRequest) {
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
            this.updateActions();
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

    public updateActions() {
        const createActionsDisabled = !this.isReinvoiceValid
            || this.currentReInvoice.StatusCode === StatusCodeReInvoice.ReInvoiced
            || (!this.isSupplierInvoiceJournaled() && this.reinvoiceType === 1)

        this.actions = [
            {
                label: 'Lag faktura (Kladd)',
                action: () => this.saveReinvoiceAs('create-invoices-draft'),
                disabled: createActionsDisabled
            },
            {
                label: 'Lag faktura (Fakturert)',
                action: () => this.saveReinvoiceAs('create-invoices'),
                disabled: createActionsDisabled
            },
            {
                label: 'Lag ordre (Registrert)',
                action: () => this.saveReinvoiceAs('create-orders'),
                disabled: createActionsDisabled
            },
            {
                label: 'Slett viderefakturering',
                action: () => this.deleteReinvoice(),
                disabled: (!this.currentReInvoice || this.currentReInvoice.ID === 0),
            }
        ];

        if (!this.isSupplierInvoiceJournaled() && this.reinvoiceType === 1) {
            this.mainAction = this.actions[3];
        } else {
            this.mainAction = this.actions[this.companyAccountSettings.ReInvoicingMethod] || this.actions[0];
        }
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
                this.reinvoiceService.Action(this.currentReInvoice.ID, 'delete').subscribe(
                    (res) => {
                        if (res) {
                            this.toastr.addToast(res, ToastType.warn);
                        }
                        this.currentReInvoice = null;
                        this.onClose.emit(false);
                    },
                    error => this.errorService.handle(error)
                );
            }
        });
    }

    public closeModal() {
        if (this.hasChanges) {
            this.modalService.confirm({
                header: 'Ulagrede endringer',
                message: 'Ønsker du å lagre endringer?',
                buttonLabels: {
                    accept: 'Lagre',
                    reject: 'Forkast',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                switch (response) {
                    case ConfirmActions.ACCEPT:
                        this.saveReinvoiceAs('');
                        this.onClose.emit(true);
                        break;
                    case ConfirmActions.CANCEL:
                        break;
                    case ConfirmActions.REJECT:
                    default:
                        this.onClose.emit(true);
                        break;
                }
            });
        } else {
            this.onClose.emit(true);
        }
    }

    public saveReinvoiceAs(type: string) {
        if (this.isSaving) {
            this.toastr.addToast('Opprettelse av viderefakturering pågår fremdeles, vennligst vent...', ToastType.bad, 5);
            return;
        }

        if (this.isSaving) {
            this.toastr.addToast('Opprettelse av viderefakturering pågår fremdeles, vennligst vent...', ToastType.bad, 5);
            return;
        }

        this.isSaving = true;
        this.hasChanges = false;
        if (!this.currentReInvoice) {
            this.currentReInvoice = new ReInvoice();
            this.currentReInvoice._createguid = getNewGuid();
        }
        this.currentReInvoice.Product = null;
        this.currentReInvoice.OwnCostShare = this.reinvoicingCustomers[0].Share;
        this.currentReInvoice.OwnCostAmount = this.reinvoiceType === 0
            ? this.reinvoicingCustomers[0].GrossAmount
            : this.reinvoicingCustomers[0].NetAmount
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
                this.toastr.addToast('', ToastType.warn, 10, 'Leverandørfakturaen må være bokført før du kan lage Viderefakturering, omsetning');
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
                    .subscribe(reinvoice => {
                        if (type !== '') {
                            this.reinvoiceService.Action(reinvoice.ID, type).subscribe(() => {
                                this.toastr.addToast('Faktura / ordre ble opprettet!', ToastType.good, 6);
                                this.isSaving = false;
                                this.currentReInvoice = reinvoice;
                                this.ngOnInit(true);

                            });
                        } else {
                            this.currentReInvoice = reinvoice;
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
        this.updateActions();
        let product = null;
        if (this.companyAccountSettings) {
            product = this.reinvoiceType === 0
                ? this.companyAccountSettings.ReInvoicingCostsharingProduct
                : this.companyAccountSettings.ReInvoicingTurnoverProduct;
        }
        if (lastReinvoicing && lastReinvoicing.Product) {
            product = lastReinvoicing.Product;
        }
        const amount = this.reinvoiceType === 0
            ? this.supplierInvoice.TaxInclusiveAmount
            : this.supplierInvoice.TaxExclusiveAmount;
        this.reinvoicingCustomers = this.setInitialCustomerData(lastReinvoicing, product, amount);

        if (lastReinvoicing && lastReinvoicing.Product) {
            this.items = this.setInitialItemsData(lastReinvoicing.Product);
        } else {
            product = this.reinvoiceType === 0 ?
                this.companyAccountSettings.ReInvoicingCostsharingProduct :
                this.companyAccountSettings.ReInvoicingTurnoverProduct;
            this.items = this.setInitialItemsData(product);
        }
    }

    public setInitialCustomerData(reinvoice: ReInvoice | null, product: Product, totalAmount: number) {
        if (!reinvoice) {
            const initialItem = new ReInvoiceItem();
            initialItem.ID = 0;
            initialItem.Customer = new Customer();
            initialItem.Customer.ID = 0;
            if (this.reinvoiceType === 0) {
                initialItem.GrossAmount = UniMath.round(totalAmount);
            } else {
                initialItem.NetAmount = UniMath.round(totalAmount);
            }
            initialItem.Share = 100;
            return [initialItem];
        }

        const vatType = product && product.VatType;
        const today = moment(new Date());
        let currentPercentage;
        if (vatType && vatType.VatTypePercentages) {
            currentPercentage =
                vatType.VatTypePercentages.find(y =>
                (moment(y.ValidFrom) <= today && y.ValidTo && moment(y.ValidTo) >= today)
                || (moment(y.ValidFrom) <= today && !y.ValidTo));

            if (currentPercentage) {
                product.VatType.VatPercent = currentPercentage.VatPercent;
            }
        }
        const vatPercent = (product && product.VatType && product.VatType.VatPercent) || 0;

        let copyOfItems = [new ReInvoiceItem()].concat(reinvoice.Items || []);
        copyOfItems[0].ID = 0;
        copyOfItems[0].Customer = new Customer();
        copyOfItems[0].Customer.ID = 0;
        if (this.reinvoiceType === 0) {
            copyOfItems[0].GrossAmount = UniMath.round((1 + ((reinvoice.OwnCostShare || 0) / 100)) * totalAmount);
        } else {
            copyOfItems[0].NetAmount = UniMath.round((1 + ((reinvoice.OwnCostShare || 0) / 100)) * totalAmount);
        }
        copyOfItems[0].NetAmount = UniMath.round((1 + ((reinvoice.OwnCostShare || 0) / 100)) * totalAmount);
        copyOfItems[0].Share = 100 - copyOfItems.reduce((previous, current) => previous + (current && current.Share || 0), 0);
        copyOfItems = copyOfItems.map(item => {
            if (!item) {
                item = new ReInvoiceItem();
            }
            if (this.reinvoiceType === 1) {
                item.NetAmount = UniMath.round(totalAmount * ((item && item.Share || 0) / 100));
                const priceWithoutTaxes = (item && item.NetAmount || 0) * (1 + ((item && item.Surcharge || 0) / 100));
                item.Vat = UniMath.round(item.NetAmount * ((vatPercent || 0) / 100));
                item.GrossAmount = UniMath.round(priceWithoutTaxes * (1 + (vatPercent / 100)));
            } else {
                item.GrossAmount = UniMath.round(totalAmount * ((item && item.Share || 0) / 100));
                item.NetAmount = UniMath.round(item.GrossAmount / (1 + (vatPercent || 0) / 100));
                item.Vat = UniMath.round(item.NetAmount * ((vatPercent || 0) / 100));
            }
            return item;
        });
        return copyOfItems;
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
                NetAmount: this.calcItemNetAmount(),
                VatType: product.VatType,
                GrossAmount: this.calcItemGrossAmount({
                    NetAmount: this.calcItemNetAmount(),
                    VatType: product.VatType
                })
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
            return previous + (current.GrossAmount || 0);
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
                    return this.customerService.GetAll(`filter=contains(Info.Name,'${query}')&top=50`, ['Info']);
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
            .setIsSumColumn(true)
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
            columns = columns.concat([grossColumn]);
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
        this.hasChanges = true;
        let product;
        if (this.reinvoiceType === 0) {
            this.removeSurchargeAndVat();
            product = this.companyAccountSettings && this.companyAccountSettings.ReInvoicingCostsharingProduct;
            this.reinvoicingCustomers = this.setInitialCustomerData(this.currentReInvoice, product, this.supplierInvoice.TaxInclusiveAmount);
            this.updateItemsData(this.companyAccountSettings && this.companyAccountSettings.ReInvoicingCostsharingProduct);
            this.onReinvoicingCustomerChange(null);
        } else {
            product = this.companyAccountSettings && this.companyAccountSettings.ReInvoicingTurnoverProduct;
            this.reinvoicingCustomers = this.setInitialCustomerData(this.currentReInvoice, product, this.getNetAmountOnTurnOverReInvoice());
            this.updateItemsData(this.companyAccountSettings && this.companyAccountSettings.ReInvoicingTurnoverProduct);
            this.onReinvoicingCustomerTurnOverChange(null);
        }
        this.updateActions();
    }

    public isSupplierInvoiceJournaled(): boolean {
        if (!this.supplierInvoice.TaxExclusiveAmount || this.supplierInvoice.TaxExclusiveAmount === 0) {
            return false;
        } else {
            return true;
        }
    }

    onItemChange(change) {
        this.hasChanges = true;
        this.updateItemsData(change.newValue);
        if (this.reinvoiceType === 0) {
            this.onReinvoicingCustomerChange(null);
        } else {
            this.onReinvoicingCustomerTurnOverChange(null);
        }
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
        this.hasChanges = true;

        const total = this.supplierInvoice && this.supplierInvoice.TaxInclusiveAmount;
        const data = [].concat(this.reinvoicingCustomers);
        if (data.length === 0) {
            return;
        }
        let cumulativePercentage = 0;
        const item = this.reinvoiceType === 0
            ? this.companyAccountSettings.ReInvoicingCostsharingProduct
            : this.companyAccountSettings.ReInvoicingTurnoverProduct;
        const vatPercent = (item && item.VatType && item.VatType.VatPercent) || 0;
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
                        data[i].Share = UniMath.round(data[i].Share);
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

        if (change && change.field === 'Share' && cumulativePercentage > 100) {
            this.toastr.addToast('Du har fordelt mer enn 100%', ToastType.warn, 5);
        }

        const customerGrossAmount = data.slice(1).reduce((prev: number, current) => {
            return prev + (current.GrossAmount || 0);
        }, 0);
        data[0].GrossAmount = UniMath.round(total - customerGrossAmount);
        data[0].NetAmount = UniMath.round(data[0].GrossAmount / (1 + vatPercent));
        this.reinvoicingCustomers = data;
        this.items[0].NetAmount = this.calcItemNetAmount();
        this.items[0].GrossAmount = this.calcItemGrossAmount(this.items[0]);
        this.items = [].concat(this.items);
        this.isReinvoiceValid = true;
        this.updateActions();
    }

    getNetAmountOnTurnOverReInvoice() {
        if (this.supplierInvoice && this.supplierInvoice.TaxExclusiveAmount) {
            return this.supplierInvoice.TaxExclusiveAmount;
        }
        const defaultProduct = this.reinvoiceType === 0
            ? this.companyAccountSettings && this.companyAccountSettings.ReInvoicingCostsharingProduct
            : this.companyAccountSettings && this.companyAccountSettings.ReInvoicingTurnoverProduct;
        const product = this.items[0].Product || defaultProduct;
        const vatType = product && product.VatType;
        const today = moment(new Date());
        let currentPercentage;
        if (vatType && vatType.VatTypePercentages) {
            currentPercentage =
                vatType.VatTypePercentages.find(y =>
                (moment(y.ValidFrom) <= today && y.ValidTo && moment(y.ValidTo) >= today)
                || (moment(y.ValidFrom) <= today && !y.ValidTo));

            if (currentPercentage) {
                product.VatType.VatPercent = currentPercentage.VatPercent;
            }
        }
        const vatPercent = (product && product.VatType && product.VatType.VatPercent) || 0;
        return this.supplierInvoice.TaxInclusiveAmount / (1 + vatPercent / 100);
    }

    onReinvoicingCustomerTurnOverChange(change) {
        this.hasChanges = true;
        const total = this.getNetAmountOnTurnOverReInvoice();
        const data = [].concat(this.reinvoicingCustomers);
        if (data.length === 0) {
            return;
        }
        let cumulativePercentage = 0;
        const item = this.reinvoiceType === 0
            ? this.companyAccountSettings.ReInvoicingCostsharingProduct
            : this.companyAccountSettings.ReInvoicingTurnoverProduct;

        const vatPercent = (item && item.VatType && item.VatType.VatPercent) || 0;
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
                        data[i].Share = UniMath.round(data[i].Share);
                        data[i].NetAmount = UniMath.round(total * ((data[i].Share || 0) / 100));
                        data[i].Vat = UniMath.round((data[i].NetAmount * (1 + ((data[i].Surcharge / 100) || 0))) * (vatPercent / 100));
                        data[i].GrossAmount = UniMath.round(data[i].NetAmount  * (1 + ((data[i].Surcharge || 0) / 100)) + data[i].Vat);
                        break;
                    case 'Surcharge':
                        data[i].Surcharge = UniMath.round(data[i].Surcharge);
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

        data[0].Share = UniMath.round(100 - cumulativePercentage);
        const customerNetAmount = data.slice(1).reduce((prev: number, current) => {
            return prev + (current.NetAmount || 0);
        }, 0);
        data[0].NetAmount = UniMath.round(total - customerNetAmount);
        data[0].GrossAmount = UniMath.round(data[0].NetAmount * (1 + (vatPercent || 0) / 100));
        data[0].Vat = UniMath.round(data[0].NetAmount * ((vatPercent || 0) / 100));

        this.reinvoicingCustomers = data;
        this.items[0].NetAmount = this.calcItemNetAmount();
        this.items[0].GrossAmount = this.calcItemGrossAmount(this.items[0]);
        this.items = [].concat(this.items);
        this.isReinvoiceValid = true;
        this.updateActions();
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
                this.updateActions();
                this.updateItemsData();
            }
        });
    }
}
