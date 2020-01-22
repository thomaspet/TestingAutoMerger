import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {UniTickerModule} from '../uniticker/uniTickerModule';
import {WidgetModule} from '../widgets/widgetModule';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {BankComponent} from './bankComponent';
import {UniBank} from './bank';
import {bankRoutes} from './bankRoutes';
import {UniBankReconciliationList} from './reconciliation/reconciliation-list/reconciliation-list';
import {UniReconciliationReportView} from './reconciliation/reconciliation-report/reconciliation-report';
import {BankStatement} from './reconciliation/bank-statement/bank-statement';
import {BankReconciliationModule} from '../bank-reconciliation/bank-reconciliation.module';

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
        MatCheckboxModule,
        MatSelectModule,
        RouterModule.forChild(bankRoutes),

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        UniTickerModule,
        WidgetModule,
        BankReconciliationModule
    ],
    declarations: [
        UniBank,
        BankComponent,
        UniBankReconciliationList,
        UniPaymentEditModal,
        UniBankListModal,
        MatchCustomerInvoiceManual,
        UniBankUserPasswordModal,
        MatchSubAccountManualModal,
        MatchMainAccountModal,
        UniReconciliationReportView,
        BankStatement
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