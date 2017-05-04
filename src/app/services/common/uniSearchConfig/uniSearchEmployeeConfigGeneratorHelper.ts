import {Injectable} from '@angular/core';
import {UniEntity, Employee, BusinessRelation, Address, Phone, Email} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {StatisticsService} from '../statisticsService';
import {EmployeeService} from '../../salary/employee/employeeService';
import {ErrorService} from '../errorService';
import {IntegrationServerCaller} from '../integrationServerCaller';
import {MAX_RESULTS} from './uniSearchConfigGeneratorService';
import {BusinessRelationSearch} from '../../../models/Integration/BusinessRelationSearch';
import {IUniSearchConfig} from 'unisearch-ng2/src/UniSearch/IUniSearchConfig';

class CustomStatisticsResultItem {
    /* tslint:disable */
    public ID: number;
    public Name: string;
    public PhoneNumber: string;
    public AddressLine1: string;
    public PostalCode: string;
    public City: string;
    public CountryCode: string;
    public EmailAddress: string;
}

@Injectable()
export class UniSearchEmployeeConfigGeneratorHelper {

    constructor(
        private statisticsService: StatisticsService,
        private employeeService: EmployeeService,
        private errorService: ErrorService,
        private integrationServerCaller: IntegrationServerCaller
    ) {}

    public generate(
        expands: [string] = ['BusinessRelationInfo.Addresses','BusinessRelationInfo.Phones'],
        newItemModalFn?: () => Observable<UniEntity>
    ): any {
        return {
            lookupFn: searchTerm => this
                .statisticsService
                .GetAllUnwrapped(this.generateEmployeeStatisticsQuery(searchTerm))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            expandOrCreateFn: (newOrExistingItem: CustomStatisticsResultItem) => {
                if (newOrExistingItem.ID) {
                    return this.employeeService.Get(newOrExistingItem.ID, expands)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                } else {
                    return this.employeeService.Post(this.customStatisticsObjToEmployee(newOrExistingItem))
                        .switchMap(item => this.employeeService.Get(item.ID, expands))
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Ansattnr', 'Navn', 'Tlf', 'Adresse', 'Poststed'],
            rowTemplateFn: item => [
                item.EmployeeNumber,
                item.Name,
                item.PhoneNumber,
                item.AddressLine1,
                `${item.PostalCode || ''} ${item.City || ''}`
            ],
            inputTemplateFn: item => `${item.EmployeeNumber || ''}${item.BusinessRelationInfo && item.BusinessRelationInfo.Name ? ' ' + item.BusinessRelationInfo.Name : ''}`,
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

    private generateEmployeeStatisticsQuery(searchTerm: string): string {
        const model = 'Employee';
        const expand = 'BusinessRelationInfo.DefaultPhone,BusinessRelationInfo.InvoiceAddress,BusinessRelationInfo.DefaultEmail,BusinessRelationInfo.Phones';
        const startNumber = this.getNumberFromStartOfString(searchTerm);
        let filter = `contains(BusinessRelationInfo.Name,'${searchTerm}')`;
        let orderBy = 'BusinessRelationInfo.Name';
        if (startNumber) {
            filter = ['Employee.EmployeeNumber', 'Phones.Number']
                .map(x => `startswith(${x},'${startNumber}')`).join(' or ');
            orderBy = 'Employee.EmployeeNumber';
        }
        const select = [
            'Employee.ID as ID',
            'BusinessRelationInfo.Name as Name',
            'DefaultPhone.Number as PhoneNumber',
            'InvoiceAddress.AddressLine1 as AddressLine1',
            'InvoiceAddress.PostalCode as PostalCode',
            'InvoiceAddress.City as City',
            'InvoiceAddress.CountryCode as CountryCode',
            'DefaultEmail.EmailAddress as EmailAddress',
            'Employee.EmployeeNumber as EmployeeNumber'
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
            Name: businessRelationSearch.Name,
            PhoneNumber: businessRelationSearch.Phone,
            AddressLine1: businessRelationSearch.Streetaddress,
            PostalCode: businessRelationSearch.PostCode,
            City: businessRelationSearch.City,
            CountryCode: businessRelationSearch.CountryCode,
            EmailAddress: businessRelationSearch.EmailAddress,
        };
    }

    public customStatisticsObjToEmployee(statObj: CustomStatisticsResultItem): Employee {
        const employee = new Employee();
        employee.BusinessRelationInfo = new BusinessRelation();
        employee.BusinessRelationInfo.Name = statObj.Name;
        employee.BusinessRelationInfo.Addresses = [];
        employee.BusinessRelationInfo.Phones = [];
        employee.BusinessRelationInfo.Emails = [];

        if (statObj.AddressLine1 || statObj.City || statObj.CountryCode || statObj.PostalCode) {

            const address = new Address();
            address.AddressLine1 = statObj.AddressLine1;
            address.PostalCode = statObj.PostalCode;
            address.City = statObj.City;
            address.CountryCode = statObj.CountryCode;

            employee.BusinessRelationInfo.InvoiceAddress = address;
            employee.BusinessRelationInfo.ShippingAddress = address;

            employee.BusinessRelationInfo.Addresses.push(address);
        }

        if (statObj.PhoneNumber) {
            const phone = new Phone();
            phone.Number = statObj.PhoneNumber;
            employee.BusinessRelationInfo.DefaultPhone = phone;

            employee.BusinessRelationInfo.Phones.push(phone);
        }

        if (statObj.EmailAddress) {
            const mail = new Email();
            mail.EmailAddress = statObj.EmailAddress;
            employee.BusinessRelationInfo.DefaultEmail = mail;

            employee.BusinessRelationInfo.Emails.push(mail);
        }

        return employee;
    }

    private getNumberFromStartOfString(str: string): number {
        const match = str.match(/^\d+/);
        return match && +match[0];
    }
}
