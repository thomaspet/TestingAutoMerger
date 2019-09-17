import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';

import {BankReconciliation} from './bank-reconciliation';
import {BankStatementEntries, FilterPipe} from './bank-statement-entries/bank-statement-entries';
import {AppPipesModule} from '@app/pipes/appPipesModule';
import {MonthPicker} from './month-picker/month-picker';
import {BankStatementUploadModal} from './bank-statement-upload-modal/bank-statement-upload-modal';
import {BankStatementJournalModal} from './bank-statement-journal/bank-statement-journal-modal';
import {ClosedReconciliations} from './closed-reconciliations/closed-reconciliations';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        UniFrameworkModule,
        AppCommonModule,
        AppPipesModule,

        RouterModule.forChild([{
            path: '',
            component: BankReconciliation
        }]),
    ],
    declarations: [
        BankReconciliation,
        BankStatementEntries,
        FilterPipe,
        MonthPicker,
        BankStatementUploadModal,
        BankStatementJournalModal,
        ClosedReconciliations
    ],
    entryComponents: [
        BankStatementUploadModal,
        BankStatementJournalModal,
    ]
})
export class BankReconciliationModule {}
