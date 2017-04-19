import {Injectable} from '@angular/core';
import {UniEntity, Supplier, BusinessRelation, Address, Phone, Email} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {StatisticsService} from '../statisticsService';
import {SupplierService} from '../../accounting/supplierService';
import {ErrorService} from '../errorService';
import {IntegrationServerCaller} from '../integrationServerCaller';
import {MAX_RESULTS} from './uniSearchConfigGeneratorService';
import {BusinessRelationSearch} from '../../../models/Integration/BusinessRelationSearch';
import {IUniSearchConfig} from 'unisearch-ng2/src/UniSearch/IUniSearchConfig';

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
export class UniSearchSupplierConfigGeneratorHelper {

    constructor(
        private statisticsService: StatisticsService,
        private supplierService: SupplierService,
        private errorService: ErrorService,
        private integrationServerCaller: IntegrationServerCaller
    ) {}

    public generate(
        expands: [string] = ['Info.Addresses'],
        newItemModalFn?: () => Observable<UniEntity>
    ): any {
        return {
            lookupFn: searchTerm => this
                .statisticsService
                .GetAllUnwrapped(this.generateSupplierStatisticsQuery(searchTerm))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            expandOrCreateFn: (newOrExistingItem: CustomStatisticsResultItem) => {
                if (newOrExistingItem.ID) {
                    return this.supplierService.Get(newOrExistingItem.ID, expands)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                } else {
                    return this.supplierService.Post(this.customStatisticsObjToSupplier(newOrExistingItem))
                        .switchMap(item => this.supplierService.Get(item.ID, expands))
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
            inputTemplateFn: item => `${item.SupplierNumber || ''}${item.Info && item.Info.Name ? ' ' + item.Info.Name : ''}`,
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

    private generateSupplierStatisticsQuery(searchTerm: string): string {
        const model = 'Supplier';
        const expand = 'Info.Phones,Info.Addresses,Info.Emails';
        const startNumber = this.getNumberFromStartOfString(searchTerm);
        let filter = `contains(Info.Name,'${searchTerm}')`;
        let orderBy = 'Info.Name';
        if (startNumber) {
            filter = ['Supplier.OrgNumber', 'Supplier.SupplierNumber', 'Phones.Number']
                .map(x => `startswith(${x},'${startNumber}')`).join(' or ');
            orderBy = 'Supplier.SupplierNumber';
        }
        const select = [
            'Supplier.ID as ID',
            'Info.Name as Name',
            'Supplier.OrgNumber as OrgNumber',
            'Supplier.SupplierNumber as SupplierNumber',
            'Phones.Number as PhoneNumber',
            'Addresses.AddressLine1 as AddressLine1',
            'Addresses.PostalCode as PostalCode',
            'Addresses.City as City',
            'Addresses.CountryCode as CountryCode',
            'Emails.EmailAddress as EmailAddress',
            'Supplier.WebUrl as WebUrl'
        ].join(',');
        const skip = 0;
        const top = MAX_RESULTS;
        return `model=${model}`
            + `&expand=${expand}`
            + `&filter=${filter}`
            + `&select=${select}`
            + `&orderby=${orderBy}`
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

    public customStatisticsObjToSupplier(statObj: CustomStatisticsResultItem): Supplier {
        const supplier = new Supplier();
        supplier.OrgNumber = statObj.OrgNumber;
        supplier.WebUrl = statObj.WebUrl;
        supplier.Info = new BusinessRelation();
        supplier.Info.Name = statObj.Name;
        supplier.Info.Addresses = [];

        if (statObj.AddressLine1 || statObj.City || statObj.CountryCode || statObj.PostalCode) {

            const address = new Address();
            address.AddressLine1 = statObj.AddressLine1;
            address.PostalCode = statObj.PostalCode;
            address.City = statObj.City;
            address.CountryCode = statObj.CountryCode;

            supplier.Info.InvoiceAddress = address;
            supplier.Info.ShippingAddress = address;

            supplier.Info.Addresses.push(address);
        }

        if (statObj.PhoneNumber) {
            const phone = new Phone();
            phone.Number = statObj.PhoneNumber;
            supplier.Info.DefaultPhone = phone;
        }

        if (statObj.EmailAddress) {
            const mail = new Email();
            mail.EmailAddress = statObj.EmailAddress;
            supplier.Info.DefaultEmail = mail;
        }

        return supplier;
    }

    private getNumberFromStartOfString(str: string): number {
        const match = str.match(/^\d+/);
        return match && +match[0];
    }
}
