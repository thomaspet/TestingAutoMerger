import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {DistributionPlan} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {ElementTypes, ElementType} from '@app/models/distribution';
import { Observable } from 'rxjs';

@Injectable()
export class DistributionPlanService extends BizHttp<DistributionPlan> {

    entityTypes = [
        { value: 'Models.Sales.CustomerInvoice', keyValue: 'CustomerInvoiceDistributionPlanID', label: 'Faktura', },
        { value: 'Models.Sales.CustomerOrder', keyValue: 'CustomerOrderDistributionPlanID', label: 'Ordre' },
        { value: 'Models.Sales.CustomerQuote', keyValue: 'CustomerQuoteDistributionPlanID', label: 'Tilbud' },
        { value: 'Models.Sales.CustomerInvoiceReminder', keyValue: 'CustomerInvoiceReminderDistributionPlanID', label: 'Purring' }
    ];

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = DistributionPlan.RelativeUrl;
        this.entityType = DistributionPlan.EntityType;
        this.DefaultOrderBy = null;
    }

    public getAllPlans() {
        return this.GetAll('', ['Elements', 'Elements.ElementType'])
            .map(distributions => {
                distributions.forEach(distribution => {
                    if (distribution && distribution.Elements && distribution.Elements.length > 0) {
                        distribution.Elements.forEach(element => {
                            element.ElementType._label = this.getElementTypeText(element.ElementType.ID);
                        });
                    }
                });

                return distributions;
            });
    }

    public getElementTypes() {
        return this.http
            .asGET()
            .usingStatisticsDomain()
            .withEndPoint('?model=DistributionPlanElementType&select=ID as ID,Name as Name,StatusCode as StatusCode&wrap=false')
            .send()
            .map(res => res.body)
            .map(elementTypes => { // Add frontend labels
                elementTypes.forEach(elementType => {
                    elementType._label = this.getElementTypeText(elementType.ID);
                });
                return elementTypes;
            });
    }

    public saveDistributionPlan(plan) {
        if (!plan.ID) {
            return super.Post(plan);
        } else {
            return super.Put(plan.ID, plan);
        }
    }

    public getCustomerCount(plans: any[]) {
        // Query on the customer object to count different connections to plans. Use only active customer
        let query = `?model=Customer&expand=Distributions&filter=StatusCode ne '50001'&select=`;

        // One count value per plan
        plans.forEach((plan) => {
            query += `sum(casewhen(Distributions.${this.getEntityTypeIDKey(plan.EntityType)} eq ${plan.ID},1,0)) as count${plan.ID},`;
        });

        // Count all customers who will be affected by company default, because they have no plan defined
        this.entityTypes.forEach((type) => {
            query += `sum(casewhen(isnull(Distributions.${type.keyValue},0) eq 0 or isnull(DefaultDistributionsID,0) eq 0,1,0)) `
            + `as ${type.label},`;
        });

        query = query.substr(0, query.length - 1);

        return this.http
            .asGET()
            .usingStatisticsDomain()
            .withEndPoint(query)
            .send()
            .map(res => res.body);
    }

    public getEntityTypeIDKey(entityType: string) {
        switch (entityType) {
            case 'Models.Sales.CustomerInvoice':
                return 'CustomerInvoiceDistributionPlanID';
            case 'Models.Sales.CustomerOrder':
                return 'CustomerOrderDistributionPlanID';
            case 'Models.Sales.CustomerQuote':
                return 'CustomerQuoteDistributionPlanID';
            case 'Models.Sales.CustomerInvoiceReminder':
                return 'CustomerInvoiceReminderDistributionPlanID';

            // case 'Models.Salary.PayCheck':
            //     return 'PayCheckDistributionPlanID';
            // case 'Models.Salary.AnnualStatement':
            //     return 'AnnualStatementDistributionPlanID';
        }
    }

    public getElementTypeText(elementType: ElementType) {
        const type = ElementTypes.find(x => x.type === elementType);
        return type.label;
    }

    public getElementName(elementType: ElementType) {
        const type = ElementTypes.find(x => x.type === elementType);
        return type.name;
    }

    public getForCustomers(ids: number[]): Observable<any> {
        if (ids?.length === 0) return Observable.of({});

        const idsstring = ids.join(",");

        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`distributions?action=get-valid-distributions-for-customers&customerIds=${idsstring}`)
            .send()
            .map(res => res.body|| {});
    }

    public getForCustomer(id: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`distributions?action=get-valid-distributions-for-customer&customerId=${id}`)
            .send()
            .map(res => res.body || []);
    }
}
