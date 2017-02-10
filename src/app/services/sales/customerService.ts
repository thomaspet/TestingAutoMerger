import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Customer} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {StatisticsService} from '../services';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class CustomerService extends BizHttp<Customer> {

    constructor(http: UniHttp, authService: AuthService, private statisticsService: StatisticsService) {
        super(http, authService);

        this.relativeURL = Customer.RelativeUrl;

        this.entityType = Customer.EntityType;

        this.DefaultOrderBy = "Info.Name";

        this.defaultExpand = ["Info"];
    }

    public getCustomerStatistics(customerID: number): Observable<CustomerStatisticsData> {
        return Observable.forkJoin(
           this.statisticsService
                .GetAll('model=Customer' +
                    '&expand=CustomerInvoices' +
                    `&filter=Customer.ID eq ${customerID} and isnull(CustomerInvoices.Deleted\,'false') eq 'false'` +
                    '&select=Customer.ID as CustomerID,' +
                        `sum(casewhen(getdate() gt CustomerInvoices.PaymentDueDate and CustomerInvoices.StatusCode ne 42004\\,1\\,0)) as NumberOfDueInvoices,` +
                        `sum(casewhen(getdate() gt CustomerInvoices.PaymentDueDate and CustomerInvoices.StatusCode ne 42004\\,CustomerInvoices.RestAmount\\,0)) as SumDueInvoicesRestAmount,` +
                        `sum(casewhen(CustomerInvoices.StatusCode eq 42002 or CustomerInvoices.StatusCode eq 42003 or CustomerInvoices.StatusCode eq 42004\\,CustomerInvoices.TaxExclusiveAmount\\,0)) as SumInvoicedExVat`),
            this.statisticsService
                .GetAll('model=Customer' +
                    '&expand=CustomerOrders' +
                    `&filter=Customer.ID eq ${customerID} and isnull(CustomerOrders.Deleted\,'false') eq 'false'` +
                    '&select=Customer.ID as CustomerID,' +
                        `sum(casewhen(CustomerOrders.StatusCode eq 41002 or CustomerOrders.StatusCode eq 41003\\,CustomerOrders.TaxExclusiveAmount\\,0)) as SumOpenOrdersExVat`)
            )
            .map((responses: Array<any>) => {
                let invoiceData = responses[0] && responses[0].Data ? responses[0].Data[0] : null;
                let orderData = responses[1] && responses[1].Data ? responses[1].Data[0] : null;

                let customerStatistics = new CustomerStatisticsData();

                if (invoiceData) {
                    customerStatistics.NumberOfDueInvoices = invoiceData.NumberOfDueInvoices;
                    customerStatistics.SumDueInvoicesRestAmount = invoiceData.SumDueInvoicesRestAmount;
                    customerStatistics.SumInvoicedExVat = invoiceData.SumInvoicedExVat;
                }

                if (orderData) {
                    customerStatistics.SumOpenOrdersExVat = orderData.SumOpenOrdersExVat;
                }

                return customerStatistics;
            });
    }
}

export class CustomerStatisticsData {
    public CustomerID: number;
    public NumberOfDueInvoices: number;
    public SumDueInvoicesRestAmount: number;
    public SumInvoicedExVat: number;
    public SumOpenOrdersExVat: number;
}
