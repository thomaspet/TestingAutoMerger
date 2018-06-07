import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
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
import {AltinnSettings} from './altinnSettings/altinnSettings';
import {CompanySettingsComponent} from './companySettings/companySettings';
import {CompanySettingsViewService} from './companySettings/services/companySettingsViewService';
import {ChangeCompanySettingsPeriodSeriesModal} from './companySettings/ChangeCompanyPeriodSeriesModal';

import {Users} from './users/users';
import {Teams} from './teams/teams';
import {UniChangePasswordModal} from './users/changePasswordModal';
import {NumberSeries} from './numberSeries/numberSeries';
import {UniTerms} from './terms/terms';
import {UniBankSettings} from './bank/bankSettings';
import {UniDimensionSettings} from './dimension/dimension';
import {UniDimensionModal} from './dimension/dimensionModal';

import {GrantModal} from './agaAndSubEntitySettings/modals/grantModal';
import {FreeAmountModal} from './agaAndSubEntitySettings/modals/freeamountModal';
import {WebHookSettings} from './webHookSettings/webHookSettings';
import {CommonServicesModule} from '../../services/commonServicesModule';

import {RoleSelector} from './users/roleSelector';
import {UniRegisterBankUserModal} from '@app/components/settings/users/register-bank-user.modal';
import {UniAdminPasswordModal} from '@app/components/settings/users/admin-password.modal';
import {IntegrationSettings} from './integrationSettings/integrationSettings';
import {EventPlans} from '@app/components/settings/eventPlans/event-plans';
import {EventPlansList} from '@app/components/settings/eventPlans/eventPlansList/event-plans-list';
import {EventPlanDetails} from '@app/components/settings/eventPlans/eventPlanDetails/event-plan-details';
import { EventplanService } from '@app/components/settings/eventPlans/eventplan.service';

import {MatSlideToggleModule} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule.forChild(settingsRoutes),
        UniFrameworkModule,
        CommonServicesModule,
        LayoutModule,
        AppCommonModule,
        MatSlideToggleModule
    ],
    declarations: [
        Settings,
        AgaAndSubEntitySettings,
        SubEntityDetails,
        SubEntityList,
        AltinnSettings,
        CompanySettingsComponent,
        Users,
        Teams,
        NumberSeries,
        UniTerms,
        UniBankSettings,
        UniDimensionSettings,
        GrantModal,
        FreeAmountModal,
        ChangeCompanySettingsPeriodSeriesModal,
        WebHookSettings,
        RoleSelector,
        UniRegisterBankUserModal,
        UniAdminPasswordModal,
        UniDimensionModal,
        UniChangePasswordModal,
        IntegrationSettings,
        EventPlans,
        EventPlansList,
        EventPlanDetails
    ],
    entryComponents: [
        GrantModal,
        FreeAmountModal,
        ChangeCompanySettingsPeriodSeriesModal,
        UniRegisterBankUserModal,
        UniAdminPasswordModal,
        UniDimensionModal,
        UniChangePasswordModal
    ],
    exports: [
        RouterModule,
        Settings,

        AgaAndSubEntitySettings,
        SubEntityDetails,
        SubEntityList,
        AltinnSettings,
        CompanySettingsComponent,
        Users,
        UniTerms,
        UniBankSettings,
        ChangeCompanySettingsPeriodSeriesModal,
        GrantModal,
        // FreeAmountModal,
        RoleSelector,
        EventPlans
    ],
    providers: [
        SubEntitySettingsService,
        CompanySettingsViewService,
        SettingsService,
        EventplanService
    ]
})
export class SettingsModule {
}
