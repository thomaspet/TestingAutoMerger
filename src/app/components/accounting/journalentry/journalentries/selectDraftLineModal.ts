import {Component, EventEmitter, OnInit} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
} from '@uni-framework/ui/unitable';
import { JournalEntryService, ErrorService } from '@app/services/services';

@Component({
    selector: 'select-draftline-modal',
    template: `
        <section role="dialog" class="uni-modal medium">
            <header>Velg bilagskladd</header>

            <article class='modal-content'>
                <ag-grid-wrapper
                    [resource]="draftLines"
                    [config]="uniTableConfig"
                    (rowSelectionChange)="onRowSelected($event)">
                </ag-grid-wrapper>
            </article>
        </section>
    `
})

export class SelectDraftLineModal implements IUniModal, OnInit {
    options: IModalOptions;
    onClose: EventEmitter<any> = new EventEmitter();

    uniTableConfig: UniTableConfig;
    draftLines: any[];

    constructor(
        private journalEntryService: JournalEntryService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.draftLines = this.options.data || [];
        this.generateUniTableConfig();
    }

    onRowSelected(row) {
        this.onClose.emit(row);
    }

    private generateUniTableConfig() {
        const columns = [
            new UniTableColumn('MinJournalEntryCreatedAt', 'Opprettet', UniTableColumnType.LocalDate),
            new UniTableColumn('userDisplayName', 'Utført av', UniTableColumnType.Text),
            new UniTableColumn('JournalEntryDescription', 'Beskrivelse', UniTableColumnType.Text),
        ];

        const tableName = 'accounting.journalEntry.selectDraftLineModal';
        this.uniTableConfig = new UniTableConfig(tableName, false, true)
            .setColumns(columns)
            .setContextMenu([{
                label: 'Slett kladd',
                action: line => this.deleteLine(line)
            }]);
    }

    private deleteLine(line) {
        this.journalEntryService.deleteJournalEntryDraftGroup(line.JournalEntryDraftGroup).subscribe(
            () => {
                this.draftLines = this.draftLines.filter(l => l.JournalEntryDraftGroup !== line.JournalEntryDraftGroup);
            },
            err => this.errorService.handle(err)
        );
    }
}
