import { NgModule, ModuleWithProviders } from '@angular/core';
import { ImportCentralService } from './import-central/importCentralService';

export * from './import-central/importCentralService'

@NgModule()
export class ImportCentralServicesModule {
    static forRoot(): ModuleWithProviders<ImportCentralServicesModule> {
        return {
            ngModule: ImportCentralServicesModule,
            providers: [
                ImportCentralService
            ]
        };
    }
}
