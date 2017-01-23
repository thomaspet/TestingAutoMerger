import {Injectable} from '@angular/core';
import {IUniSearchConfig} from 'unisearch-ng2/main';
import {Customer, Address} from '../../unientities';
import {BehaviorSubject, Observable} from 'rxjs/Rx';
import {CustomerService} from '../Sales/CustomerService';
import {ErrorService} from './errorService';

@Injectable()
export class UniSearchConfigGeneratorService {

    constructor(private customerService: CustomerService) {}

    public generateUniSearchConfig(
        classType: any,
        expands: [string] = ['Info.Addresses'],
        newItemModalFn?: () => Observable<any>
    ): IUniSearchConfig {
        switch (classType) {
            case Customer: return {
                lookupFn: searchTerm => this
                    .customerService
                    .GetAll('filter='
                        + `contains(Info.Name,'${searchTerm}')`
                        + ` or startswith(CustomerNumber,'${searchTerm}')`
                        + '&top=30'
                        + '&orderby=Info.Name',
                        expands
                    ),
                initialItem$: new BehaviorSubject(null),
                tableHeader: ['Nr', 'Navn', 'Adresse', 'Poststed'],
                rowTemplateFn: item => [
                    item.CustomerNumber,
                    item.Info && item.Info.Name,
                    item.Info && item.Info.Addresses && item.Info.Addresses[0] && item.Info.Addresses[0].AddressLine1,
                    this.getFirstPostalAndCity(item.Info && item.Info.Addresses)
                ],
                inputTemplateFn: item => item.Info && item.Info.Name,
                newItemModalFn: newItemModalFn
            };
        }
    }

    private getFirstPostalAndCity(addresses: [Address]): string {
        if (addresses && addresses[0]) {
            return `${addresses[0].PostalCode} ${addresses[0].City}`;
        }
        return '';
    }
}
