import {URLSearchParams} from '@angular/http';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ProductService } from '@app/services/common/productService';
import { ValueItem } from '@app/services/timetracking/timesheetService';
import { Injectable } from '@angular/core';
import { roundTo, filterInput } from '@app/components/common/utils/utils';
import { Observable } from 'rxjs';

import {
    WorkOrder,
    WorkOrderItem,
    WorkItemSource,
    WorkItemSourceDetail,
} from '@app/components/common/timetrackingCommon/invoice-hours/workorder';

import {
    IWizardOptions,
    WizardSource,
    MergeByEnum,
} from '@app/components/common/timetrackingCommon/invoice-hours/wizardoptions';
import { WorkItem } from '@uni-entities';

export interface ISumHours {
    customerHours: number;
    orderHours: number;
    projectHours: number;
    total: number;
}

export interface CustomWorkItem extends WorkItem {
    WorkTypeID: number;
    WorktypeName: string;
    WorkerName: string;
    PriceExVat: number;
    PriceExVatCurrency: number;
    ProductPartName: string;
    Unit: string;
    ProductID: number;
    VatTypeID: number;
    ProductName: string;
    ProductDescription: string;
    SumMinutes: number;
    _sumTotal: number;
    _discountPercent: number;
    _transferredToOrder: boolean;
    _rowSelected: boolean;
}

const BATCH_SIZE = 100;

@Injectable()
export class InvoiceHourService {
    private orderList: Array<WorkOrder> = [];
    public computing = true;

    constructor(private statisticsService: StatisticsService, private productService: ProductService) {

    }

