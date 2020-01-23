import {Component, ViewChild, Input, Output, EventEmitter, HostListener} from '@angular/core';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {IUniModal, IModalOptions, UniModalService, UniConfirmModalV2, ConfirmActions} from '../../../../../framework/uni-modal';
import {
    UniTable,
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    UniTableColumnSortMode
} from '../../../../../framework/ui/unitable/index';
import { PostPostService, IAutoMarkAllResponseObject } from '../../../../services/services';
import {Subject} from 'rxjs';
import { exportToFile, arrayToCsv, safeInt, trimLength, parseTime } from '../../../common/utils/utils';

@Component({
    selector: 'uni-automark-modal',
    template: `
        <section role="dialog" class="uni-modal uni-automark-modal uni-redesign" style="width: 50vw;" (keydown.esc)="reject()">
            <header>{{ header }}</header>

            <article *ngIf="!disabled">
                <uni-table
                    [resource]="markChoices"
                    [config]="uniTableConfig">
                </uni-table>

                <div>
                    <h3 style="margin-bottom: 0;">Merk!</h3>
                    <h4 style="margin-top: .3rem; font-weight: 400;">
                        <span *ngIf="all">
                            Du ønsker å automerke alle kontoer.
                            Dette kan ta litt tid, og vil låse UniEconomy mens prossessen pågår,
                            men du kan avbryte når som helst. Vil du fortsette?
                        </span>
                        <span *ngIf="!all">
                            Automerking vil overskrive alle manuelle markeringer du har gjort.
                        </span>
                    </h4>
                </div>
            </article>

            <article *ngIf="disabled">
                <span class="automark-percent-progress">
                    <h4 [class.bad]="response && response.finalized && response.errors > 0">
                        <i class="material-icons"
                            *ngIf="response && response.finalized && response.errors > 0"
                            style="vertical-align: middle">error_outline</i>
                        {{ response.message }}
                    </h4>
                    {{ response.percent }} %
                    <span> {{ processMessage }}
                        <span (click)="showLog()" *ngIf="showLogLink">Vis logg</span>
                    </span>
                </span>
            </article>

            <mat-progress-bar
                *ngIf="loading$ | async"
                class="uni-progress-bar"
                mode="indeterminate">
            </mat-progress-bar>

            <footer>
                <button (click)="close('completed')" class="good" *ngIf="onCompleteBoolean">Lukk</button>
                <button (click)="close('mark')" class="good" [disabled]="disabled" *ngIf="!onCompleteBoolean">
                    {{ buttonLabel }}
                </button>
                <button (click)="close('cancel')" class="bad" *ngIf="!onCompleteBoolean">Avbryt</button>
            </footer>
        </section>
    `,
    host: {
        '(document:keydown)': 'keyDownHandler($event)'
}
})

export class UniAutomarkModal implements IUniModal {

