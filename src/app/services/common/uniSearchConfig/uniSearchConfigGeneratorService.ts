import {Injectable} from '@angular/core';
import {IUniSearchConfig} from 'unisearch-ng2/main';
import {Customer, UniEntity, Account} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {UniSearchCustomerConfigGeneratorHelper} from './uniSearchCustomerConfigGeneratorHelper';
import {UniSearchAccountConfigGeneratorHelper} from './uniSearchAccountConfigGeneratorHelper';


export const MAX_RESULTS = 50;

@Injectable()
export class UniSearchConfigGeneratorService {

    constructor(
        private customerGenerator: UniSearchCustomerConfigGeneratorHelper,
        private accountGenerator: UniSearchAccountConfigGeneratorHelper
    ) {}

    public generate(
        classType: UniEntity,
        expands: [string] = null, // This is set in the specific generators
        newItemModalFn?: () => Observable<UniEntity>
    ): IUniSearchConfig {
        switch (classType) {
            case Customer: return this.customerGenerator.generate(expands, newItemModalFn);
            case Account: return this.accountGenerator.generateOnlyMainAccountsConfig(expands, newItemModalFn);
        }
    }
}
