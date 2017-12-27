import {Component, OnInit, Input, ViewChild} from '@angular/core';
import { ErrorService } from '@app/services/common/errorService';
import { IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType, UniTable } from '@uni-framework/ui/unitable';
import { Observable } from 'rxjs/Observable';
import {URLSearchParams} from '@angular/http';
import {IWizardOptions, WizardSource, MergeByEnum} from './wizardoptions';
import {WorkOrder, WorkOrderItem, WorkItemSource, WorkItemSourceDetail} from './workorder';
import {roundTo} from '@app/components/common/utils/utils';
import {InvoiceHourService} from './invoice-hours.service';

@Component({
    selector: 'workitem-transfer-wizard-preview',
    templateUrl: './transfer-wizard-preview.html'
})
export class WorkitemTransferWizardPreview implements OnInit {
    @ViewChild(UniTable) private uniTable: UniTable;
    @Input() public options: IWizardOptions;
    public selectedItems: Array<{CustomerID: number}>;
    public tableConfig: IUniTableConfig;
    public busy = true;
    public computing = true;
    public initialized = false;
    public orderList: Array<WorkOrder> = [];
    public mergeOption: string;
    private baseList: Array<IWorkHours>;

    constructor(
        private invoiceHourService: InvoiceHourService,
        private errorService: ErrorService
    ) {

    }

    public ngOnInit() {
    }

    public onRowSelected(event) {

    }

    public onRowSelectionChanged() {
        this.selectedItems = this.uniTable.getSelectedRows();
    }

    public onMergeOptionChanged(event) {
        if (this.baseList) {
            this.options.mergeBy = parseInt(this.mergeOption, 10);
            this.orderList.length = 0;
            setTimeout( () => {
                this.processList(this.baseList);
            }, 20);
            return;
        }
        this.refresh();
    }

    public refresh() {
        this.initialized = true;
        this.busy = true;
        this.orderList.length = 0;
        this.mergeOption = '' + this.options.mergeBy;
        this.fetchData().subscribe( list => {
            this.baseList = list;
            this.processList(list);
            this.busy = false;
        });
    }

    private processList(list: Array<IWorkHours>) {
        this.computing = true;
        this.orderList.length = 0;
        switch (this.options.source) {
            case WizardSource.ProjectHours:
            case WizardSource.CustomerHours:
                this.createOrders(list, this.options).then( orders => {
                    this.orderList = orders;
                    this.orderList[0]._expand = true;
                    this.computing = false;
                });
                break;

            case WizardSource.OrderHours:
                this.updateOrders(list, this.options).then( orders => {
                    this.orderList = orders;
                    this.orderList[0]._expand = true;
                    this.computing = false;
                });
                break;
        }

    }

    public fetchData() {
        const query: URLSearchParams = new URLSearchParams();
        this.busy = true;
        return this.invoiceHourService.getOrderLineBaseData(this.options)
        .finally( () => this.busy = false)
        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private updateOrders(list: Array<IWorkHours>, options: IWizardOptions, appendTo = [], startIndex = 0
        , order?: WorkOrder): Promise<Array<WorkOrder>> {
        const orders: Array<WorkOrder> = appendTo;

        return new Promise( (resolve, reject) => {

        for (let i = startIndex; i < list.length; i++) {
            const row = list[i];
            const filterDto = options.selectedCustomers.find( x => x.OrderID === row.GroupValue );
            const n = list.length;
            if ((!order) || order.CustomerID !== row.CustomerID) {
                order = new WorkOrder();
                order.ID = row.GroupValue;
                order.CustomerID = filterDto.CustomerID;
                order.CustomerName = filterDto.CustomerName;
                orders.push(order);
            }
            const workType = options.selectedProducts.find( x => x.WorktypeID === row.WorktypeID );
            const item = new WorkOrderItem();
            if (workType) {
                item.ItemText = this.buildItemText(row, workType, options);
                item.ProductID = workType.ProductID;
                item.PriceExVat = workType.PriceExVat;
            } else {
                item.ItemText = row.Description;
            }
            item.NumberOfItems = roundTo(row.SumMinutes / 60, 2);
            item.ItemSource = new WorkItemSource();
            item.ItemSource.Details.push(new WorkItemSourceDetail(row.ID, row.SumMinutes));
            item.VatTypeID = workType.VatTypeID;

            order.addItem(item);

            if (i - startIndex > 100) {
                setTimeout(() => {
                    this.updateOrders(list, options, orders, i + 1, order)
                    .then( () => {
                        resolve(orders);
                    });
                }, 20);
                return;
            }
        }

        resolve(orders);

        });
    }

    private createOrders(list: Array<IWorkHours>, options: IWizardOptions, appendTo = [], startIndex = 0
        , order?: WorkOrder): Promise<Array<WorkOrder>> {
        const orders: Array<WorkOrder> = appendTo;

        return new Promise( (resolve, reject) => {

        for (let i = startIndex; i < list.length; i++) {
            const row = list[i];
            const customer = options.selectedCustomers.find( x => x.CustomerID === row.CustomerID );
            const n = list.length;
            if ((!order) || order.CustomerID !== row.CustomerID) {
                order = new WorkOrder();
                order.CustomerID = row.CustomerID;
                order.CustomerName = customer.CustomerName;
                order.OurReference = options.currentUser.DisplayName;
                if (options.source === WizardSource.ProjectHours) {
                    order.setProject(row.GroupValue);
                }
                orders.push(order);
            }
            const workType = options.selectedProducts.find( x => x.WorktypeID === row.WorktypeID );
            const item = new WorkOrderItem();
            if (workType) {
                item.ItemText = `${row.WorktypeName}${row.Description ? ' : ' + row.Description : ''}`;
                item.ItemText = this.buildItemText(row, workType, options);
                item.ProductID = workType.ProductID;
                item.PriceExVat = workType.PriceExVat;
            } else {
                item.ItemText = row.Description;
            }
            item.NumberOfItems = roundTo(row.SumMinutes / 60, 2);
            item.ItemSource = new WorkItemSource();
            item.ItemSource.Details.push(new WorkItemSourceDetail(row.ID, row.SumMinutes));
            item.VatTypeID = workType.VatTypeID;
            if (options.source === WizardSource.ProjectHours) {
                item.setProject(row.GroupValue);
            }

            order.addItem(item);

            if (i - startIndex > 100) {
                setTimeout(() => {
                    this.createOrders(list, options, orders, i + 1, order)
                    .then( () => {
                        resolve(orders);
                    });
                }, 20);
                return;
            }
        }

        resolve(orders);

        });
    }

    private buildItemText(row: IWorkHours, workType: IWorktypeInfo, options: IWizardOptions): any {

        switch (options.mergeBy) {
            case MergeByEnum.mergeByProduct:
                return workType.ProductName;

            case MergeByEnum.mergeByWorktype:
                return workType.WorktypeName;

            case MergeByEnum.mergeByText:
                return row.Description ? row.Description : row.WorktypeName;

            default:
            case MergeByEnum.mergeByWorktypeAndText:
                return `${row.WorktypeName}${row.Description ? ' : ' + row.Description : ''}`;
        }
    }

}

interface IWorktypeInfo {
    ProductName: string;
    PartName: string;
    WorktypeName: string;
}

interface IWorkHours {
    ID: number;
    Date: Date;
    GroupValue: number;
    CustomerID: number;
    Description: string;
    WorktypeID: number;
    WorktypeName: string;
    SumMinutes: number;
}
