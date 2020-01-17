import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {settingsRoutes} from './settingsRoutes';
import {Settings} from './settings';
import {SettingsService} from './settings-service';

import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {SubEntitySettingsService} from './agaAndSubEntitySettings/services/subEntitySettingsService';
import {SubEntityDetails} from './agaAndSubEntitySettings/subEntityDetails';
import {SubEntityList} from './agaAndSubEntitySettings/subEntityList';
import {CompanySettingsComponent} from './companySettings/companySettings';
import {CompanySettingsViewService} from './companySettings/services/companySettingsViewService';
import {ChangeCompanySettingsPeriodSeriesModal} from './companySettings/ChangeCompanyPeriodSeriesModal';

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
import {EditSubEntityAgaZoneModal} from './agaAndSubEntitySettings/modals/editSubEntityAgaZoneModal';
import {CommonServicesModule} from '../../services/commonServicesModule';

import {ActivateAutobankModal} from './users/activate-autobank-modal/activate-autobank-modal';
import {ResetAutobankPasswordModal} from './users/reset-autobank-password-modal/reset-autobank-password-modal';

import {IntegrationSettings} from './integrationSettings/integrationSettings';
import {EventPlans} from '@app/components/settings/eventPlans/event-plans';
import {EventPlansList} from '@app/components/settings/eventPlans/eventPlansList/event-plans-list';
import {EventPlanDetails} from '@app/components/settings/eventPlans/eventPlanDetails/event-plan-details';


import {
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule
} from '@angular/material';
import {SalaryModule} from '../salary/salary.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(settingsRoutes),
        UniFrameworkModule,
        CommonServicesModule,
        LayoutModule,
        AppCommonModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatSelectModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatTooltipModule,
        SalaryModule,
    ],
    declarations: [
        Settings,
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
        EditSubEntityAgaZoneModal,
        ChangeCompanySettingsPeriodSeriesModal,
        ActivateAutobankModal,
        ResetAutobankPasswordModal,
        UniDimensionModal,
        IntegrationSettings,
        EventPlans,
        EventPlansList,
        EventPlanDetails,
    ],
    entryComponents: [
        GrantModal,
        FreeAmountModal,
        EditSubEntityAgaZoneModal,
        ChangeCompanySettingsPeriodSeriesModal,
        ActivateAutobankModal,
        ResetAutobankPasswordModal,
        UniDimensionModal,
        UniRoleModal,
        InviteUsersModal,
        DistributionPlanModal,
        CustomerListModal
    ],
    exports: [
        RouterModule,
        Settings,

        AgaAndSubEntitySettings,
        SubEntityDetails,
        SubEntityList,
        CompanySettingsComponent,
        UniTerms,
        ChangeCompanySettingsPeriodSeriesModal,
        GrantModal,
        // FreeAmountModal,
        EventPlans,
    ],
    providers: [
        SubEntitySettingsService,
        CompanySettingsViewService,
        SettingsService,
    ]
})
export class SettingsModule {
}
