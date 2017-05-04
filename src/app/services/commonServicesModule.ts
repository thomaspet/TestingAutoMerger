import {NgModule, ModuleWithProviders} from '@angular/core';
import {AltinnAuthenticationService} from './common/altinnAuthenticationService';
import {AltinnIntegrationService} from './common/altinnIntegrationService';
import {AltinnReceiptService} from './common/altinnReceiptService';
import {CompanySettingsService} from './common/companySettingsService';
import {CompanyTypeService} from './common/companyTypeService';
import {CurrencyService} from './common/currencyService';
import {ContactService} from './common/contactService';
import {CurrencyCodeService} from './common/currencyCodeService';
import {DepartmentService} from './common/departmentService';
import {GuidService} from './common/guidService';
import {IntegrationServerCaller} from './common/integrationServerCaller';
import {ProductService} from './common/productService';
import {ProjectService} from './common/projectService';
import {SubEntityService} from './common/subEntityService';
import {UserService} from './common/userService';
import {VatReportFormService} from './common/vatReportFormService';
import {StatisticsService} from './common/statisticsService';
import {UniQueryDefinitionService} from './common/uniQueryDefinitionService';
import {UniTickerService} from './common/uniTickerService';
import {CountryService} from './common/countryService';
import {PostalCodeService} from './common/postalCodeService';
import {UniMenuAim} from './common/uniMenuAim';
import {NumberFormat} from './common/numberFormatService';
import {StatusService} from './common/statusService';
import {SettingsService} from './common/settingsService';
import {CompanyService} from './common/companyService';
import {ErrorService} from './common/errorService';
import {PageStateService} from './common/pageStateService';
import {FileService} from './common/fileService';
import {EHFService} from './common/EHFService';
import {AgaZoneService} from './common/agaZoneService';
import {MunicipalService} from './common/municipalsService';
import {BrowserStorageService} from './common/browserStorageService';
import {UniCacheService} from './common/cacheService';
import {StaticRegisterService} from './common/staticRegisterService';
import {DimensionService} from './common/dimensionService';
import {EmailService} from './common/emailService';
import {UniSearchConfigGeneratorService} from './common/uniSearchConfig/uniSearchConfigGeneratorService';
import {UmhService} from './common/UmhService';
import {UniSearchAccountConfigGeneratorHelper} from './common/uniSearchConfig/uniSearchAccountConfigGeneratorHelper';
import {UniSearchCustomerConfigGeneratorHelper} from './common/uniSearchConfig/uniSearchCustomerConfigGeneratorHelper';
import {UniSearchSupplierConfigGeneratorHelper} from './common/uniSearchConfig/uniSearchSupplierConfigGeneratorHelper';
import {UniSearchEmployeeConfigGeneratorHelper} from './common/uniSearchConfig/uniSearchEmployeeConfigGeneratorHelper';
import {CurrencyOverridesService} from './common/currencyOverridesService';
import {ApiModelService} from './common/apiModelService';
import {YearService} from './common/yearService';
import {Lookupservice} from './common/lookupService';
import {AgreementService} from './common/agreementService';

export * from './common/altinnAuthenticationService';
export * from './common/altinnIntegrationService';
export * from './common/altinnReceiptService';
export * from './common/companySettingsService';
export * from './common/companyTypeService';
export * from './common/contactService';
export * from './common/currencyCodeService';
export * from './common/currencyService';
export * from './common/departmentService';
export * from './common/guidService';
export * from './common/integrationServerCaller';
export * from './common/productService';
export * from './common/projectService';
export * from './common/subEntityService';
export * from './common/userService';
export * from './common/vatReportFormService';
export * from './common/statisticsService';
export * from './common/uniQueryDefinitionService';
export * from './common/uniTickerService';
export * from './common/countryService';
export * from './common/postalCodeService';
export * from './common/uniMenuAim';
export * from './common/numberFormatService';
export * from './common/statusService';
export * from './common/settingsService';
export * from './common/companyService';
export * from './common/errorService';
export * from './common/pageStateService';
export * from './common/fileService';
export * from './common/EHFService';
export * from './common/agaZoneService';
export * from './common/municipalsService';
export * from './common/browserStorageService';
export * from './common/cacheService';
export * from './common/staticRegisterService';
export * from './common/dimensionService';
export * from './common/emailService';
export * from './common/uniSearchConfig/uniSearchConfigGeneratorService';
export * from './common/currencyOverridesService';
export * from './common/apiModelService';
export * from './common/yearService';
export * from './common/lookupService';
export * from './common/agreementService';

@NgModule({})
export class CommonServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CommonServicesModule,
            providers: [
                ErrorService,
                AltinnAuthenticationService,
                AltinnIntegrationService,
                AltinnReceiptService,
                CompanySettingsService,
                CompanyTypeService,
                ContactService,
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
                PageStateService,
                FileService,
                EHFService,
                AgaZoneService,
                MunicipalService,
                BrowserStorageService,
                UniCacheService,
                StaticRegisterService,
                DimensionService,
                EmailService,
                UmhService,
                UniSearchConfigGeneratorService,
                UniSearchAccountConfigGeneratorHelper,
                UniSearchCustomerConfigGeneratorHelper,
                UniSearchSupplierConfigGeneratorHelper,
                UniSearchEmployeeConfigGeneratorHelper,
                CurrencyOverridesService,
                CurrencyCodeService,
                UniTickerService,
                ApiModelService,
                YearService,
                Lookupservice,
                AgreementService
            ]
        };
    }
}

