import {Component, OnInit, Input, ViewChild} from '@angular/core';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ErrorService } from '@app/services/common/errorService';
import { IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType, UniTable } from '@uni-framework/ui/unitable';
import { Observable } from 'rxjs/Observable';
import {URLSearchParams} from '@angular/http';
import {IWizardOptions, WizardSource} from './wizardoptions';
import {WorkOrder, WorkOrderItem, WorkItemSource, WorkItemSourceDetail} from './workorder';
import { roundTo } from '@app/components/common/utils/utils';

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
    public initialized = false;
    public orderList: Array<WorkOrder> = [];

    constructor(
        private statisticsService: StatisticsService,
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

    public refresh() {
        this.initialized = true;
        this.busy = true;
        this.orderList.length = 0;
        this.fetchData().subscribe( list => {

            switch (this.options.source) {
                case WizardSource.CustomerHours:
                    this.orderList = this.createOrders(list, this.options);
                    break;
                case WizardSource.OrderHours:
                    this.orderList = this.updateOrders(list, this.options);
                    break;
                case WizardSource.ProjectHours:
                    this.orderList = this.createOrders(list, this.options);
                    break;
            }

            if (this.orderList.length === 1) {
                this.orderList[0]._expand = true;
            }
        });
    }

    public fetchData() {

        const query: URLSearchParams = new URLSearchParams();
        this.busy = true;

        let groupField = 'CustomerID';
        let customerField = 'CustomerID';
        query.delete('join');

        switch (this.options.source) {
            case WizardSource.CustomerHours:
                query.set('expand', 'workrelation.worker,worktype.product');
                break;
            case WizardSource.OrderHours:
                groupField = 'CustomerOrderID';
                customerField = 'CustomerOrder.CustomerID';
                query.set('expand', 'workrelation.worker,worktype.product,customerorder');
                break;
            case WizardSource.ProjectHours:
                groupField = 'Dimensions.ProjectID';
                customerField = 'Project.ProjectCustomerID';
                query.set('expand', 'workrelation.worker,worktype.product,dimensions');
                query.set('join', 'dimensions.projectid eq project.id');
                break;
        }

        query.set('model', 'workitem');
        query.set('select', 'ID as ID'
        + ',Date as Date'
        + `,${groupField} as GroupValue`
        + `,${customerField} as CustomerID`
        + ',Description as Description'
        + ',Worktype.ID as WorktypeID'
        + ',WorkType.Name as WorktypeName'
        + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes');

        query.set('orderby', `${groupField},worktype.name`);
        query.set('filter', 'transferedtoorder eq 0');

        if (this.options) {
            if (this.options.selectedCustomers && this.options.selectedCustomers.length > 0) {
                const list = [];
                for (let i = 0; i < this.options.selectedCustomers.length; i++) {
                    switch (this.options.source) {
                        case WizardSource.CustomerHours:
                            list.push(`customerid eq ${this.options.selectedCustomers[i].CustomerID}`);
                            break;
                        case WizardSource.OrderHours:
                            list.push(`customerorderid eq ${this.options.selectedCustomers[i].OrderID}`);
                            break;
                        case WizardSource.ProjectHours:
                            list.push(`dimensions.projectid eq ${this.options.selectedCustomers[i].ProjectID}`);
                            break;
                        }
                }
                query.set('filter', `${query.get('filter')} and (${list.join(' or ')})`);
            }
            if (this.options.filterByUserID) {
                query.set('filter', `${query.get('filter')} and worker.userid eq ${this.options.filterByUserID}`);
            }
        }

        return this.statisticsService.GetAllByUrlSearchParams(query, false)
        .map(response => response.json().Data)
        .finally( () => this.busy = false)
        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private updateOrders(list: Array<IWorkHours>, options: IWizardOptions): Array<WorkOrder> {
        const orders: Array<WorkOrder> = [];
        let order: WorkOrder;

        for (let i = 0; i < list.length; i++) {
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
                item.ItemText = `${row.WorktypeName}${row.Description ? ' : ' + row.Description : ''}`;
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
        }

        return orders;
    }

    private createOrders(list: Array<IWorkHours>, options: IWizardOptions): Array<WorkOrder> {
        const orders: Array<WorkOrder> = [];
        let order: WorkOrder;

        for (let i = 0; i < list.length; i++) {
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
        }

        return orders;
    }


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