    markChoices: any[] = [
        {
            label: 'KID-treff',
            value: 1,
            _rowSelected: true
        },
        {
            label: 'KID-treff, ulikt beløp',
            value: 7,
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

    public header: string = 'Valg av merkekriterier';
    public uniTableConfig: UniTableConfig;
    public all: boolean = false;
    public disabled: boolean = false;
    public showLogLink: boolean = false;
    public onCompleteBoolean: boolean = false;
    public buttonLabel = 'Automerk';
    public processMessage: string = 'Automerking pågår..';
    public loading$: Subject<boolean> = new Subject();
    public autoMarkSubject: Subject<IAutoMarkAllResponseObject>;
    public response: IAutoMarkAllResponseObject = {
        message: '',
        percent: 0,
        finalized: false,
        errors: 0,
        logMessages: []
    };

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild(UniTable, { static: false })
    private table: UniTable;

    constructor(
        private toast: ToastService,
        private postpostService: PostPostService,
        private modalService: UniModalService
    ) { }

    public ngOnInit() {
        if (this.options && this.options.data) {
            this.all = this.options.data.all || false;
            this.buttonLabel = this.all ? 'Automerk alle' : this.buttonLabel;
            this.header = this.all ? 'Automerk alle kontoer' : this.header;
        }
        const selects = JSON.parse(localStorage.getItem('Automarkmodalchoises')) || [true, true, true, false, false];
        this.markChoices.forEach((choise, index) => {
            choise._rowSelected = selects[index];
        });
        this.setupUniTable();
     }

    public keyDownHandler(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.close('mark');
        }
        if (event.keyCode === 27) {
            event.preventDefault();
            this.close('cancel');
        }
    }

    public close(buttonClicked: string) {
        if (buttonClicked === 'mark') {
            const selectedRows = this.table.getTableData().filter(row => row._rowSelected);
            if (!selectedRows.length) {
                this.toast.addToast('Feil valg', ToastType.warn, 5, 'Kan ikke automerke uten kriterier. Vennligst velg minst ett felt.');
                return;
            }
            localStorage.setItem('Automarkmodalchoises', JSON.stringify(this.table.getTableData().map(row => row._rowSelected)));
            if (this.all) {
                this.disabled = true;
                this.buttonLabel = 'Automerker...';
                this.loading$.next(true);
                this.autoMarkSubject = this.postpostService.automarkAllAccounts(
                    0, 9999999, selectedRows.length === 5 ? [10] : selectedRows.map(row => row.value)
                );
                this.autoMarkSubject.subscribe((response: IAutoMarkAllResponseObject) => {
                    this.response = response;
                    if (response.finalized) {
                        this.loading$.next(false);
                        this.onCompleteBoolean = true;
                        this.showLogLink = response.logMessages.length > 0;

                        if (response.errors) {
                            this.processMessage = `Fullført med ${response.errors} feilmeldinger.`;
                        } else {
                            this.processMessage = (response.logMessages.length > response.errors)
                                ? `Fullført uten feil.`
                                : 'Fant ingen kontoer å merke. Fullført uten endringer';
                        }
                        this.response.doneMessage = this.processMessage;
                    }
                });
            } else {
                this.onClose.emit(selectedRows.length === 5 ? [10] : selectedRows.map(row => row.value));
            }
        } else if (buttonClicked === 'completed') {
            this.onClose.emit(this.response);
        } else {
            if (!!this.autoMarkSubject) {
                this.autoMarkSubject.complete();
                this.postpostService.cancelAutomarkAll = true;
            }
            this.onClose.emit(false);
        }
    }

    public showLog() {

        // Create list element to show log in modal!
        let logElement = '<ul class="automark-log-modal-view">';
        this.response.logMessages.forEach((msg) => {
            logElement += `<li class="${ msg.error ? 'bad' : '' }">${msg.message}`;
            if (msg.error) {
                logElement += `<h4 class="log-error-mgs"> ${msg.errorMsg} </h4>`;
            }
            logElement += '</li>';
        });
        logElement += '</ul>';

        this.response.doneMessage = this.processMessage;

        const options: IModalOptions = {
            header: 'Automerking - Logg',
            message: logElement,
            buttonLabels: {
                accept: 'Last ned som CSV',
                cancel: 'Lukk'
            }
        };


        this.modalService.open(UniConfirmModalV2, options).onClose.subscribe((res) => {
            if (res === ConfirmActions.ACCEPT) {
                const list = [];
                this.response.logMessages.forEach((msg) => {
                    let account = msg.message.split( msg.error ? ':' : 'for');
                    account.shift();
                    account = account.join();
                    const row = {
                        Melding: msg.message,
                        Konto: account,
                        Feilmelding: msg.errorMsg || ''
                    };
                    list.push(row);
                });

                exportToFile(arrayToCsv(list), `AutomerkingLogg.csv`);
            }
        });
    }

    public reject() {
        this.toast.addToast('Avbryt for å lukke modal', ToastType.warn, 5);
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
