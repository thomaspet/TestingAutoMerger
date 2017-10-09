import {Injectable} from '@angular/core';
import {UniEntity, Supplier, BusinessRelation, Address, Phone, Email} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {StatisticsService} from '../statisticsService';
import {SupplierService} from '../../accounting/supplierService';
import {GuidService} from '../guidService';
import {ErrorService} from '../errorService';
import {IntegrationServerCaller} from '../integrationServerCaller';
import {BusinessRelationSearch} from '../../../models/Integration/BusinessRelationSearch';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/IUniSearchConfig';

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
export class UniSearchSupplierConfig {

    constructor(
        private statisticsService: StatisticsService,
        private supplierService: SupplierService,
        private errorService: ErrorService,
        private integrationServerCaller: IntegrationServerCaller,
        private guidService: GuidService
    ) {}

    public generate(
        expands: string[] = ['Info.Addresses'],
        newItemModalFn?: (inputValue?: string) => Observable<UniEntity>
    ): IUniSearchConfig {
        return <IUniSearchConfig>{
            lookupFn: searchTerm => this.statisticsService
                .GetAllUnwrapped(this.generateSupplierStatisticsQuery(searchTerm))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            onSelect: (selectedItem: CustomStatisticsResultItem) => {
                if (!selectedItem) {
                    return Observable.empty();
                }

                if (selectedItem.ID) {
                    return this.supplierService.Get(selectedItem.ID, expands)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                } else {
                    return this.supplierService.Post(this.customStatisticsObjToSupplier(selectedItem))
                        .switchMap(item => this.supplierService.Get(item.ID, expands))
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Leverandørnr', 'Navn', 'Tlf', 'Adresse', 'Poststed', 'Org.Nr'],
            rowTemplateFn: item => [
                item.SupplierNumber,
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

    public generateDoNotCreateNew(
        expands: string[] = ['Info.Addresses'],
        newItemModalFn?: (inputValue?: string) => Observable<UniEntity>
    ): IUniSearchConfig {
        return <IUniSearchConfig> {
            lookupFn: searchTerm => this.statisticsService
                .GetAllUnwrapped(this.generateSupplierStatisticsQuery(searchTerm))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            onSelect: (selectedItem: CustomStatisticsResultItem) => {
                if (selectedItem.ID) {
                    return this.supplierService.Get(selectedItem.ID, expands)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                } else {
                    const it = this.customStatisticsObjToSupplier(selectedItem);
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
            tableHeader: ['Leverandørnr', 'Navn', 'Tlf', 'Adresse', 'Poststed', 'Org.Nr'],
            rowTemplateFn: item => [
                item.SupplierNumber,
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
        const expand = 'Info.DefaultPhone,Info.InvoiceAddress,Info.DefaultEmail,Info.Phones';
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
            'DefaultPhone.Number as PhoneNumber',
            'InvoiceAddress.AddressLine1 as AddressLine1',
            'InvoiceAddress.PostalCode as PostalCode',
            'InvoiceAddress.City as City',
            'InvoiceAddress.CountryCode as CountryCode',
            'DefaultEmail.EmailAddress as EmailAddress',
            'Supplier.WebUrl as WebUrl'
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

    public customStatisticsObjToSupplier(statObj: CustomStatisticsResultItem): Supplier {
        const supplier = new Supplier();
        supplier.ID = 0;
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
