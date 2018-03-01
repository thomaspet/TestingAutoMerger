import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {UniTickerModule} from '../uniticker/uniTickerModule';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {BankComponent} from './bankComponent';
import {bankRoutes} from './bankRoutes';

import {
    UniPaymentEditModal,
    UniAutobankAgreementListModal,
    UniAutobankAgreementModal,
    UniAgreementWarningModal
} from './modals';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,

        RouterModule.forChild(bankRoutes),

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        UniTickerModule
    ],
    declarations: [
        BankComponent,
        UniPaymentEditModal,
        UniAutobankAgreementListModal,
        UniAutobankAgreementModal,
        UniAgreementWarningModal
    ],
    entryComponents: [
        UniPaymentEditModal,
        UniAutobankAgreementListModal,
        UniAutobankAgreementModal,
        UniAgreementWarningModal
    ],
    providers: [
        CanDeactivateGuard
    ]
})
export class BankModule {}
