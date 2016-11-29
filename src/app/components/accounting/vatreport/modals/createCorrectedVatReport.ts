import {Component, Type, Input, Output, ViewChild, EventEmitter, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniForm} from 'uniform-ng2/main';
import {FieldLayout, Period, VatReport, FieldType} from '../../../../../app/unientities';
import {VatReportService} from '../../../../services/Accounting/VatReportService';
import {PeriodService} from '../../../../services/Accounting/PeriodService';
import {PeriodDateFormatPipe} from '../../../../pipes/PeriodDateFormatPipe';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ErrorService} from '../../../../services/common/ErrorService';

declare var _;
declare const moment;

@Component({
    selector: 'create-corrected-vatreport-form',
    template: `
        <article class='modal-content' *ngIf="config">
            <h1>{{title}}</h1>
            <uni-form [config]="formConfig" [fields]="fields" [model]="model" (submitEvent)="onSubmit($event)"></uni-form>
            <p>{{error}}</p>
            <footer>
                <button *ngIf="createButtonVisible" (click)="submit()">Opprett endringsmelding</button>
                <button *ngIf="config.hasCancelButton" (click)="config.cancel()">{{exitButton}}</button>
            </footer>
        </article>
    `
})
export class CreateCorrectedVatReportForm implements OnInit {
    @Input() public config: {};

    @ViewChild(UniForm) public uniform: UniForm;

    @Output() public formSubmitted: EventEmitter<number> = new EventEmitter<number>();

    public fields: FieldLayout[] = [];
    public model: { correctionChoice: number } = { correctionChoice: 1 };
    public formConfig: any = {};
    public title: string = 'Opprett endringsmelding';
    public error: string = '';
    public exitButton: string = 'Avbryt';
    public createButtonVisible: boolean;
    public vatReportID: number;
    public newVatReportID: number = 0;
    public period: Period;

    constructor(private vatReportService: VatReportService, private errorService: ErrorService) {
    }

    public ngOnInit() {
        this.initialize();
    }

    private initialize() {
        this.error = '';
        this.createButtonVisible = true;
        this.error = '';
        this.exitButton = 'Avbryt';


        var radioGroup: any = {
            Property: 'correctionChoice',
            Placement: 1,
            Hidden: false,
            FieldType: FieldType.RADIOGROUP,
            ReadOnly: false,
            Label: '',
            Description: '',
            HelpText: '',
            FieldSet: 0,
            Section: 0,
            Placeholder: 'Select',
            Options: {
                source: [
                    { id: 1, text: 'Korrigert melding (Anbefalt)' },
                    { id: 2, text: 'Tilleggsmelding' }
                ],
                labelProperty: 'text',
                valueProperty: 'id'
            }
        };
        this.fields = [radioGroup];
    }

    public submit() {
        switch (this.model.correctionChoice) {
            case 1:
                console.log('submit() this.model.correctionChoice 1 for periodID: ' + this.period.ID);
                this.createAdjustedVatReport();
                break;
            case 2:
                console.log('submit() this.model.correctionChoice 2 for periodID: ' + this.period.ID);
                this.createAdditionalVatReport();
                break;
        }
        // this.formSubmitted.emit(this.model.correctionChoice); //TODO returner ID for ny vatReport
    }

    private createAdjustedVatReport() {
        // this.busy = true;
        this.uniform.Hidden = true;
        this.createButtonVisible = false;
        this.vatReportService.createAdjustedVatReport(this.vatReportID, this.period.ID)
            .subscribe((response: VatReport) => {
                if (response === null) {
                    this.title = 'Feil ved opprettelse av ny mva-melding';
                    this.error = '';
                } else {
                    this.newVatReportID = response.ID;
                    this.title = 'Ny mva korrigert mva-melding er opprettet.';
                    this.exitButton = 'OK';
                }
                // this.busy = false;
            },
            error => {
                this.title = 'Feil ved opprettelse av ny mva-melding';
                this.error = 'Feilmelding: ' + error.ErrorText;
                this.errorService.handle(error);
            });
    }

    private createAdditionalVatReport() {
        // this.busy = true;
        this.uniform.Hidden = true;
        this.createButtonVisible = false;
        this.vatReportService.createAdditionalVatReport(this.vatReportID, this.period.ID)
            .subscribe((response: VatReport) => {
                if (response === null) {
                    this.title = 'Feil ved opprettelse av ny mva-melding';
                    this.error = '';
                } else {
                    this.newVatReportID = response.ID;
                    this.title = 'Ny mva tilleggsmelding er opprettet.';
                    this.exitButton = 'OK';
                }
                // this.busy = false;
            },
            error => {
                this.title = 'Feil ved opprettelse av ny mva-melding';
                this.error = 'Feilmelding: ' + error.ErrorText;
                this.errorService.handle(error);
            });
    }

    public onSubmit() {
        this.formSubmitted.emit(this.model.correctionChoice);
    }

    public close() {
        this.initialize();
        console.log('close()');
        this.uniform.Hidden = false;
    }
}

@Component({
    selector: 'create-corrected-vatreport-modal',
    template: `
        <uni-modal [type]='type' [config]='modalConfig'></uni-modal>
    `,
    providers: [PeriodService]
})
export class CreateCorrectedVatReportModal {
    @ViewChild(UniModal)
    public modal: UniModal;

    @Output() public changed: EventEmitter<any> = new EventEmitter<any>();
    @Output() public canceled: EventEmitter<boolean> = new EventEmitter<boolean>();

    private modalConfig: any = {};
    private vatReportID: number;
    private periodID: number;
    private period: Period;
    public type: Type<any> = CreateCorrectedVatReportForm;

    constructor(
        private periodService: PeriodService,
        private errorService: ErrorService,
        public periodDateFormat: PeriodDateFormatPipe
    ) {
        const self = this;

        self.modalConfig = {
            hasCancelButton: true,
            class: 'good',
            cancel: () => {
                self.modal.getContent().then((form: CreateCorrectedVatReportForm) => {
                    self.modal.close();
                    form.close();

                    self.changed.emit({
                        id: form.newVatReportID
                    });
                });
            },
            periodID: this.periodID
        };
    }

    public openModal(vatReportID: number, periodID: number) {
        this.vatReportID = vatReportID;
        this.getPeriod(periodID);
    }

    private getPeriod(periodID: number) {
        this.periodID = periodID;

        this.periodService.Get(periodID)
            .subscribe(response => {
                this.period = response;
                this.modal.open();

                this.modal.getContent().then((modalContent: CreateCorrectedVatReportForm) => {
                    console.log('openModal for period: ' + periodID);

                    modalContent.vatReportID = this.vatReportID;
                    modalContent.period = this.period;
                    modalContent.model = { correctionChoice: 1 };
                    modalContent.title = 'Opprett endringsmelding for termin: ' + this.period.No + ' (' + this.periodDateFormat.transform(this.period) + ')';
                });
            },
            err => this.errorService.handle(err));
    }
}
