import {NgModule, ModuleWithProviders} from '@angular/core';
import {IDPortenAuthenticationService} from './common/idPortenAuthService';
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
import {ProjectTaskService} from './common/projectTaskService';
import {SubEntityService} from './common/subEntityService';
import {UserService} from './common/userService';
import {VatReportFormService} from './common/vatReportFormService';
import {StatisticsService} from './common/statisticsService';
import {UniQueryDefinitionService} from './common/uniQueryDefinitionService';
import {UniTickerService} from './common/uniTickerService';
import {CountryService} from './common/countryService';
import {PostalCodeService} from './common/postalCodeService';
import {NumberFormat} from './common/numberFormatService';
import {StatusService} from './common/statusService';
import {CompanyService} from './common/companyService';
import {ErrorService} from './common/errorService';
import {PageStateService} from './common/pageStateService';
import {FileService} from './common/fileService';
import {EHFService} from './common/EHFService';
import {AgaZoneService} from './common/agaZoneService';
import {AgaSumService} from './common/agaSumService';
import {MunicipalService} from './common/municipalsService';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {UniCacheService} from './common/cacheService';
import {DimensionService} from './common/dimensionService';
import {EmailService} from './common/emailService';
import {UmhService} from './common/UmhService';
import {UniSearchAccountConfig} from './common/uniSearchConfig/uniSearchAccountConfig';
import {UniSearchCustomerConfig} from './common/uniSearchConfig/uniSearchCustomerConfig';
import {UniSearchDimensionConfig} from './common/uniSearchConfig/uniSearchDimensionConfig';
import {UniSearchSupplierConfig} from './common/uniSearchConfig/uniSearchSupplierConfig';
import {UniSearchEmployeeConfig} from './common/uniSearchConfig/uniSearchEmployeeConfig';
import {UniSearchProductConfig} from './common/uniSearchConfig/uniSearchProductConfig';
import {CurrencyOverridesService} from './common/currencyOverridesService';
import {ApiModelService} from './common/apiModelService';
import {Lookupservice} from './common/lookupService';
import {AgreementService} from './common/agreementService';
import {ModulusService} from './common/modulusService';
import {TransitionService} from './common/transitionService';
import {PredefinedDescriptionService} from './common/PredefinedDescriptionService';
import {NumberSeriesService} from './common/numberSeriesService';
import {NumberSeriesTypeService} from './common/numberSeriesTypeService';
import {NumberSeriesTaskService} from './common/numberSeriesTaskService';
import {ProductCategoryService} from './common/productCategoryService';
import {TeamService} from './common/teamService';
import {TermsService} from './common/termsService';
import {UniFilesService} from './common/uniFilesService';
import {ValidationService} from './common/validationService';
import {DimensionSettingsService} from './common/dimensionSettingsService';
import {CustomDimensionService} from './common/customDimensionService';
import {ApiKeyService} from './common/apikeyService';
import {DistributionPlanService} from './common/distributionService';
import {AccrualService} from './common/accrualService';
import {UserRoleService} from './common/userRoleService';
import {EventplanService} from './common/eventplan.service';
import {ApprovalRuleService} from './common/approvalRuleService';
import {ApprovalSubstituteService} from './common/approvalSubstituteService';
import {UniTranslationService} from './common/translationService';
import {InitService} from './common/initService';
import {AssetsService} from './common/assetsService';
import { TaxReportService } from './common/taxReportService';

export * from './common/idPortenAuthService';
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
export * from './common/projectTaskService';
export * from './common/subEntityService';
export * from './common/userService';
export * from './common/vatReportFormService';
export * from './common/statisticsService';
export * from './common/uniQueryDefinitionService';
export * from './common/uniTickerService';
export * from './common/countryService';
export * from './common/postalCodeService';
export * from './common/numberFormatService';
export * from './common/statusService';
export * from './common/companyService';
export * from './common/errorService';
export * from './common/pageStateService';
export * from './common/fileService';
export * from './common/EHFService';
export * from './common/agaZoneService';
export * from './common/agaSumService';
export * from './common/municipalsService';
export * from '../../framework/core/browserStorageService';
export * from './common/cacheService';
export * from './common/dimensionService';
export * from './common/emailService';
export * from './common/currencyOverridesService';
export * from './common/apiModelService';
export * from './common/lookupService';
export * from './common/agreementService';
export * from './common/modulusService';
export * from './common/transitionService';
export * from './common/PredefinedDescriptionService';
export * from './common/numberSeriesService';
export * from './common/numberSeriesTypeService';
export * from './common/numberSeriesTaskService';
export * from './common/productCategoryService';
export * from './common/teamService';
export * from './common/termsService';
export * from './common/uniFilesService';
export * from './common/validationService';
export * from './common/uniSearchConfig/uniSearchAccountConfig';
export * from './common/uniSearchConfig/uniSearchDimensionConfig';
export * from './common/uniSearchConfig/uniSearchCustomerConfig';
export * from './common/uniSearchConfig/uniSearchEmployeeConfig';
export * from './common/uniSearchConfig/uniSearchSupplierConfig';
export * from './common/uniSearchConfig/uniSearchProductConfig';
export * from './common/dimensionSettingsService';
export * from './common/customDimensionService';
export * from './common/apikeyService';
export * from './common/distributionService';
export * from './common/userRoleService';
export * from './common/eventplan.service';
export * from './common/accrualService';
export * from './common/approvalRuleService';
export * from './common/approvalSubstituteService';
export * from './common/translationService';
export * from './common/initService';
export * from  './common/assetsService';

@NgModule({})
export class CommonServicesModule {
    static forRoot(): ModuleWithProviders<CommonServicesModule> {
        return {
            ngModule: CommonServicesModule,
            providers: [
                ErrorService,
                ApprovalRuleService,
                ApprovalSubstituteService,
                IDPortenAuthenticationService,
                AltinnAuthenticationService,
                AltinnIntegrationService,
                AltinnReceiptService,
                TaxReportService,
                CompanySettingsService,
                CompanyTypeService,
                ContactService,
                CurrencyService,
                DepartmentService,
                GuidService,
                IntegrationServerCaller,
                ProductService,
                ProjectService,
                ProjectTaskService,
                SubEntityService,
                UserService,
                VatReportFormService,
                UniQueryDefinitionService,
                StatisticsService,
                CountryService,
                PostalCodeService,
                NumberFormat,
                StatusService,
                CompanyService,
                PageStateService,
                FileService,
                EHFService,
                AgaZoneService,
                AgaSumService,
                MunicipalService,
                BrowserStorageService,
                UniCacheService,
                DimensionService,
                EmailService,
                UmhService,
                UniSearchAccountConfig,
                UniSearchCustomerConfig,
                UniSearchSupplierConfig,
                UniSearchEmployeeConfig,
                UniSearchProductConfig,
                UniSearchDimensionConfig,
                CurrencyOverridesService,
                CurrencyCodeService,
                UniTickerService,
                ApiModelService,
                Lookupservice,
                AgreementService,
                ModulusService,
                TransitionService,
                PredefinedDescriptionService,
                NumberSeriesService,
                NumberSeriesTypeService,
                NumberSeriesTaskService,
                ProductCategoryService,
                TeamService,
                TermsService,
                UniFilesService,
                ValidationService,
                DimensionSettingsService,
                CustomDimensionService,
                ApiKeyService,
                DistributionPlanService,
                AccrualService,
                UserRoleService,
                EventplanService,
                UniTranslationService,
                InitService,
                AssetsService
            ]
        };
    }
}
