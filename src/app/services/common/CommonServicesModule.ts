import {NgModule} from '@angular/core';
import {AltinnAuthenticationService} from './AltinnAuthenticationService';
import {AltinnIntegrationService} from './AltinnIntegrationService';
import {AltinnReceiptService} from './AltinnReceiptService';
import {CompanySettingsService} from './CompanySettingsService';
import {CompanyTypeService} from './CompanyTypeService';
import {CurrencyService} from './CurrencyService';
import {DepartmentService} from './DepartmentService';
import {GuidService} from './guidService';
import {IntegrationServerCaller} from './IntegrationServerCaller';
import {ProductService} from './ProductService';
import {ProjectService} from './ProjectService';
import {SubEntityService} from './SubEntityService';
import {UserService} from './UserService';
import {VatReportFormService} from './VatReportFormService';

@NgModule({
    providers: [
        AltinnAuthenticationService,
        AltinnIntegrationService,
        AltinnReceiptService,
        CompanySettingsService,
        CompanyTypeService,
        CurrencyService,
        DepartmentService,
        GuidService,
        IntegrationServerCaller,
        ProductService,
        ProjectService,
        SubEntityService,
        UserService,
        VatReportFormService
    ]
})
export class CommonServicesModule {

}

