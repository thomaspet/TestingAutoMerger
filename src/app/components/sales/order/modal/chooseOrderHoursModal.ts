import {Component, Input, Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {UniModalService} from '../../../../../framework/uni-modal';
import {
    CompanySettings,
    LocalDate,
    WorkRelation,
    CustomerOrderItem,
    Product,
    VatType,
    CustomerOrder,
    StatusCodeCustomerOrder
} from '@uni-entities';
import {
    ErrorService,
    TimesheetService,
    ProductService,
    InvoiceHourService,
    IWorkHours,
    CustomWorkItem,
} from '@app/services/services';
import { UniTableColumn, UniTableColumnType, UniTableConfig, IRowChangeEvent } from '@uni-framework/ui/unitable';
import {IUniTab} from '@app/components/layout/uni-tabs';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {
    UniTimeModal,
    WizardSource,
    MergeByEnum,
    WorkOrderItem,
    WorkOrder,
} from '@app/components/common/timetrackingCommon';
import { roundTo } from '../../../common/utils/utils';

import * as moment from 'moment';

declare var _;

export interface ProductWorkItem {
    ID: number;
    Date: Date;
    WorkTypeID: number;
    WorktypeName: string;
    PriceExVat: number;
    PriceExVatCurrency: number;
    ProductID: number;
    PartName: string;
    ProductName: string;
    VatTypeID: number;
    Description: string;
    SumMinutes: number;
    _sumTotal: number;
    _discountPercent: number;
    _mergedIDs: number[];
}

@Component({
    selector: 'choose-order-hours-modal',
    templateUrl: './chooseOrderHoursModal.html',
    styleUrls: ['./chooseOrderHoursModal.sass']
})

export class UniChooseOrderHoursModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    workItemTableConfig: UniTableConfig;
    productWorkItemTableConfig: UniTableConfig;
    settings: CompanySettings;
    workItems: CustomWorkItem[] = [];
    selectedWorkItems: CustomWorkItem[] = [];
    productWorkItems: ProductWorkItem[] = [];
    selectedHoursCount: number = 0;
    totalPrice: number = 0;
    relation: WorkRelation;
    products: Product[] = [];
    continueButtonDisabled: boolean = true;
    transferButtonDisabled: boolean = true;

    filterOptions: {orderID: number, customerID: number};
    hasContinued: boolean = false;
    tabs: IUniTab[] = [
        { name: 'Timer knyttet til ordre', value: 0 },
        { name: 'Timer knyttet til kunde', value: 1 },
    ];

    private order: WorkOrder;
    private vatTypes: VatType[];
    private transferredWorkItemIDs: number[] = [];

    constructor(
        private invoiceHoursService: InvoiceHourService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private timeSheetService: TimesheetService,
        private tradeItemHelper: TradeItemHelper,
        private productService: ProductService,
    ) { }

    ngOnInit() {
        this.order = new WorkOrder();
        const order: CustomerOrder = this.options.data.order;
        for (const prop in order) {
            if (order.hasOwnProperty(prop)) {
                this.order[prop] = order[prop];
            }
        }
        this.settings = this.options.data.settings;
        this.vatTypes = this.options.data.vatTypes;
        this.transferredWorkItemIDs = this.options.data.transferredHoursIDs;
        this.filterOptions = {
            orderID: this.order.ID,
            customerID: this.order.CustomerID
        };
        Observable.forkJoin(
            this.timeSheetService.initUser(undefined, false),
            this.invoiceHoursService.getWorkHours(this.filterOptions),
            this.productService.GetAll(null),
        ).subscribe(res => {
            this.relation = res[0].currentRelation;
            res[1].forEach((x: CustomWorkItem) => {
                x._discountPercent = 0;
                x._transferredToOrder = x.TransferedToOrder || !!this.transferredWorkItemIDs.find(id => id === x.ID);
            });
            this.workItems = res[1];
            this.products = res[2];
            this.initHourTableConfig();
        }, err => this.errorService.handle(err));
    }

    onFilterClick(filter: IUniTab) {
        const filterObject = Object.assign(this.filterOptions, {tabValue: filter.value});
        this.invoiceHoursService.getWorkHours(filterObject).subscribe(res => {
            res.forEach((x: CustomWorkItem) => {
                x._discountPercent = 0;
                x._transferredToOrder = x.TransferedToOrder || !!this.transferredWorkItemIDs.find(id => id === x.ID);
            });
            this.workItems = res;
        });
    }

    private initHourTableConfig() {
        const dateCol = new UniTableColumn('Date', 'Dato', UniTableColumnType.LocalDate, false)
            .setWidth('20%');

        const hourTypeCol = new UniTableColumn('WorktypeName', 'Timeart', undefined, false)
            .setWidth('20%');

        const fromCol = new UniTableColumn('StartTime', 'Start', undefined, false)
            .setTemplate(line => line.StartTime ? moment(line.StartTime).format('HH:mm') : '')
            .setWidth('10%');

        const toCol = new UniTableColumn('EndTime', 'Slutt', undefined, false)
            .setTemplate(line => line.EndTime ? moment(line.EndTime).format('HH:mm') : '')
            .setWidth('10%');

        const hourAmountCol = new UniTableColumn('SumMinutes', 'Timer', UniTableColumnType.Number, false)
            .setTemplate(line => {
                return (line.SumMinutes / 60).toFixed(1).toString();
            })
            .setWidth('20%');

        const descriptionCol = new UniTableColumn('Description', 'Beskrivelse', undefined, false)
            .setVisible(false)
            .setMaxLength(500)
            .setWidth('20%');

        const employeeCol = new UniTableColumn('WorkerName', 'Medarbeider', undefined, false)
            .setWidth('20%');

        const priceCol = new UniTableColumn('PriceExVat', 'Pris eks. mva', UniTableColumnType.Money, false)
            .setTemplate(line => {
                const number = line.PriceExVat ? JSON.parse(line.PriceExVat) : 0;
                const onlyTwoDecimals = number.toFixed(2);
                return onlyTwoDecimals.toString();
            })
            .setWidth('20%');

        const sumPriceCol = new UniTableColumn('_sumTotal', 'Sum eks. mva', UniTableColumnType.Money, false)
            .setTemplate(line => {
                const priceHours = (line.SumMinutes / 60) * line.PriceExVat;
                line._sumTotal = priceHours;
                return priceHours.toFixed(2);
            })
            .setWidth('20%');

        this.workItemTableConfig = new UniTableConfig('WorkItemHourTable')
            .setColumns([
                dateCol, hourTypeCol, fromCol, toCol, hourAmountCol,
                descriptionCol, employeeCol, priceCol, sumPriceCol,
            ])
            .setColumnMenuVisible(true)
            .setMultiRowSelect(true)
            .setCopyFromCellAbove(false)
            .setAutoAddNewRow(false)
            .setIsRowReadOnly((row: CustomWorkItem) => row._transferredToOrder)
            .setIsRowSelectable((row: CustomWorkItem) => !row._transferredToOrder)
            .setSearchable(true);
    }

    private initProductHourTableConfig() {
        const sortIndexCol = new UniTableColumn('SortIndex', 'Nr.', UniTableColumnType.Number, false)
            .setWidth('10%')
            .setVisible(false);

        const hourTypeCol = new UniTableColumn('WorktypeName', 'Timeart', undefined, false)
            .setWidth('20%');

        const hourAmountCol = new UniTableColumn('SumMinutes', 'Timer', UniTableColumnType.Number, false)
            .setTemplate(line => {
                const number = line.SumMinutes / 60;
                const onlyOneDecimal = number.toFixed(1);
                return onlyOneDecimal.toString();
            })
            .setWidth('10%');

        const partNameCol = new UniTableColumn('PartName', 'Produktnr.', UniTableColumnType.Lookup)
            .setWidth('10%')
            .setDisplayField('PartName')
            .setOptions({
                itemTemplate: item => `${item['PartName']} - ${item['Name']}`,
                lookupFunction: txt => this.invoiceHoursService.lookupProduct(txt)
            });

        const productNameCol = new UniTableColumn('ProductName', 'Produktnavn', undefined, false)
            .setWidth('20%');

        const descriptionCol = new UniTableColumn('ProductDescription', 'Beskrivelse', undefined, false)
            .setVisible(false)
            .setMaxLength(500)
            .setWidth('20%');

        const discountCol = new UniTableColumn('_discountPercent', 'Rabatt %', UniTableColumnType.Percent)
            .setTemplate(line => this.tradeItemHelper.round(line._discountPercent, 2).toString())
            .setWidth('20%');

        const priceCol = new UniTableColumn('PriceExVat', 'Pris eks. mva', UniTableColumnType.Money, false)
            .setTemplate(line => {
                const number = line.PriceExVat ? JSON.parse(line.PriceExVat) : 0;
                const onlyTwoDecimals = number.toFixed(2);
                return onlyTwoDecimals.toString();
            })
            .setWidth('20%');

        const sumPriceCol = new UniTableColumn('_sumTotal', 'Sum eks. mva', UniTableColumnType.Money, false)
            .setTemplate(line => {
                const priceHours = (line.SumMinutes / 60) * line.PriceExVat;
                const discountExVat = this.tradeItemHelper.round(
                    (priceHours * line['_discountPercent']) / 100, 4
                );
                line._sumTotal = priceHours - discountExVat;
                return (priceHours - discountExVat).toFixed(2);
            })
            .setWidth('20%');

        this.productWorkItemTableConfig = new UniTableConfig('ProductWorkItemHourTable')
            .setColumns([
                sortIndexCol, hourTypeCol, partNameCol, productNameCol, hourAmountCol,
                descriptionCol, discountCol, priceCol, sumPriceCol,
            ])
            .setColumnMenuVisible(true)
            .setAutoAddNewRow(false)
            .setChangeCallback(changeEvent => this.invoiceHoursService.onEditChange(changeEvent))
            .setSearchable(true);
    }

    onRowChange(event: IRowChangeEvent) {
        this.transferButtonDisabled = !this.productWorkItems.length || this.productWorkItems.some(productHour => !productHour.ProductID);

        const row = event.rowModel;
        const index = row._originalIndex;

        this.workItems[index] = row;
        this.workItems = _.cloneDeep(this.workItems);
    }

    onHourSelectionChange(workItems: CustomWorkItem[]) {
        this.continueButtonDisabled = !workItems[0];
        this.selectedHoursCount = 0;
        workItems.forEach(workItem => {
            this.selectedHoursCount += workItem.SumMinutes / 60;
            this.selectedHoursCount = roundTo(this.selectedHoursCount, 1);
        });
        this.selectedWorkItems = workItems;
        this.workItems.forEach(workItem => workItem._rowSelected = !!workItems.find(item => item.ID === workItem.ID));
    }

    cancel() {
        this.onClose.emit();
    }

    continue() {
        this.totalPrice = 0;
        this.hasContinued = true;
        this.options.header = 'Overføring av timer 2/2';

        // group hours based on WorktypeName and PriceExVat
        const groupedWorkItems = this.selectedWorkItems.reduce((dictionary, selectedHour) => {
            this.totalPrice += selectedHour._sumTotal;

            const key = selectedHour.WorktypeName + selectedHour.PriceExVat;
            const value = dictionary.get(key) || [];
            value.push(selectedHour);
            dictionary.set(key, value);
            return dictionary;
        }, new Map<string, CustomWorkItem[]>());

        const productWorkItems = <ProductWorkItem[]>[];
        groupedWorkItems.forEach(workItem => {
            productWorkItems.push(this.mapCustomWorkItemToProductWorkItem(workItem));
        });
        this.productWorkItems = productWorkItems;

        this.transferButtonDisabled = !this.selectedWorkItems.length || this.selectedWorkItems.some(productHour => !productHour.ProductID);
        this.initProductHourTableConfig();
    }

    private mapCustomWorkItemToProductWorkItem(selectedHour: CustomWorkItem[]): ProductWorkItem {
        const sumMinutes = (a, b) => a + b.SumMinutes;
        return <ProductWorkItem>{
            ID: selectedHour[0].ID,
            WorkTypeID: selectedHour[0].WorkTypeID,
            WorktypeName: selectedHour[0].WorktypeName,
            PriceExVat: selectedHour[0].PriceExVat,
            PriceExVatCurrency: selectedHour[0].PriceExVatCurrency,
            ProductID: selectedHour[0].ProductID,
            PartName: selectedHour[0].ProductPartName,
            VatTypeID: selectedHour[0].VatTypeID,
            ProductName: selectedHour[0].ProductName,
            Description: selectedHour[0].Description,
            SumMinutes: selectedHour.reduce(sumMinutes, 0),
            _sumTotal: selectedHour[0]._sumTotal,
            _discountPercent: selectedHour[0]._discountPercent,
        };
    }

    backToEdit() {
        this.selectedWorkItems = [];
        this.options.header = 'Overføring av timer 1/2';
        this.hasContinued = false;
        this.continueButtonDisabled = true;
    }

    transferHours() {
        this.productWorkItems.forEach(hour => {
            hour['_rowSelected'] = true;
        });

        const array = this.selectedWorkItems.map(line => {
            const workHours: IWorkHours = {
                ID: line.ID,
                Date: line.Date ? line.Date.toString() : '',
                GroupValue: null,
                CustomerID: this.order.CustomerID,
                Description: line.Description,
                WorkTypeID: line.WorkTypeID,
                WorktypeName: line.WorktypeName,
                SumMinutes: line.SumMinutes
            };
            return workHours;
        });

        const options = {
            currentUser: null,
            filterByUserID: null,
            source: WizardSource.OrderHours,
            periodFrom: null,
            periodTo: null,
            selectedCustomers: [{
                customerID: this.order.CustomerID,
                OrderID: this.order.ID,
                CustomerName: this.order.CustomerName
            }],
            selectedProducts: this.productWorkItems,
            orders: null,
            mergeBy: MergeByEnum.mergeByWorktype,
            addItemsDirectly: true
        };

        this.invoiceHoursService.processList(array, options, this.order).then(workOrders => {
            const customerOrderItems: CustomerOrderItem[] = workOrders[0].Items.map((item: WorkOrderItem) => {
                const vatType: VatType = this.vatTypes ? this.vatTypes.find(type => type.ID === item.VatTypeID) : undefined;
                const customerOrderItem = <CustomerOrderItem> {
                    ID: !item._createguid ? item.ID : undefined,
                    ProductID: item.ProductID,
                    Product: item['Product'] || this.products.find(product => product.ID === item.ProductID),
                    ItemText: item.ItemText,
                    Unit: item.Unit,
                    ItemSource: item.ItemSource,
                    NumberOfItems: item.NumberOfItems,
                    PriceExVat: item.PriceExVat,
                    PriceExVatCurrency: item.PriceExVatCurrency,
                    VatTypeID: item.VatTypeID,
                    VatType: item['VatType'] || vatType,
                    VatPercent: item['VatPercent'] || (vatType ? vatType.VatPercent : undefined),
                    Dimensions: item.Dimensions,
                    DiscountPercent: item.DiscountPercent,
                    StatusCode: item['StatusCode'],
                    _createguid: item._createguid
                };
                this.tradeItemHelper.calculatePriceIncVat(customerOrderItem, this.order['CurrencyExchangeRate']);
                this.tradeItemHelper.calculateBaseCurrencyAmounts(customerOrderItem, this.order['CurrencyExchangeRate']);
                this.tradeItemHelper.calculateDiscount(customerOrderItem, this.order['CurrencyExchangeRate']);
                return customerOrderItem;
            });
            this.workItems.filter(hour => hour._rowSelected).forEach(hour => this.transferredWorkItemIDs.push(hour.ID));
            this.onClose.emit({
                items: customerOrderItems,
                transferredHoursIDs: this.transferredWorkItemIDs
            });
        });
    }

    registerNewWorkItem() {
        const element = document.getElementById('article');
        const computedStyle = window.getComputedStyle(element, null);

        this.modalService.open(UniTimeModal, {
            data: {
                ToDate: moment(new LocalDate()).format('DD.MM.YYYY'),
                relation: this.relation,
                order: this.order,
                linkToCancel: true,
                height: computedStyle.height
            }
        }).onClose.subscribe((res: any) => {
            if (res) {
                this.invoiceHoursService.getWorkHours(this.filterOptions).subscribe(result => {
                    result.forEach(x => x._discountPercent = 0);
                    this.workItems = result;
                });
            }
        });
    }
}
