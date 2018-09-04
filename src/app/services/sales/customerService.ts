import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Customer} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {StatisticsService} from '../common/statisticsService';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class CustomerService extends BizHttp<Customer> {

    constructor(http: UniHttp, private statisticsService: StatisticsService) {
        super(http);

        this.relativeURL = Customer.RelativeUrl;

        this.entityType = Customer.EntityType;

        this.DefaultOrderBy = 'Info.Name';

        this.defaultExpand = ['Info'];
    }

    public deleteCustomer(id: any): any {
        return this.http.asPUT()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=block&ID=${id}`)
            .send();
    }

    public activateCustomer(id: any): any {
        return this.http
            .asPUT()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=activate&ID=${id}`)
            .send();
    }

    public deactivateCustomer(id: any): any {
        return this.http
            .asPUT()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=deactivate&ID=${id}`)
            .send();
    }

    public getCustomerOrderStatistics(customerID: number): Observable<CustomerStatisticsData> {
        return this.statisticsService.GetAll('model=Customer&expand=CustomerOrders' +
            `&filter=Customer.ID eq ${customerID} and isnull(CustomerOrders.Deleted\,'false') eq 'false'` +
            '&select=Customer.ID as CustomerID,' +
            `sum(casewhen(CustomerOrders.StatusCode eq 41002 or CustomerOrders.StatusCode` +
            ` eq 41003\\,CustomerOrders.TaxExclusiveAmount\\,0)) as SumOpenOrdersExVat`)
                .map((response: any) => {
                        const orderData = response && response.Data ? response.Data[0] : null;

                        const customerStatistics = new CustomerStatisticsData();

                        if (orderData) {
                            customerStatistics.SumOpenOrdersExVat = orderData.SumOpenOrdersExVat;
                        }

                        return customerStatistics;
                    });
    }

    public getCustomerInvoiceStatistics(customerID: number): Observable<CustomerStatisticsData> {
        return this.statisticsService.GetAll('model=Customer&expand=CustomerInvoices' +
            `&filter=Customer.ID eq ${customerID} and isnull(CustomerInvoices.Deleted\,'false') eq 'false'` +
            '&select=Customer.ID as CustomerID,' +
            `sum(casewhen(getdate() gt CustomerInvoices.PaymentDueDate and ` +
            `CustomerInvoices.StatusCode ne 42004\\,1\\,0)) as NumberOfDueInvoices,` +
            `sum(casewhen(getdate() gt CustomerInvoices.PaymentDueDate and CustomerInvoices.StatusCode ne 42004\\,` +
            `CustomerInvoices.RestAmount\\,0)) as SumDueInvoicesRestAmount,` +
            `sum(casewhen(CustomerInvoices.StatusCode eq 42002 or CustomerInvoices.StatusCode eq 42003 or ` +
            `CustomerInvoices.StatusCode eq 42004\\,CustomerInvoices.TaxExclusiveAmount\\,0)) as SumInvoicedExVat`).map((response) => {
                const invoiceData = response && response.Data ? response.Data[0] : null;
                const customerStatistics = new CustomerStatisticsData();

                if (invoiceData) {
                    customerStatistics.NumberOfDueInvoices = invoiceData.NumberOfDueInvoices;
                    customerStatistics.SumDueInvoicesRestAmount = invoiceData.SumDueInvoicesRestAmount;
                    customerStatistics.SumInvoicedExVat = invoiceData.SumInvoicedExVat;
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
