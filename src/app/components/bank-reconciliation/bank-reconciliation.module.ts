
import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {BankReconciliation} from './bank-reconciliation';
import {BankStatementEntries, FilterPipe} from './bank-statement-entries/bank-statement-entries';
import {MonthPicker} from './month-picker/month-picker';
import {BankStatementUploadModal} from './bank-statement-upload-modal/bank-statement-upload-modal';
import {BankStatementJournalModal} from './bank-statement-journal/bank-statement-journal-modal';
import {ClosedReconciliations} from './closed-reconciliations/closed-reconciliations';
import {BankFileEditor} from './bank-statement-upload-modal/bank-file-editor';
import {BankStatementSettings} from './bank-statement-settings/bank-statement-settings';
import {BankStatementRulesModal} from './bank-statement-rules/bank-statement-rules';
import {QueryBuilder, QueryBuilderItem} from './bank-statement-rules/query-builder/query-builder';
import {UnsavedAttachmentsModal} from './bank-statement-journal/unsaved-journal-modal/unsaved-attachments-modal';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        AppCommonModule,
    ],
    declarations: [
        BankReconciliation,
        BankStatementEntries,
        FilterPipe,
        MonthPicker,
        BankStatementUploadModal,
        BankStatementJournalModal,
        UnsavedAttachmentsModal,
        BankFileEditor,
        ClosedReconciliations,
        BankStatementSettings,
        BankStatementRulesModal,
        QueryBuilder,
        QueryBuilderItem,
    ],
})
export class BankReconciliationModule {}
