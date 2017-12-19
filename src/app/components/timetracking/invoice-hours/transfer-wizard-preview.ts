import {Component, OnInit, Input, ViewChild} from '@angular/core';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ErrorService } from '@app/services/common/errorService';
import { IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType, UniTable } from '@uni-framework/ui/unitable';
import { Observable } from 'rxjs/Observable';
import {URLSearchParams} from '@angular/http';
import {IWizardOptions} from './wizardoptions';
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
        this.fetchData().subscribe( list => {
            this.orderList = this.createOrders(list, this.options);
        });
    }

    public fetchData() {

        const query: URLSearchParams = new URLSearchParams();

        this.busy = true;

        query.set('model', 'workitem');
        query.set('select', 'ID as ID'
            + ',Date as Date'
            + ',CustomerID as CustomerID'
            + ',Description as Description'
            + ',Worktype.ID as WorktypeID'
            + ',WorkType.Name as WorktypeName'
            + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes');
        query.set('expand', 'workrelation.worker,worktype.product');
        query.set('orderby', 'customerid,worktype.name');
        query.set('filter', 'transferedtoorder eq 0 and CustomerID gt 0');

        if (this.options) {
            if (this.options.selectedCustomers && this.options.selectedCustomers.length > 0) {
                const list = [];
                for (let i = 0; i < this.options.selectedCustomers.length; i++) {
                    list.push(`customerid eq ${this.options.selectedCustomers[i].CustomerID}`);
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

    createOrders(list: Array<IWorkHours>, options: IWizardOptions): Array<WorkOrder> {
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
                orders.push(order);
            }
            const workType = options.selectedProducts.find( x => x.WorktypeID === row.WorktypeID );
            const item = new WorkOrderItem();
            if (workType) {
                item.ItemText = `${row.WorktypeName} : ${row.Description}`;
                item.ProductID = workType.ProductID;
                item.PriceExVat = workType.PriceExVat;
            } else {
                item.ItemText = row.Description;
            }
            item.NumberOfItems = roundTo(row.SumMinutes / 60, 2);
            item.ItemSource = new WorkItemSource();
            item.ItemSource.Details.push(new WorkItemSourceDetail(row.ID, row.SumMinutes));

            order.addItem(item);
        }

        if (orders.length === 1) {
            orders[0]._expand = true;
        }

        return orders;
    }


}

interface IWorkHours {
    ID: number;
    Date: Date;
    CustomerID: number;
    Description: string;
    WorktypeID: number;
    WorktypeName: string;
    SumMinutes: number;
}
