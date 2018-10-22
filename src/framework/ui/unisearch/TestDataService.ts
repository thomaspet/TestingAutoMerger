import {IUniSearchConfig} from './IUniSearchConfig';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';

const SERVICE_DELAY_MS = 500;
const RESULT_LIMIT = 20;
const NUMBER_TO_GENERATE = 50;

@Injectable()
export class TestDataService {

    // This is going to be implemented in UniEconomy
    private COMPANY_NAMES = this.generateCompanyNames(NUMBER_TO_GENERATE);
    public CUSTOMERS = this.COMPANY_NAMES.map((c, i) => this.generateCustomer(c, i));
    public EXTERNAL_CUSTOMERS = this.COMPANY_NAMES.map((c, i) => this.generateExternalSearchCustomer(c, i));
    public STATISTICS_CUSTOMERS = this.COMPANY_NAMES.map((c, i) => this.generateStatisticsCustomer(c, i));

    public getUniversalSearchConfig(clazz: any): IUniSearchConfig {
        return {
            lookupFn: searchTerm => Observable.of(
                this.STATISTICS_CUSTOMERS
                    .filter(customer =>
                        customer.Name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, RESULT_LIMIT)
            )
                .delay(SERVICE_DELAY_MS),
            onSelect: item =>
                item.ID
                    ? Observable.of(this.CUSTOMERS.find(customer => customer.ID === item.ID)).delay(SERVICE_DELAY_MS)
                    : Observable.of(this.externalSearchToCustomerMapper(item)).delay(SERVICE_DELAY_MS),
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Org.Nr', 'Navn', 'Nummer', 'Adr', 'Poststed'],
            rowTemplateFn: item => [
                item.OrgNumber,
                item.Name,
                item.PhoneNumber,
                item.AddressLine1,
                `${item.PostalCode || ''} ${item.City || ''}`
            ],
            inputTemplateFn: item => item.Info && item.Info.Name,
            maxResultsLength: RESULT_LIMIT
        };
    }

    public externalLookupFn(query): Observable<any> {
        return Observable
            .of(this.EXTERNAL_CUSTOMERS)
            .map(results =>
                results
                    .filter(data =>
                        data.Name.toLowerCase().includes(query.toLowerCase())
                    )
                    .slice(0, RESULT_LIMIT)
            )
            .map(results => results.map(result => this.mapExternalSearchToCustomStatisticsObj(result)))
            .delay(SERVICE_DELAY_MS);
    }

    private externalSearchToCustomerMapper(external: any): any {
        return {
            'OrgNumber': external.OrganizationNumber,
            'WebUrl': external.Url,
            'Info': {
                'Name': external.Name,
                'Addresses': [{
                    'AddressLine1': external.Streetaddress,
                    'City': external.City,
                    'CountryCode': external.CountryCode,
                    'PostalCode': external.PostCode
                }],
                'Phones': [{'Number': external.Phone}],
                'Emails': [{'EmailAddress': external.EmailAddress}]
            }
        };
    }

    private mapExternalSearchToCustomStatisticsObj(businessRelationSearch: any): any {
        return {
            ID: undefined,
            OrgNumber: businessRelationSearch.OrganizationNumber,
            Name: businessRelationSearch.Name,
            PhoneNumber: businessRelationSearch.Phone,
            AddressLine1: businessRelationSearch.Streetaddress,
            PostalCode: businessRelationSearch.PostCode,
            City: businessRelationSearch.City
        };
    }

    private generateCompanyNames(numberOfCompanies: number) {
        const prefix = ['Farestveit','Gunnars','Peders','Tines','Franks','Oles','Frodes','Knuts','Siris','Arves'];
        const occupation = ['Mureting', 'Roting', 'Ryddelag','Vaskelag','Knusegruppe','Klappelag','Hattelag','Fisk'];
        const category = ['AS','Inc','ANS','AS','ASA','BA','BL','DA','Etat','FKF','KF','HF','IKS','NUF','RHF','SF'];

        var companies = [];
        for (var i = 0; i < numberOfCompanies; i++) {
            companies.push(
                prefix[this.rand(prefix.length)]
                + ' '
                + occupation[this.rand(occupation.length)]
                + ' '
                + category[this.rand(category.length)]
            );
        }
        return companies;
    }

    private generateCustomer(companyName: string, index: number) {
        return {
            'ID': index,
            'OrgNumber': this.rand(999999999),
            'WebUrl': 'example' + index + '.com',
            'Info': {
                'Name': companyName,
                'Addresses': [
                    {
                        'AddressLine1': 'Address ' + index,
                        'BusinessRelationID': 427,
                        'City': 'City ' + index,
                        'CountryCode': this.rand(99),
                        'PostalCode': this.rand(9999),
                    }
                ],
                'Phones': [{'Number': this.rand(99999999),}],
                'Emails': [{'EmailAddress': index + '@example.com',}]
            }
        }
    }

    private generateStatisticsCustomer(companyName: string, index: number) {
        return {
            'ID': index,
            'Name': companyName,
            'OrgNumber': this.rand(999999999),
            'PhoneNumber': this.rand(99999999),
            'AddressLine1': 'Address ' + index,
            'PostalCode': this.rand(9999),
            'City': 'City ' + index
        };
    }

    private generateExternalSearchCustomer(companyName: string, index: number) {
        return {
            'Source': this.rand(9999),
            'SourceId': this.rand(9999999) + ':0',
            'Name': companyName,
            'Phone': this.rand(99999999),
            'Streetaddress': 'Address ' + index,
            'PostCode': this.rand(9999),
            'City': 'City ' + index,
            'CountryCode': this.rand(99),
            'EmailAddress': index + '@example.com',
            'MuncipalNumber': this.rand(9999),
            'OrganizationNumber': this.rand(999999999),
            'Url': 'example' + index + '.com',
        };
    }

    private rand(length: number) {
        return Math.floor(Math.random() * length);
    }
}
