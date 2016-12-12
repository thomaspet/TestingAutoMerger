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
import {StatisticsService} from './StatisticsService';
import {UniQueryDefinitionService} from './UniQueryDefinitionService';
import {CountryService} from './CountryService';
import {PostalCodeService} from './PostalCodeService';
import {UniMenuAim} from './UniMenuAim';
import {NumberFormat} from './NumberFormatService';
import {StatusService} from './StatusService';
import {SettingsService} from './settingsservice';
import {CompanyService} from './CompanyService';
import {ErrorService} from './ErrorService';
import {PageStateService} from './PageStateService';
import {FileService} from './FileService';
import {EHFService} from './EHFService';

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
        VatReportFormService,
        UniQueryDefinitionService,
        StatisticsService,
        CountryService,
        PostalCodeService,
        UniMenuAim,
        NumberFormat,
        StatusService,
        SettingsService,
        CompanyService,
        ErrorService,
        PageStateService,
        FileService,
        EHFService
    ]
})
export class CommonServicesModule {

}

