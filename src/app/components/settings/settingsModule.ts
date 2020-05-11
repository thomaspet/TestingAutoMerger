import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {settingsRoutes} from './settingsRoutes';
import {SettingsService} from './settings-service';

import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {SubEntitySettingsService} from './agaAndSubEntitySettings/services/subEntitySettingsService';
import {SubEntityDetails} from './agaAndSubEntitySettings/subEntityDetails';
import {SubEntityList} from './agaAndSubEntitySettings/subEntityList';
import {CompanySettingsComponent} from './companySettings/companySettings';
import {CompanySettingsViewService} from './companySettings/services/companySettingsViewService';
import {ChangeCompanySettingsPeriodSeriesModal} from './companySettings/ChangeCompanyPeriodSeriesModal';
import {UniCompanySettingsView} from './companySettings/company-settings';
import {UniBankSettings} from './bank-settings/bank-settings';

import {VatTypeSettingsList} from './accounting-settings/vattype-settings-list/vattype-settings-list';
import {VatTypeSettingsDetails} from './accounting-settings/vattypedetails/vattype-settings-details';
import {VatDeductionSettings} from './accounting-settings/vat-deductions/vat-deduction-settings';

import {
    UserManagement,
    UserDetails,
    UniRoleModal,
    InviteUsersModal,
    RoleTranslationPipe
} from './users';
import {Teams} from './teams/teams';
import {NumberSeries} from './numberSeries/numberSeries';
import {UniTerms} from './terms/terms';
import {UniDistributionSettings} from './distribution/distribution';
import {DistributionPlanModal} from './distribution/distribution-plan-modal';
import {CustomerListModal} from './distribution/customer-list-modal';
import {UniDimensionSettings} from './dimension/dimension';
import {UniDimensionModal} from './dimension/dimensionModal';

import {GrantModal} from './agaAndSubEntitySettings/modals/grantModal';
import {FreeAmountModal} from './agaAndSubEntitySettings/modals/freeamountModal';
import {CommonServicesModule} from '../../services/commonServicesModule';

import {ActivateAutobankModal} from './users/activate-autobank-modal/activate-autobank-modal';
import {ResetAutobankPasswordModal} from './users/reset-autobank-password-modal/reset-autobank-password-modal';

import {IntegrationSettings} from './integrationSettings/integrationSettings';
import {EventPlans} from '@app/components/settings/eventPlans/event-plans';
import {EventPlansList} from '@app/components/settings/eventPlans/eventPlansList/event-plans-list';
import {EventPlanDetails} from '@app/components/settings/eventPlans/eventPlanDetails/event-plan-details';
import {UniCompanyAccountingView} from './accounting-settings/accounting-settings';
import {UniSalesSettingsView} from './sales-settings/sales-settings';
import {SettingsOverview} from './settings-overview/settings-overivew';
import {UniReportSettingsView} from './report/report-setup';
import {VatDeductionSettingsGroupSetupModal} from './accounting-settings/vat-deductions/vatDeductionGroupSetupModal';

@NgModule({
    imports: [
        LibraryImportsModule,
        RouterModule.forChild(settingsRoutes),
        UniFrameworkModule,
        CommonServicesModule,
        LayoutModule,
        AppCommonModule,
    ],
    declarations: [
        AgaAndSubEntitySettings,
        SubEntityDetails,
        SubEntityList,
        CompanySettingsComponent,
        UserManagement,
        UniRoleModal,
        InviteUsersModal,
        UserDetails,
        RoleTranslationPipe,
        Teams,
        NumberSeries,
        UniTerms,
        UniDistributionSettings,
        DistributionPlanModal,
        CustomerListModal,
        UniDimensionSettings,
        GrantModal,
        FreeAmountModal,
        ChangeCompanySettingsPeriodSeriesModal,
        ActivateAutobankModal,
        ResetAutobankPasswordModal,
        UniDimensionModal,
        IntegrationSettings,
        EventPlans,
        EventPlansList,
        EventPlanDetails,
        SettingsOverview,
        UniCompanySettingsView,
        UniCompanyAccountingView,
        UniSalesSettingsView,
        UniReportSettingsView,
        UniBankSettings,
        VatTypeSettingsDetails,
        VatTypeSettingsList,
        VatDeductionSettings,
        VatDeductionSettingsGroupSetupModal
    ],
    providers: [
        SubEntitySettingsService,
        CompanySettingsViewService,
        SettingsService
    ],
    entryComponents: [
        VatDeductionSettingsGroupSetupModal
    ]
})
export class SettingsModule {
}
