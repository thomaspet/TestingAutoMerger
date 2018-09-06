import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {
    UniTable,
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    UniTableColumnSortMode
} from '../../../../../framework/ui/unitable/index';

@Component({
    selector: 'uni-automark-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 40vw;">
            <header><h1>Valg av merkekriterier</h1></header>

            <article>
                <uni-table
                    [resource]="markChoices"
                    [config]="uniTableConfig">
                </uni-table>
            </article>

            <footer>
                <button (click)="close('mark')" class="good">Automerk</button>
                <button (click)="close('cancel')" class="bad">Avbryt</button>
            </footer>
        </section>
`
})

export class UniAutomarkModal implements IUniModal {

    markChoices: any[] = [
        {
            label: 'KID-treff',
            value: 1,
            _rowSelected: true
        },
        {
            label: 'Samsvar på fakturanummer',
            value: 2,
            _rowSelected: true
        },
        {
            label: 'Samsvar på fakturanummer, ulikt beløp',
            value: 3,
            _rowSelected: true
        },
        {
            label: 'Samsvar i sum ',
            value: 4,
            _rowSelected: false
        },
        {
            label: 'Alder. Gjenværende poster merkes etter alder',
            value: 6,
            _rowSelected: false
        }
    ];
    public uniTableConfig: UniTableConfig;

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    @ViewChild(UniTable)
    private table: UniTable;

    constructor(private toast: ToastService) { }

    public ngOnInit() {
        const selects = JSON.parse(localStorage.getItem('Automarkmodalchoises')) || [true, true, true, false, false];
        this.markChoices.forEach((choise, index) => {
            choise._rowSelected = selects[index];
        });
        this.setupUniTable();
     }

    public close(buttonClicked: string) {
        if (buttonClicked === 'mark') {
            const selectedRows = this.table.getTableData().filter(row => row._rowSelected);
            if (!selectedRows.length) {
                this.toast.addToast('Feil valg', ToastType.warn, 5, 'Kan ikke automerke uten kriterier. Vennligst velg minst ett felt.');
                return;
            }
            localStorage.setItem('Automarkmodalchoises', JSON.stringify(this.table.getTableData().map(row => row._rowSelected)));
            this.onClose.emit(selectedRows.length === 5 ? [10] : selectedRows.map(row => row.value));
        } else {
            this.onClose.emit(false);
        }
    }

    private setupUniTable() {
        const columns = [
            new UniTableColumn('label', 'Kriteriet', UniTableColumnType.Text)
        ];

        this.uniTableConfig = new UniTableConfig('common.automarkmodal.marks', false, false, 10)
            .setColumns(columns)
            .setMultiRowSelect(true)
            .setColumnMenuVisible(false);
    }
}
