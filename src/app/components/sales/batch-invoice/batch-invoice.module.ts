import {NgModule} from '@angular/core';
import {RouterModule, Route} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {AppCommonModule} from '@app/components/common/appCommonModule';

import {BatchInvoiceList} from './batch-invoice-list';
import {NewBatchInvoice} from './new-batch-invoice/new-batch-invoice';
import {BatchInvoiceModal} from './new-batch-invoice/batch-invoice-modal/batch-invoice-modal';
import {BatchInvoiceDetails} from './batch-invoice-details/batch-invoice-details';

const routes: Route[] = [
    { path: '', component: BatchInvoiceList },
    { path: 'new', component: NewBatchInvoice },
];

@NgModule({
    imports: [
        LibraryImportsModule,
        RouterModule.forChild(routes),
        UniFrameworkModule,
        AppCommonModule,
    ],
    declarations: [
        BatchInvoiceList,
        NewBatchInvoice,
        BatchInvoiceModal,
        BatchInvoiceDetails
    ]
})
export class BatchInvoiceModule {}
