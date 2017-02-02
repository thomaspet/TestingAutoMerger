import {Injectable} from '@angular/core';
import {IUniSearchConfig} from 'unisearch-ng2/main';
import {Customer, BusinessRelation, Address, Phone, Email, UniEntity} from '../../unientities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import {StatisticsService} from './statisticsService';
import {IntegrationServerCaller} from './integrationServerCaller';
import {BusinessRelationSearch} from '../../models/Integration/BusinessRelationSearch';
import {CustomerService} from '../sales/customerService';
import {ErrorService} from './errorService';


const MAX_RESULTS = 50;

class CustomStatisticsResultItem {
    /* tslint:disable */
    public ID: number;
    public Name: string;
    public OrgNumber: string;
    public PhoneNumber: string;
    public AddressLine1: string;
    public PostalCode: string;
    public City: string;
    public CountryCode: string;
    public EmailAddress: string;
    public WebUrl: string;
}

@Injectable()
export class UniSearchConfigGeneratorService {

    constructor(
        private statisticsService: StatisticsService,
        private customerService: CustomerService,
        private errorService: ErrorService,
        private integrationServerCaller: IntegrationServerCaller
    ) {}

    public generateUniSearchConfig(
        classType: UniEntity,
        expands: [string] = ['Info.Addresses'],
        newItemModalFn?: () => Observable<UniEntity>
    ): any {
        switch (classType) {
            case Customer: return {
                lookupFn: searchTerm => this
                    .statisticsService
                    .GetAllUnwrapped(this.generateCustomerStatisticsQuery(searchTerm)),
                expandOrCreateFn: (newOrExistingItem: CustomStatisticsResultItem) => {
                    if (newOrExistingItem.ID) {
                        return this.customerService.Get(newOrExistingItem.ID, expands)
                            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                    } else {
                        return this.customerService.Post(this.customStatisticsObjToCustomer(newOrExistingItem))
                            .switchMap(item => this.customerService.Get(item.ID, expands))
                            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                    }
                },
                initialItem$: new BehaviorSubject(null),
                tableHeader: ['Navn', 'Tlf', 'Adresse', 'Poststed', 'Org.Nr'],
                rowTemplateFn: item => [
                    item.Name,
                    item.PhoneNumber,
                    item.AddressLine1,
                    `${item.PostalCode || ''} ${item.City || ''}`,
                    item.OrgNumber
                ],
                inputTemplateFn: item => item.Info && item.Info.Name,
                newItemModalFn: newItemModalFn,
                externalLookupFn: query =>
                    this.integrationServerCaller
                        .businessRelationSearch(query, MAX_RESULTS)
                        .map(results =>
                            results.map(result =>
                                this.mapExternalSearchToCustomStatisticsObj(result)
                            )
                        )
            };
        }
    }

    private generateCustomerStatisticsQuery(searchTerm: string): string {
        const model = 'Customer';
        const expand = 'Info.Phones,Info.Addresses,Info.Emails';
        const filter = '('
            + ` contains(Info.Name,'${searchTerm}')`
            + ` or startswith(Customer.OrgNumber,'${searchTerm}')`
            + ` or startswith(Phones.Number,'${searchTerm}')`
            + ` ) and isnull(Phones.Deleted,'false') eq 'false' and Customer.Deleted eq 'false'`;
        const select = [
            'Customer.ID as ID',
            'Info.Name as Name',
            'Customer.OrgNumber as OrgNumber',
            'Phones.Number as PhoneNumber',
            'Addresses.AddressLine1 as AddressLine1',
            'Addresses.PostalCode as PostalCode',
            'Addresses.City as City',
            'Addresses.CountryCode as CountryCode',
            'Emails.EmailAddress as EmailAddress',
            'Customer.WebUrl as WebUrl'
        ].join(',');
        const orderby = 'Info.Name';
        const skip = 0;
        const top = MAX_RESULTS;
        return `model=${model}`
            + `&expand=${expand}`
            + `&filter=${filter}`
            + `&select=${select}`
            + `&orderby=${orderby}`
            + `&skip=${skip}`
            + `&top=${top}`;
    }

    private mapExternalSearchToCustomStatisticsObj(
        businessRelationSearch: BusinessRelationSearch
    ): CustomStatisticsResultItem {
        return {
            ID: undefined,
            OrgNumber: businessRelationSearch.OrganizationNumber,
            Name: businessRelationSearch.Name,
            PhoneNumber: businessRelationSearch.Phone,
            AddressLine1: businessRelationSearch.Streetaddress,
            PostalCode: businessRelationSearch.PostCode,
            City: businessRelationSearch.City,
            CountryCode: businessRelationSearch.CountryCode,
            EmailAddress: businessRelationSearch.EmailAddress,
            WebUrl: businessRelationSearch.Url
        };
    }

    public customStatisticsObjToCustomer(statObj: CustomStatisticsResultItem): Customer {
        const customer = new Customer();
        customer.OrgNumber = statObj.OrgNumber;
        customer.WebUrl = statObj.WebUrl;
        customer.Info = new BusinessRelation();
        customer.Info.Name = statObj.Name;
        if (statObj.AddressLine1 || statObj.City || statObj.CountryCode || statObj.PostalCode) {
            customer.Info.Addresses = [new Address()];
            customer.Info.Addresses[0].AddressLine1 = statObj.AddressLine1;
            customer.Info.Addresses[0].PostalCode = statObj.PostalCode;
            customer.Info.Addresses[0].City = statObj.City;
            customer.Info.Addresses[0].CountryCode = statObj.CountryCode;
        }
        if (statObj.PhoneNumber) {
            customer.Info.Phones = [new Phone()];
            customer.Info.Phones[0].Number = statObj.PhoneNumber;
        }
        if (statObj.EmailAddress) {
            customer.Info.Emails = [new Email()];
            customer.Info.Emails[0].EmailAddress = statObj.EmailAddress;
        }
        return customer;
    }
}
