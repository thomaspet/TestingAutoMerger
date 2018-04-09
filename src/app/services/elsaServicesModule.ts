import {NgModule, ModuleWithProviders} from '@angular/core';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {ElsaPurchaseService} from '@app/services/elsa/elsaPurchasesService';
import {ElsaCompanyLicenseService} from '@app/services/elsa/elsaCompanyLicenseService';

export * from './elsa/elsaProductService';
export * from './elsa/elsaPurchasesService';

@NgModule()
export class ElsaServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ElsaServicesModule,
            providers: [
                ElsaProductService,
                ElsaPurchaseService,
                ElsaCompanyLicenseService,
            ]
        };
    }
}
