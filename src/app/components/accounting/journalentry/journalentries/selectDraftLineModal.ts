import {Component, Input, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uniModal/barrel';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
    IContextMenuItem,
} from '../../../../../framework/ui/unitable/index';
import { JournalEntryService } from '@app/services/services';

@Component({
    selector: 'select-draftline-modal',
    template: `
        <section
            role="dialog"
            class="uni-modal"
            style="width: 70vw"
            (clickOutside)="close()"
            (keydown.esc)="close()">

            <header><h1>Velg bilagskladd</h1></header>
            <article class='modal-content' *ngIf="config">
                <uni-table
                    [resource]="config.draftLines"
                    [config]="uniTableConfig"
                    (rowSelected)="close($event)">
                </uni-table>
            </article>
        </section>
    `
})

export class SelectDraftLineModal implements IUniModal, OnInit {
    @ViewChild(UniTable)
    public unitable: UniTable;

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public uniTableConfig: UniTableConfig;
    public config: any = {};

    constructor(private journalEntryService: JournalEntryService) {}

    public ngOnInit() {
        this.config = {
            hasCancelButton: false,
            draftLines: this.options.data.draftLines,
            class: 'good'
        };

        this.generateUniTableConfig();
    }

    private generateUniTableConfig() {
        const columns = [
            new UniTableColumn('CreatedAt', 'Opprettet', UniTableColumnType.LocalDate),
            new UniTableColumn('userDisplayName', 'Utført av', UniTableColumnType.Text),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text),
        ];

        const contextMenuItem: IContextMenuItem[] = [
            {
                action: (item) => this.deleteLine(item),
                label: 'Slett linje'
            }
        ];

        const tableName = 'accounting.journalEntry.selectDraftLineModal';
        this.uniTableConfig = new UniTableConfig(tableName, false, false, 100)
            .setColumns(columns)
            .setContextMenu(contextMenuItem)
            .setColumnMenuVisible(true);
    }

    private deleteLine(line) {
        this.unitable.removeRow(line._originalIndex);
        this.journalEntryService.Remove(line.ID, line).subscribe();
    }

    close(data?: any) {
        if (data) {
            this.onClose.emit(data.rowModel);
        } else {
            this.onClose.emit(null);
        }
    }
}
