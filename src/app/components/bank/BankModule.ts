// Angular imports
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTableModule} from 'unitable-ng2/main';
import {AppCommonModule} from '../common/appCommonModule';

// routes
import {bankRoutes} from './bankRoutes';

// specific imports
import {BankComponent} from './bankComponent';
import {PaymentList} from './payments/paymentList';
import {PaymentBatchDetails} from './payments/paymentBatchDetails';
import {PaymentBatches} from './payments/paymentBatches';
import {PaymentRelationsModal, PaymentRelationsTable} from './payments/relationModal';
import {CustomerPaymentBatches} from './payments/customerPaymentBatches';
import {CustomerPaymentBatchDetails} from './payments/customerPaymentBatchDetails';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

@NgModule({
    imports: [
        // Angular modules
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,

        RouterModule.forChild(bankRoutes),

        UniTableModule,
        UniFrameworkModule,

        LayoutModule,
        AppCommonModule,
    ],
    declarations: [
        BankComponent,
        PaymentList,
        PaymentBatches,
        PaymentRelationsModal,
        PaymentRelationsTable,
        PaymentBatchDetails,
        CustomerPaymentBatches,
        CustomerPaymentBatchDetails
    ],
    // entryComponents: [
    //     PaymentRelationsTable
    // ],
    providers: [
        CanDeactivateGuard
    ],
    exports: [
        PaymentList,
        PaymentBatches,
        PaymentBatchDetails
    ]
})
export class BankModule {
}
