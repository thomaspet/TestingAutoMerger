import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {UniTickerModule} from '../uniticker/uniTickerModule';
import {WidgetModule} from '../widgets/widgetModule';

import {BankComponent} from './bankComponent';
import {UniBank} from './bank';
import {bankRoutes} from './bankRoutes';
import {UniBankReconciliationList} from './reconciliation/reconciliation-list/reconciliation-list';
import {UniReconciliationReportView} from './reconciliation/reconciliation-report/reconciliation-report';
import {BankStatement} from './reconciliation/bank-statement/bank-statement';
import {BankReconciliationModule} from '../bank-reconciliation/bank-reconciliation.module';
import {BankStatmentElementsModal} from '../bank/reconciliation/bank-statement/bank-statement-elements-modal';
import {
    UniPaymentEditModal,
    UniBankListModal,
    MatchCustomerInvoiceManual,
    MatchSubAccountManualModal,
    MatchMainAccountModal,
    UniBankUserPasswordModal
} from './modals';

@NgModule({
    imports: [
        LibraryImportsModule,
        RouterModule.forChild(bankRoutes),

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
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
        BankStatement,
        BankStatmentElementsModal
    ],
    providers: [
        MatchMainAccountModal
    ]
})
export class BankModule {}
