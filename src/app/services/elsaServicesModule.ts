import {NgModule, ModuleWithProviders} from '@angular/core';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {ElsaPurchaseService} from '@app/services/elsa/elsaPurchasesService';
import {ElsaCustomersService} from '@app/services/elsa/elsaCustomersService';
import {ElsaContractService} from '@app/services/elsa/elsaContractService';

export * from './elsa/elsaProductService';
export * from './elsa/elsaPurchasesService';
export * from './elsa/elsaCustomersService';
export * from './elsa/elsaContractService';

@NgModule()
export class ElsaServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ElsaServicesModule,
            providers: [
                ElsaProductService,
                ElsaPurchaseService,
                ElsaCustomersService,
                ElsaContractService,
            ]
        };
    }
}
