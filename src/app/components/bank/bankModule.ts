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
    MatchCustomerInvoiceManual,
    MatchSubAccountManualModal,
    MatchMainAccountModal
} from './modals';
import {UniBankUserPasswordModal} from '@app/components/bank/modals/bank-user-password.modal';

import {
    MatCheckboxModule
} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        MatCheckboxModule,
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
        MatchCustomerInvoiceManual,
        UniBankUserPasswordModal,
        MatchSubAccountManualModal,
        MatchMainAccountModal
    ],
    entryComponents: [
        UniPaymentEditModal,
        UniAutobankAgreementListModal,
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
