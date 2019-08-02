import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
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
    UniBankListModal,
    MatchCustomerInvoiceManual,
    MatchSubAccountManualModal,
    MatchMainAccountModal
} from './modals';
import {UniBankUserPasswordModal} from '@app/components/bank/modals/bank-user-password.modal';

import {
    MatCheckboxModule,
    MatSelectModule
} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatCheckboxModule,
        MatSelectModule,
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
        UniBankListModal,
        MatchCustomerInvoiceManual,
        UniBankUserPasswordModal,
        MatchSubAccountManualModal,
        MatchMainAccountModal
    ],
    entryComponents: [
        UniPaymentEditModal,
        UniBankListModal,
        MatchCustomerInvoiceManual,
        UniBankUserPasswordModal,
        MatchSubAccountManualModal,
        MatchMainAccountModal
    ],
    providers: [
        CanDeactivateGuard
    ]
})
export class BankModule {}
