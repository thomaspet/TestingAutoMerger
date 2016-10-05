import {NgModule} from '@angular/core';
import {AgaZoneService} from './AgaZoneService';
import {MunicipalService} from './MunicipalsService';



@NgModule({
    providers: [
        AgaZoneService,
        MunicipalService
    ]
})
export class SharedServicesModule { }
