import {NgModule, ModuleWithProviders} from '@angular/core';
import {CelebrusService} from './celebrus-service';

export * from './celebrus-service';

@NgModule()
export class TrackingServicesModule {
    static forRoot(): ModuleWithProviders<TrackingServicesModule> {
        return {
            ngModule: TrackingServicesModule,
            providers: [ CelebrusService ]
        };
    }
}
