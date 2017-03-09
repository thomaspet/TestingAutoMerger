import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
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
import {UserSettings} from './userSettings/userSettings';

import {GrantsModal, GrantsModalContent} from './agaAndSubEntitySettings/modals/grantsModal';
import {FreeamountModal, FreeamountModalContent} from './agaAndSubEntitySettings/modals/freeamountModal';
import {WebHookSettings} from './webHookSettings/webHookSettings';
import {CommonServicesModule} from '../../services/commonServicesModule';

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
        UserSettings,

        GrantsModal,
        GrantsModalContent,
        FreeamountModal,
        FreeamountModalContent,
        WebHookSettings
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
        FreeamountModalContent
    ]
})
export class SettingsModule {
}