    public getHourTotals(options: IWizardOptions): Observable<ISumHours[]> {
        const query = new URLSearchParams();
        query.set('model', 'workitem');
        query.set('select', `casewhen(worker.userid eq ${options.currentUser.ID}\,1\,0) as IsCurrentUser`
            + ',casewhen(customerid gt 0\,1\,0) as IsCustomerHours'
            + ',casewhen(customerorderid gt 0\,1\,0) as IsOrderHours'
            + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes');
        query.set('filter', 'transferedtoorder eq 0 and (customerid gt 0 or customerorderid gt 0 or dimensions.projectid gt 0)'
            + ` and ( date ge '${options.periodFrom}' and date le '${options.periodTo}' )`
        );
        query.set('expand', 'dimensions,workrelation.worker');

        return this.statisticsService.GetAllByUrlSearchParams(query, true)
            .map( response => {
                const mapped = [
                    { customerHours: 0, orderHours: 0, projectHours: 0, total: 0 },
                    { customerHours: 0, orderHours: 0, projectHours: 0, total: 0 }
                ];
                const body = response.json().Data;
                if (body && body.length > 0) {
                    body.forEach(element => {
                        const hours = roundTo(element.SumMinutes / 60, 1);
                        const index = element.IsCurrentUser;
                        if (element.IsCustomerHours) {
                            mapped[index].customerHours = hours;
                        } else if (element.IsOrderHours) {
                            mapped[index].orderHours = hours;
                        } else {
                            mapped[index].projectHours = hours;
                        }
                        mapped[index].total += hours;
                    });
                    mapped[0].customerHours += mapped[1].customerHours;
                    mapped[0].orderHours += mapped[1].orderHours;
                    mapped[0].projectHours += mapped[1].projectHours;
                    mapped[0].total += mapped[1].total;
                    mapped[0].total = roundTo(mapped[0].total, 1);
                }
                return mapped;
            });
    }

    getInvoicableHoursOnOrder(orderID: number) {
        const query = new URLSearchParams();
        query.set('model', 'workitem');
        query.set('select', 'sum(casewhen(minutestoorder ne 0,minutestoorder,minutes)) as SumMinutes'
            + ',sum(casewhen(transferedtoorder eq 0,casewhen(minutestoorder ne 0,minutestoorder,minutes),0)) as SumNotTransfered');
        query.set('filter', `CustomerOrderID eq ${orderID}`);
        return this.statisticsService.GetAllByUrlSearchParams(query, true).map(response => response.json().Data);
    }

    public getGroupedInvoicableHours(options: IWizardOptions) {
        const query = new URLSearchParams();
        let filter = '';

        query.set('model', 'workitem');

        switch (options.source) {
            default:
            case WizardSource.CustomerHours:
                query.set('select', 'CustomerID as CustomerID'
                    + ',Customer.CustomerNumber as CustomerNumber'
                    + ',Info.Name as CustomerName'
                    + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes');
                query.set('expand', 'workrelation.worker,customer.info');
                query.set('orderby', 'info.name');
                filter = 'transferedtoorder eq 0 and CustomerID gt 0';
                break;

            case WizardSource.OrderHours:
                query.set('select', 'CustomerOrderID as OrderID'
                    + ',CustomerOrder.OrderNumber as OrderNumber'
                    + ',CustomerOrder.CustomerName as CustomerName'
                    + ',CustomerOrder.CustomerID as CustomerID'
                    + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes');
                query.set('expand', 'workrelation.worker,customerorder');
                query.set('orderby', 'CustomerOrderID desc');
                filter = 'transferedtoorder eq 0 and CustomerOrderID gt 0';
                break;

            case WizardSource.ProjectHours:
                query.set('select', 'Dimensions.ProjectID as ProjectID'
                    + ',Project.ProjectNumber as ProjectNumber'
                    + ',Project.Name as ProjectName'
                    + ',businessrelation.Name as CustomerName'
                    + ',customer.ID as CustomerID'
                    + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes');
                query.set('expand', 'workrelation.worker,dimensions.project');
                query.set('join', 'dimensions.projectid eq project.id'
                    + ' and project.projectcustomerid eq customer.id'
                    + ' and customer.businessrelationid eq businessrelation.id');
                query.set('orderby', 'dimensions.projectid desc');
                filter = 'transferedtoorder eq 0 and dimensions.projectid gt 0';
                break;
        }

        if (options && options.filterByUserID) {
            filter += ` and worker.userid eq ${options.filterByUserID}`;
        }

        filter += ` and ( date ge '${options.periodFrom}' and date le '${options.periodTo}' )`;

        query.set('filter', filter);

        return this.statisticsService.GetAllByUrlSearchParams(query, true);

    }


    getWorkHours(options) {
        const query = new URLSearchParams();
        let filter = '';

        query.set('model', 'WorkItem');

        query.set('select',
            'ID as ID'
            + ',CustomerOrderID as CustomerOrderID'
            + ',CustomerID as CustomerID'
            + ',Worktype.ID as WorkTypeID'
            + ',Worktype.Name as WorktypeName'
            + ',Date as Date'
            + ',StartTime as StartTime'
            + ',EndTime as EndTime'
            + ',Description as Description'
            + ',TransferedToOrder as TransferedToOrder'
            + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes'
            + ',Info.Name as WorkerName'
            + ',casewhen(Worktype.Price ne 0\,Worktype.Price\,Product.PriceExVat) as PriceExVat'
            + ',casewhen(Worktype.Price ne 0\,Worktype.Price\,Product.PriceExVatCurrency) as PriceExVatCurrency'
            + ',Product.PartName as ProductPartName'
            + ',Product.Unit as Unit'
            + ',Product.ID as ProductID'
            + ',Product.VatTypeID as VatTypeID'
            + ',Product.Name as ProductName'
            + ',Product.Description as ProductDescription');
        query.set('expand', 'Worktype.Product,WorkRelation.Worker.Info');
        query.set('orderby', 'Worktype.Name');

        filter = `CustomerOrderID eq ${options.orderID}`;
        if (options.tabValue === 1) {
            filter = `CustomerID eq ${options.customerID}`;
        }
        filter += ' and (Minutes ne 0 or MinutesToOrder ne 0)';

        query.set('filter', filter);

        return this.statisticsService.GetAllByUrlSearchParams(query, true).map(resp => resp.json().Data);
    }

    public getWorkTypeWithProducts(options: IWizardOptions) {
        const query = new URLSearchParams();

        query.set('model', 'workitem');
        query.set('select', 'sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes'
            + ',Worktype.ID as WorkTypeID'
            + ',WorkType.Name as WorktypeName'
            + ',casewhen(WorkType.Price ne 0\,WorkType.Price\,Product.PriceExVat) as PriceExVat'
            + ',Product.PartName as PartName'
            + ',Product.Unit as Unit'
            + ',Product.ID as ProductID'
            + ',Product.VatTypeID as VatTypeID'
            + ',Product.Name as ProductName');
        query.set('expand', 'workrelation.worker,worktype.product');
        query.set('orderby', 'worktype.name');
        let filter = 'transferedtoorder eq 0';

        if (options) {
            if (options.selectedCustomers && options.selectedCustomers.length > 0) {
                const list = [];
                for (let i = 0; i < options.selectedCustomers.length; i++) {
                    switch (options.source) {
                        case WizardSource.CustomerHours:
                            list.push(`customerid eq ${options.selectedCustomers[i].CustomerID}`);
                            break;
                        case WizardSource.OrderHours:
                            list.push(`customerorderid eq ${options.selectedCustomers[i].OrderID}`);
                            break;
                        case WizardSource.ProjectHours:
                            list.push(`dimensions.projectid eq ${options.selectedCustomers[i].ProjectID}`);
                            query.set('expand', 'workrelation.worker,worktype.product,dimensions');
                            break;
                        }
                }
                filter += ` and (${list.join(' or ')})`;
            }
            if (options.filterByUserID) {
                filter += ` and worker.userid eq ${options.filterByUserID}`;
            }
        }

        filter += ` and ( date ge '${options.periodFrom}' and date le '${options.periodTo}' )`;

        query.set('filter', filter);

        return this.statisticsService.GetAllByUrlSearchParams(query, false);
    }

    public getOrderLineBaseData(options: IWizardOptions) {
        const query: URLSearchParams = new URLSearchParams();

        let groupField = 'CustomerID';
        let customerField = 'CustomerID';

        switch (options.source) {
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
        + ',Worktype.ID as WorkTypeID'
        + ',WorkType.Name as WorktypeName'
        + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes');

        query.set('orderby', `${groupField},worktype.name`);
        let filter = 'transferedtoorder eq 0';

        if (options) {
            if (options.selectedCustomers && options.selectedCustomers.length > 0) {
                const list = [];
                for (let i = 0; i < options.selectedCustomers.length; i++) {
                    switch (options.source) {
                        case WizardSource.CustomerHours:
                            list.push(`customerid eq ${options.selectedCustomers[i].CustomerID}`);
                            break;
                        case WizardSource.OrderHours:
                            list.push(`customerorderid eq ${options.selectedCustomers[i].OrderID}`);
                            break;
                        case WizardSource.ProjectHours:
                            list.push(`dimensions.projectid eq ${options.selectedCustomers[i].ProjectID}`);
                            break;
                        }
                }
                filter += ` and (${list.join(' or ')})`;
            }
            if (options.filterByUserID) {
                filter += ` and worker.userid eq ${options.filterByUserID}`;
            }
        }

        filter += ` and ( date ge '${options.periodFrom}' and date le '${options.periodTo}' )`;

        query.set('filter', filter);

        return this.statisticsService.GetAllByUrlSearchParams(query, false)
        .map(response => response.json().Data);
    }

    lookupProduct(txt: string) {
        const params = new URLSearchParams();
        const value = filterInput(txt);
        params.set('filter', `partname eq '${value}' or startswith(name,'${value}')`);
        params.set('top', '50');
        params.set('hateoas', 'false');
        params.set('select', 'ID,Partname,Name,PriceExVat,VatTypeID,Unit');
        return this.productService.GetAllByUrlSearchParams(params).map(result => result.json());
    }

    onEditChange(event: { originalIndex: number, field: string, rowModel: CustomWorkItem }) {
        const change = new ValueItem(event.field, event.rowModel[event.field], event.originalIndex);
        if (event.field === 'PartName' && change.value && change.value.ID) {
            event.rowModel['ProductID'] = change.value.ID;
            event.rowModel['PartName'] = change.value.PartName;
            event.rowModel['ProductName'] = change.value.Name;
            event.rowModel['PriceExVat'] = change.value.PriceExVat;
            event.rowModel['VatTypeID'] = change.value.VatTypeID;
            event.rowModel['Unit'] = change.value.Unit;
        }
        return event.rowModel;
    }

    processList(list: Array<IWorkHours>, options: IWizardOptions, order?: WorkOrder): Promise<WorkOrder[]> {
        return new Promise(resolve => {
        this.computing = true;
        this.orderList.length = 0;
            this.createOrders(list, options, [], 0, order).then(orders => {
            if (options.addComment) {
                orders.forEach(x => x.insertDateComment('Timer for perioden'));
            }
            this.orderList = orders;
            this.orderList[0]._expand = true;
            this.computing = false;
                resolve(orders);
        });
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
                return `${row.WorktypeName}${row.Description ? ' : ' + row.Description : ''}`;
        }
    }

    private createOrders(hours: Array<IWorkHours>, options: IWizardOptions, orders = [], startIndex = 0,
        order?: WorkOrder): Promise<Array<WorkOrder>> {
            const isOrderUpdate = options.source === WizardSource.OrderHours;

            return new Promise((resolve, reject) => {
                for (let i = startIndex; i < hours.length; i++) {
                    const row = hours[i];
                    const dto = isOrderUpdate ?
                        options.selectedCustomers.find(x => x.OrderID === row.GroupValue) :
                        options.selectedCustomers.find(x => x.CustomerID === row.CustomerID);

                    if ((!order) || order.CustomerID !== row.CustomerID) {
                        order = new WorkOrder();
                        order.ID = isOrderUpdate ? row.GroupValue : order.ID;
                        order.CustomerID = isOrderUpdate ? dto.CustomerID : row.CustomerID;
                        order.CustomerName = dto.CustomerName;
                        order.OurReference = options.currentUser.DisplayName;
                        if (options.source === WizardSource.ProjectHours) {
                            order.setProject(row.GroupValue);
                        }
                        orders.push(order);
                    }

                    const workType = options.selectedProducts.find(x => x.WorkTypeID === row.WorkTypeID);
                    const item = new WorkOrderItem();
                    if (workType && workType._rowSelected) {
                        item.ID = workType.ID;
                        item.ItemText = this.buildItemText(row, workType, options);
                        item.ProductID = workType.ProductID;
                        item.Unit = workType.Unit;
                        item.PriceExVat = workType.PriceExVat;
                        item.PriceExVatCurrency = workType.PriceExVat;
                        item.SumTotalExVat = workType._sumTotal;
                        item.SumTotalExVatCurrency = workType._sumTotal;
                        item.DiscountPercent = workType._discountPercent;
                        item.VatTypeID = workType.VatTypeID;
                        item.NumberOfItems = roundTo(row.SumMinutes / 60, 2);
                        item.ItemSource = new WorkItemSource();
                        item.ItemSource.Details.push(new WorkItemSourceDetail(row.ID, row.SumMinutes));
                        if (options.source === WizardSource.ProjectHours) {
                            item.setProject(row.GroupValue);
                        }
                        order.addItem(item, true, row.Date);
                    }

                    // To prevent js-locking we process only BATCH_SIZE rows at the time
                    if (i - startIndex > BATCH_SIZE) {
                        setTimeout(() => {
                            this.createOrders(hours, options, orders, i + 1, order)
                                .then(() => {
                                    resolve(orders);
                                });
                        });
                        return;
                    }
                }
                if (options.addItemsDirectly) {
                    orders.push(order);
                }
                resolve(orders);
            });
    }
}

export interface IWorktypeInfo {
    ProductName: string;
    PartName: string;
    WorktypeName: string;
}

export interface IWorkHours {
    ID: number;
    Date: string;
    GroupValue: number;
    CustomerID: number;
    Description: string;
    WorkTypeID: number;
    WorktypeName: string;
    SumMinutes: number;
}
