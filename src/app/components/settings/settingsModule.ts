import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniTableModule} from '../../../framework/ui/unitable/index';
import {UniFormModule} from '../../../framework/ui/uniform/index';
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

import {GrantsModal, GrantsModalContent} from './agaAndSubEntitySettings/modals/grantsModal';
import {FreeamountModal, FreeamountModalContent} from './agaAndSubEntitySettings/modals/freeamountModal';
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

        UniTableModule,
        UniFormModule,
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

        GrantsModal,
        GrantsModalContent,
        FreeamountModal,
        FreeamountModalContent,
        WebHookSettings,
        RoleSelector
    ],
    entryComponents: [
        GrantsModalContent,
        FreeamountModalContent
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

        GrantsModal,
        GrantsModalContent,
        FreeamountModal,
        FreeamountModalContent,
        RoleSelector
    ]
})
export class SettingsModule {
}
