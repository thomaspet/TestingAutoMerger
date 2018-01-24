import {Component, Input, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uniModal/barrel';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
} from '../../../../../framework/ui/unitable/index';

@Component({
    selector: 'select-draftline-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 70vw">
            <header><h1>Velg faktura</h1></header>
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

    private keyListener: any;
    public uniTableConfig: UniTableConfig;
    public config: any = {};

    constructor() {
        this.keyListener = document.addEventListener('keyup', (event: KeyboardEvent) => {
            const key = event.which || event.keyCode;
            if (key) {
                this.close();
            }
        });
    }

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
            new UniTableColumn('RegisteredDate', 'Opprettet', UniTableColumnType.LocalDate),
            new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.LocalDate),
            new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text),
            new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money),
            new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text),
        ];

        const tableName = 'accounting.journalEntry.selectDraftLineModal';
        this.uniTableConfig = new UniTableConfig(tableName, false, false, 100)
            .setColumns(columns)
            .setColumnMenuVisible(true);
    }

    close(data?: any) {
        if (data) {
            this.onClose.emit(data.rowModel);
        } else {
            document.removeEventListener('keydown', this.keyListener);
            this.onClose.emit(null);
        }
    }
}
