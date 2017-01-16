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
import {AppServicesModule} from '../../services/servicesModule';
import {routes as SettingRoutes} from './settingsRoutes';
import {Settings} from './settings';
import {AccountSettings} from './accountSettings/accountSettings';
import {DimensionList} from './accountSettings/dimensionList/dimensionList';
import {AccountList} from './accountSettings/accountList/accountList';
import {AccountDetails} from './accountSettings/accountDetails/accountDetails';
import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {SubEntityDetails} from './agaAndSubEntitySettings/subEntityDetails';
import {SubEntityList} from './agaAndSubEntitySettings/subEntityList';
import {AltinnSettings} from './altinnSettings/altinnSettings';
import {CompanySettingsComponent} from './companySettings/companySettings';
import {Users} from './users/users';
import {UserSettings} from './userSettings/userSettings';
import {VatSettings} from './vatsettings/vatsettings';
import {VatTypeDetails} from './vatsettings/vattypedetails/vattypedetails';
import {VatTypeList} from './vatsettings/vattypelist/vatTypeList';
import {GrantsModal, GrantsModalContent} from './agaAndSubEntitySettings/modals/grantsModal';
import {FreeamountModal, FreeamountModalContent} from './agaAndSubEntitySettings/modals/freeamountModal';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // UniTable
        UniTableModule,

        // UniForm
        UniFormModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        // AppServicesModule,

        // Route module
        SettingRoutes
    ],
    declarations: [
        Settings,
        AccountSettings,
        DimensionList,
        AccountList,
        AccountDetails,
        AgaAndSubEntitySettings,
        SubEntityDetails,
        SubEntityList,
        AltinnSettings,
        CompanySettingsComponent,
        Users,
        UserSettings,
        VatSettings,
        VatTypeDetails,
        VatTypeList,
        GrantsModal,
        GrantsModalContent,
        FreeamountModal,
        FreeamountModalContent
    ],
    entryComponents: [
        GrantsModalContent,
        FreeamountModalContent
    ],
    exports: [
        Settings,
        AccountSettings,
        DimensionList,
        AccountList,
        AccountDetails,
        AgaAndSubEntitySettings,
        SubEntityDetails,
        SubEntityList,
        AltinnSettings,
        CompanySettingsComponent,
        Users,
        UserSettings,
        VatSettings,
        VatTypeDetails,
        VatTypeList,
        GrantsModal,
        GrantsModalContent,
        FreeamountModal,
        FreeamountModalContent
    ]
})
export class SettingsModule {
}
