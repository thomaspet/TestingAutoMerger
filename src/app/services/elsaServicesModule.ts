import {NgModule, ModuleWithProviders} from '@angular/core';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {ElsaPurchaseService} from '@app/services/elsa/elsaPurchasesService';
import {ElsaCustomersService} from '@app/services/elsa/elsaCustomersService';
import {ElsaContractService} from '@app/services/elsa/elsaContractService';
import {ElsaAgreementService} from './elsa/elsaAgreementService';

export * from './elsa/elsaProductService';
export * from './elsa/elsaPurchasesService';
export * from './elsa/elsaCustomersService';
export * from './elsa/elsaContractService';
export * from './elsa/elsaAgreementService';

@NgModule()
export class ElsaServicesModule {
    static forRoot(): ModuleWithProviders<ElsaServicesModule> {
        return {
            ngModule: ElsaServicesModule,
            providers: [
                ElsaProductService,
                ElsaPurchaseService,
                ElsaCustomersService,
                ElsaContractService,
                ElsaAgreementService,
            ]
        };
    }
}
