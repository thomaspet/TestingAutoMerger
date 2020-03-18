
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
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
import {BankFileEditor} from './bank-statement-upload-modal/bank-file-editor';
import {BankStatementSettings} from './bank-statement-settings/bank-statement-settings';
import {BankStatementRulesModal} from './bank-statement-rules/bank-statement-rules';
import {QueryBuilder, QueryBuilderItem} from './bank-statement-rules/query-builder/query-builder';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        UniFrameworkModule,
        AppCommonModule,
        AppPipesModule,
    ],
    declarations: [
        BankReconciliation,
        BankStatementEntries,
        FilterPipe,
        MonthPicker,
        BankStatementUploadModal,
        BankStatementJournalModal,
        BankFileEditor,
        ClosedReconciliations,
        BankStatementSettings,
        BankStatementRulesModal,
        QueryBuilder,
        QueryBuilderItem
    ],
    entryComponents: [
        BankStatementUploadModal,
        BankStatementJournalModal,
        BankStatementRulesModal,
        BankFileEditor,
        BankStatementSettings
    ]
})
export class BankReconciliationModule {}
