import { NgModule, ModuleWithProviders } from '@angular/core';
import { ImportCentralService } from './import-central/importCentralService';

export * from './import-central/importCentralService'

@NgModule()
export class ImportCentralServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ImportCentralServicesModule,
            providers: [
                ImportCentralService
            ]
        };
    }
}
