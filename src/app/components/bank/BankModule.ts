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
import {AppServicesModule} from '../../services/servicesModule';

// routes
import {routes as BankRoutes} from './bankRoutes';

// specific imports
import {BankComponent} from './bankComponent';
import {PaymentList} from './payments/paymentList';
import {PaymentBatchDetails} from './payments/paymentBatchDetails';
import {PaymentBatches} from './payments/paymentBatches';
import {PaymentRelationsModal, PaymentRelationsTable} from './payments/relationModal';

@NgModule({
    imports: [
        // Angular modules
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // UniTable
        UniTableModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        // AppServicesModule,

        // Route module
        BankRoutes

    ],
    declarations: [
        BankComponent,
        PaymentList,
        PaymentBatches,
        PaymentRelationsModal,
        PaymentRelationsTable,
        PaymentBatchDetails
    ],
    entryComponents: [
        PaymentRelationsTable
    ],
    providers: [
    ],
    exports: [
        PaymentList,
        PaymentBatches,
        PaymentBatchDetails
    ]
})
export class BankModule {
}
