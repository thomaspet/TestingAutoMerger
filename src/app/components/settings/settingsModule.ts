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

import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {SubEntityDetails} from './agaAndSubEntitySettings/subEntityDetails';
import {SubEntityList} from './agaAndSubEntitySettings/subEntityList';
import {AltinnSettings} from './altinnSettings/altinnSettings';
import {CompanySettingsComponent} from './companySettings/companySettings';
import {Users} from './users/users';
import {Teams} from './teams/teams';
import {UserSettings} from './userSettings/userSettings';
import {NumberSeries} from './numberSeries/numberSeries';
import {UniTerms} from './terms/terms';

import {GrantModal} from './agaAndSubEntitySettings/modals/grantModal';
import {FreeAmountModal} from './agaAndSubEntitySettings/modals/freeAmountModal';
import {WebHookSettings} from './webHookSettings/webHookSettings';
import {CommonServicesModule} from '../../services/commonServicesModule';

import {RoleSelector} from './users/roleSelector';

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
        UserSettings,
        NumberSeries,
        UniTerms,

        GrantModal,
        FreeAmountModal,
        WebHookSettings,
        RoleSelector
    ],
    entryComponents: [
        GrantModal,
        FreeAmountModal
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
        UserSettings,
        UniTerms,

        GrantModal,
        FreeAmountModal,
        RoleSelector
    ]
})
export class SettingsModule {
}
