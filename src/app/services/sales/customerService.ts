import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Customer} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {StatisticsService} from '../common/statisticsService';
import {Observable} from 'rxjs';
import { StatisticsResponse } from '@app/models/StatisticsResponse';

@Injectable()
export class CustomerService extends BizHttp<Customer> {

    KIDCache = {};

    constructor(http: UniHttp, private statisticsService: StatisticsService) {
        super(http);

        this.relativeURL = Customer.RelativeUrl;

        this.entityType = Customer.EntityType;

        this.DefaultOrderBy = 'Info.Name';

        this.defaultExpand = [
            'Info',
            'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules',
            'CustomerInvoiceReminderSettings.DebtCollectionSettings'
        ];
    }

    public deleteCustomer(id: any): any {
        return this.http.asPUT()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=block&ID=${id}`)
            .send();
    }

    getCustomerDistributions(customerID: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`distributions?action=get-valid-distributions-for-customer&customerId=${customerID}`)
            .send()
            .map(res => res.body);
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

    public getCustomers(organizationNumber: string): Observable<StatisticsResponse> {
        const query = 'model=Customer&select=Customer.CustomerNumber as CustomerNumber,Info.Name as Name'
        + '&filter=Customer.OrgNumber eq ' + organizationNumber.replace(/ /g, '')
        + '&expand=Info';

        return this.statisticsService.GetAll(query);
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

    validateKID(value: string) {
        if (this.KIDCache[value]) {
            return Observable.of(this.KIDCache[value]);
        }
        return this.http
            .asGET()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=validate-customer-KID-Alias&customerKidAlias=${value}`)
            .send()
            .switchMap(res => {
                this.KIDCache[value] = res;
                return Observable.of(res);
            })
            .catch(res => {
                this.KIDCache[value] = res;
                return Observable.of(res);
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
