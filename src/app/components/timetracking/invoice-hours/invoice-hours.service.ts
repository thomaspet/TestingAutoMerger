import { IWizardOptions, WizardSource } from './wizardoptions';
import {URLSearchParams} from '@angular/http';
import { StatisticsService } from '@app/services/services';
import { Injectable } from '@angular/core';
import { roundTo } from '@app/components/common/utils/utils';
import { Observable } from 'rxjs/Observable';

export interface ISumHours {
    customerHours: number;
    orderHours: number;
    projectHours: number;
    total: number;
}

@Injectable()
export class InvoiceHourService {

    constructor(private statisticsService: StatisticsService) {

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
        const filter = `CustomerOrderID eq ${orderID}`;

        query.set('model', 'workitem');

        query.set('select', 'CustomerOrderID as OrderID'
            + ',sum(casewhen(minutestoorder ne 0,minutestoorder,minutes)) as SumMinutes'
            + ',sum(casewhen(transferedtoorder eq 0,minutes,0)) as SumNotTransfered');
        query.set('expand', 'customerorder');

        query.set('filter', filter);

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

    public getWorkTypeWithProducts(options: IWizardOptions) {
        const query = new URLSearchParams();

        query.set('model', 'workitem');
        query.set('select', 'sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes'
            + ',Worktype.ID as WorktypeID'
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
        + ',Worktype.ID as WorktypeID'
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

}
