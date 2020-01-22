import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCheckboxModule} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {RouterModule, Route} from '@angular/router';

import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {AppCommonModule} from '@app/components/common/appCommonModule';

import {BatchInvoiceList} from './batch-invoice-list';
import {NewBatchInvoice} from './new-batch-invoice/new-batch-invoice';
import {BatchInvoiceModal} from './new-batch-invoice/batch-invoice-modal/batch-invoice-modal';
import {AppPipesModule} from '@app/pipes/appPipesModule';
import {BatchInvoiceDetails} from './batch-invoice-details/batch-invoice-details';

const routes: Route[] = [
    { path: '', component: BatchInvoiceList },
    { path: 'new', component: NewBatchInvoice },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatCheckboxModule,
        RouterModule.forChild(routes),
        UniFrameworkModule,
        AppCommonModule,
        AppPipesModule,
    ],
    declarations: [
        BatchInvoiceList,
        NewBatchInvoice,
        BatchInvoiceModal,
        BatchInvoiceDetails
    ],
    entryComponents: [BatchInvoiceModal]
})
export class BatchInvoiceModule {}
