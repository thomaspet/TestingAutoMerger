import {NgModule, ModuleWithProviders} from '@angular/core';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {ElsaPurchasesService} from '@app/services/elsa/elsaPurchasesService';

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
