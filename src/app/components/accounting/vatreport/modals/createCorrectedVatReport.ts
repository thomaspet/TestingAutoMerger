import {Component, Type, Input, Output, ViewChild, EventEmitter, OnInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniForm} from '../../../../../framework/ui/uniform/index';
import {Period, VatReport} from '../../../../../app/unientities';
import {PeriodDateFormatPipe} from '@uni-framework/pipes/periodDateFormatPipe';
import {
    PeriodService,
    VatReportService,
    ErrorService
} from '../../../../services/services';

@Component({
    selector: 'create-corrected-vatreport-form',
    template: `
        <section class='uni-modal' *ngIf="config">
            <header>{{title}}</header>
            <section class="create-message-options">
                <article (click)="updateModel(1)" [class.selected]="model.correctionChoice === 1">
                    <h1>
                        <mat-radio-button [checked]="model.correctionChoice === 1"></mat-radio-button> Korrigert melding (anbefalt)
                    </h1>
                    <p>
                        Denne meldingen korrigerer allerede innsendt mva-melding og vil erstatte meldingen
                        du tidligere har sendt inn for denne terminen.
                    </p>
                </article>
                <article (click)="updateModel(2)" [class.selected]="model.correctionChoice === 2">
                    <h1>
                        <mat-radio-button [checked]="model.correctionChoice === 2"></mat-radio-button>
                        Tilleggsmelding
                    </h1>
                    <p>
                        Denne meldingen vil sende inn et tillegg til mva-meldingen du tidligere har sendt inn for denne terminen.
                    </p>
                </article>
            </section>
            <p>{{error}}</p>
            <footer>
                <button *ngIf="config.hasCancelButton" (click)="config.cancel()">{{exitButton}}</button>
                <button *ngIf="createButtonVisible" (click)="submit()" class="good">Opprett endringsmelding</button>
            </footer>
        </section>
    `
})
export class CreateCorrectedVatReportForm implements OnInit {
    @Input() public config: {};

    @ViewChild(UniForm) public uniform: UniForm;

    @Output() public formSubmitted: EventEmitter<number> = new EventEmitter<number>();

    public model = { correctionChoice: 1 };
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
    }

    public submit() {
        switch (this.model.correctionChoice) {
            case 1:
                this.createAdjustedVatReport();
                break;
            case 2:
                this.createAdditionalVatReport();
                break;
        }
        // this.formSubmitted.emit(this.model.correctionChoice); //TODO returner ID for ny vatReport
    }

    public updateModel(option) {
        this.model.correctionChoice = option;
        const model = this.model;
        this.model = {...model};
    }

    private createAdjustedVatReport() {
        // this.busy = true;
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

    public close() {
        this.initialize();
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
    @ViewChild(UniModal, { static: true })
    public modal: UniModal;

    @Output() public changed: EventEmitter<any> = new EventEmitter<any>();
    @Output() public canceled: EventEmitter<boolean> = new EventEmitter<boolean>();

    public modalConfig: any = {};
    private vatReportID: number;
    private periodID: number;
    private period: Period;
    public type: Type<any> = CreateCorrectedVatReportForm;
    private periodDateFormat: PeriodDateFormatPipe;

    constructor(
        private periodService: PeriodService,
        private errorService: ErrorService,
    ) {
        this.periodDateFormat = new PeriodDateFormatPipe();
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
                    modalContent.vatReportID = this.vatReportID;
                    modalContent.period = this.period;
                    modalContent.model = Object.assign({}, { correctionChoice: 1 });
                    modalContent.title = 'Opprett endringsmelding for termin: '
                        + this.period.No + ' (' + this.periodDateFormat.transform(this.period) + ')';
                });
            },
            err => this.errorService.handle(err));
    }
}
