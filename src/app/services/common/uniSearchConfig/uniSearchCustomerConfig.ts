import {Injectable} from '@angular/core';
import {UniEntity, Customer, BusinessRelation, Address, Phone, Email} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {StatisticsService} from '../statisticsService';
import {CustomerService} from '../../sales/customerService';
import {GuidService} from '../guidService';
import {ErrorService} from '../errorService';
import {IntegrationServerCaller} from '../integrationServerCaller';
import {BusinessRelationSearch} from '../../../models/Integration/BusinessRelationSearch';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/index';

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
export class UniSearchCustomerConfig {

    constructor(
        private statisticsService: StatisticsService,
        private customerService: CustomerService,
        private errorService: ErrorService,
        private integrationServerCaller: IntegrationServerCaller,
        private guidService: GuidService
    ) {}

    public generate(
        expands: string[] = ['Info.Addresses'],
        newItemModalFn?: () => Observable<UniEntity>
    ): IUniSearchConfig {
        return <IUniSearchConfig>{
            lookupFn: searchTerm => this
                .statisticsService
                .GetAllUnwrapped(this.generateCustomerStatisticsQuery(searchTerm))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            onSelect: (selectedItem: CustomStatisticsResultItem) => {
                if (selectedItem.ID) {
                    return this.customerService.Get(selectedItem.ID, expands)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                } else {
                    return this.customerService.Post(this.customStatisticsObjToCustomer(selectedItem))
                        .switchMap(item => this.customerService.Get(item.ID, expands))
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Kundenr', 'Navn', 'Tlf', 'Adresse', 'Poststed', 'Org.Nr'],
            rowTemplateFn: item => [
                item.CustomerNumber,
                item.Name,
                item.PhoneNumber,
                item.AddressLine1,
                `${item.PostalCode || ''} ${item.City || ''}`,
                item.OrgNumber
            ],
            inputTemplateFn: item => `${item.Info && item.Info.Name ? item.Info.Name : ''}`,
            newItemModalFn: newItemModalFn,
            externalLookupFn: query =>
                this.integrationServerCaller
                    .businessRelationSearch(query, MAX_RESULTS)
                    .map(results =>
                        results.map(result =>
                            this.mapExternalSearchToCustomStatisticsObj(result)
                        )
                    ),
            maxResultsLength: MAX_RESULTS
        };
    }

    public generateDoNotCreate(
        expands: string[] = ['Info.Addresses'],
        newItemModalFn?: () => Observable<UniEntity>
    ): IUniSearchConfig {
        return <IUniSearchConfig>{
            lookupFn: searchTerm => this
                .statisticsService
                .GetAllUnwrapped(this.generateCustomerStatisticsQuery(searchTerm))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            onSelect: (selectedItem: CustomStatisticsResultItem) => {
                if (selectedItem.ID) {
                    return this.customerService.Get(selectedItem.ID, expands)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                } else {
                    const it = this.customStatisticsObjToCustomer(selectedItem);
                    it._createguid = this.guidService.guid();
                    if (it.Info) it.Info._createguid = this.guidService.guid();

                    if (it.Info.InvoiceAddress) {
                        it.Info.InvoiceAddress._createguid = this.guidService.guid();
                    }
                    if (it.Info.ShippingAddress) {
                        it.Info.ShippingAddress._createguid = this.guidService.guid();
                    }
                    if (it.Info.DefaultPhone) {
                        it.Info.DefaultPhone._createguid = this.guidService.guid();
                    }
                    if (it.Info.DefaultEmail) {
                        it.Info.DefaultEmail._createguid = this.guidService.guid();
                    }
                    return Observable.of(it);
                }
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Kundenr', 'Navn', 'Tlf', 'Adresse', 'Poststed', 'Org.Nr'],
            rowTemplateFn: item => [
                item.CustomerNumber,
                item.Name,
                item.PhoneNumber,
                item.AddressLine1,
                `${item.PostalCode || ''} ${item.City || ''}`,
                item.OrgNumber
            ],
            inputTemplateFn: item => `${item.CustomerNumber || ''}${item.Info && item.Info.Name ? ' ' + item.Info.Name : ''}`,
            newItemModalFn: newItemModalFn,
            externalLookupFn: query =>
                this.integrationServerCaller
                    .businessRelationSearch(query, MAX_RESULTS)
                    .map(results =>
                        results.map(result =>
                            this.mapExternalSearchToCustomStatisticsObj(result)
                        )
                    ),
            maxResultsLength: MAX_RESULTS
        };
    }

    private generateCustomerStatisticsQuery(searchTerm: string): string {
        const model = 'Customer';
        const expand = 'Info.DefaultPhone,Info.InvoiceAddress,Info.DefaultEmail,Info.Phones';
        const startNumber = this.getNumberFromStartOfString(searchTerm);
        let filter = `contains(Info.Name,'${searchTerm}')`;
        let orderBy = 'Info.Name';
        if (startNumber) {
            filter = ['Customer.OrgNumber', 'Customer.CustomerNumber', 'Phones.Number']
                .map(x => `startswith(${x},'${startNumber}')`).join(' or ');
            orderBy = 'Customer.CustomerNumber';
        }
        const select = [
            'Customer.ID as ID',
            'Info.Name as Name',
            'Customer.OrgNumber as OrgNumber',
            'DefaultPhone.Number as PhoneNumber',
            'InvoiceAddress.AddressLine1 as AddressLine1',
            'InvoiceAddress.PostalCode as PostalCode',
            'InvoiceAddress.City as City',
            'InvoiceAddress.CountryCode as CountryCode',
            'DefaultEmail.EmailAddress as EmailAddress',
            'Customer.WebUrl as WebUrl',
            'Customer.CustomerNumber as CustomerNumber'
        ].join(',');
        const skip = 0;
        const top = MAX_RESULTS;
        return `model=${model}`
            + `&expand=${expand}`
            + `&filter=${filter}`
            + `&select=${select}`
            + `&orderby=${orderBy}`
            + `&distinct=true`
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

    public customStatisticsObjToCustomer(
        statObj: CustomStatisticsResultItem,
        setDefaults: boolean = true,
        cust: Customer = new Customer()
    ): Customer {

        const customer = cust;
        customer.ID = 0;
        customer.OrgNumber = statObj.OrgNumber;
        customer.WebUrl = statObj.WebUrl;
        customer.Info = new BusinessRelation();
        customer.Info.Name = statObj.Name;
        customer.Info.Addresses = [];

        if (statObj.AddressLine1 || statObj.City || statObj.CountryCode || statObj.PostalCode) {

            const address = new Address();
            address.AddressLine1 = statObj.AddressLine1;
            address.PostalCode = statObj.PostalCode;
            address.City = statObj.City;
            address.CountryCode = statObj.CountryCode;
            customer.Info.InvoiceAddress = address;
            customer.Info.ShippingAddress = address;
            customer.Info.Addresses.push(address);
        }

        if (statObj.PhoneNumber) {
            const phone = new Phone();
            phone.Number = statObj.PhoneNumber;
            customer.Info.DefaultPhone = phone;
        }

        if (statObj.EmailAddress) {
            const mail = new Email();
            mail.EmailAddress = statObj.EmailAddress;
            customer.Info.DefaultEmail = mail;
        }

        return customer;
    }

     public generateOnlyExternalSearch(): IUniSearchConfig {
        return {
            lookupFn: query =>
                this.integrationServerCaller
                    .businessRelationSearch(query, MAX_RESULTS)
                    .map(results =>
                        results.map(result =>
                            this.mapExternalSearchToCustomStatisticsObj(result)
                        )
                    )
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            onSelect: (item: CustomStatisticsResultItem) => Observable.of(item),
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Navn', 'Tlf', 'Adresse', 'Poststed', 'Org.Nr'],
            rowTemplateFn: item => [
                item.Name,
                item.PhoneNumber,
                item.AddressLine1,
                `${item.PostalCode || ''} ${item.City || ''}`,
                item.OrgNumber
            ],
            inputTemplateFn: item => item.Name,
            maxResultsLength: MAX_RESULTS
        };
    }

    private getNumberFromStartOfString(str: string): number {
        const match = str.match(/^\d+/);
        return match && +match[0];
    }
}
