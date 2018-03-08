import {NgModule, ModuleWithProviders} from '@angular/core';
import {ElsaProductService, ElsaPurchasesService} from '@app/services/services';

export * from './elsa/elsaProductService';
export * from './elsa/elsaPurchasesService';

@NgModule()
export class ElsaServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ElsaServicesModule,
            providers: [
                ElsaProductService,
                ElsaPurchasesService,
            ]
        };
    }
}
