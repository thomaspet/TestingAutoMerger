import {Injectable} from '@angular/core';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/index';
import {Customer, UniEntity, Account, Supplier, Employee} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {UniSearchCustomerConfigGeneratorHelper} from './uniSearchCustomerConfigGeneratorHelper';
import {UniSearchAccountConfigGeneratorHelper} from './uniSearchAccountConfigGeneratorHelper';
import {UniSearchSupplierConfigGeneratorHelper} from './uniSearchSupplierConfigGeneratorHelper';
import {UniSearchEmployeeConfigGeneratorHelper} from './uniSearchEmployeeConfigGeneratorHelper';

export const MAX_RESULTS = 50;

@Injectable()
export class UniSearchConfigGeneratorService {

    constructor(
        public customerGenerator: UniSearchCustomerConfigGeneratorHelper,
        public supplierGenerator: UniSearchSupplierConfigGeneratorHelper,
        private accountGenerator: UniSearchAccountConfigGeneratorHelper,
        public employeeGenerator: UniSearchEmployeeConfigGeneratorHelper
    ) {}

    public generate(
        classType: UniEntity,
        expands: [string] = null, // This is set in the specific generators
        newItemModalFn?: () => Observable<UniEntity>
    ): IUniSearchConfig {
        switch (classType) {
            case Customer: return this.customerGenerator.generate(expands, newItemModalFn);
            case Supplier: return this.supplierGenerator.generate(expands, newItemModalFn);
            case Account: return this.accountGenerator.generateOnlyMainAccountsConfig(expands, newItemModalFn);
            case Employee: return this.employeeGenerator.generate(expands, newItemModalFn);
        }
    }
}
