import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {FormControl, REACTIVE_FORM_DIRECTIVES} from '@angular/forms';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {CompanySettingsService} from '../../../services/common/CompanySettingsService';
import {
    CompanySettings, VatReport, VatReportSummary, ValidationLevel, StatusCodeVatReport, VatType, VatReportMessage,
    VatReportSummaryPerPost, VatReportNotReportedJournalEntryData
} from '../../../unientities';
import {VatReportService} from '../../../services/Accounting/VatReportService';
import {Observable, Subscription} from 'rxjs/Rx';
import {PeriodDateFormatPipe} from '../../../pipes/PeriodDateFormatPipe';
import {UniCurrencyPipe} from '../../../pipes/UniCurrencyPipe';
import {VatTypeService} from '../../../services/Accounting/VatTypeService';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {VatSummaryPerPost} from './reportSummary/reportSummary';
import {CheckListVat} from './checkList/checkList';
import {ReceiptVat} from './receipt/receipt';
import {VatReportJournalEntry} from './journalEntry/vatReportJournalEntry';
import {CreateCorrectedVatReportModal} from './modals/createCorrectedVatReport';


declare const moment;

@Component({
    selector: 'vat-report-view',
    templateUrl: 'app/components/accounting/vatreport/vatreportview.html',
    providers: [CompanySettingsService, VatReportService],
    directives: [REACTIVE_FORM_DIRECTIVES, ROUTER_DIRECTIVES, UniTabs, UniSave,
        VatSummaryPerPost, CheckListVat, ReceiptVat, VatReportJournalEntry, CreateCorrectedVatReportModal],
    pipes: [PeriodDateFormatPipe, UniCurrencyPipe]
})
export class VatReportView implements OnInit, OnDestroy {
    @ViewChild(CreateCorrectedVatReportModal) private createCorrectedVatReportModal: CreateCorrectedVatReportModal;


    public internalComment: FormControl = new FormControl();
    public externalComment: FormControl = new FormControl();
    public companySettings: CompanySettings;
    public vatReportSummary: VatReportSummary[];
    public reportSummaryPerPost: VatReportSummaryPerPost[];
    public reportMessages: VatReportMessage[];
    public currentVatReport: VatReport = new VatReport();
    public vatTypes: VatType[] = [];
    public isExecuted: boolean;
    public isSendt: boolean;
    public isBusy: boolean = true;
    public showView: string = '';
    private actions: IUniSaveAction[];
    private statusText: string;
    private subs: Subscription[] = [];
    private vatReportsInPeriod: VatReport[];


    constructor(
        private tabService: TabService,
        private companySettingsService: CompanySettingsService,
        private vatReportService: VatReportService,
        private vatTypeService: VatTypeService,
        private toastService: ToastService
    ) {
        this.tabService.addTab({ name: 'MVA oppgave', url: '/accounting/vatreport' });
    }

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(settings => this.companySettings = settings, err => this.onError(err));

        this.spinner(this.vatReportService.getCurrentPeriod())
            .subscribe(vatReport => this.setVatreport(vatReport), err => this.onError(err));


        this.subs.push(
            this.externalComment
                .valueChanges
                .filter(change => !!this.currentVatReport)
                .filter(change => this.currentVatReport.Comment !== change)
                .map(change => this.currentVatReport.Comment = change)
                .distinctUntilChanged()
                .debounceTime(400)
                .subscribe(
                change => this
                    .vatReportService
                    .Put(this.currentVatReport.ID, this.currentVatReport)
                    .subscribe(vatReport => this.currentVatReport = vatReport, err => this.onError(err))
                )
        );

        this.subs.push(
            this.internalComment
                .valueChanges
                .filter(change => !!this.currentVatReport)
                .filter(change => this.currentVatReport.InternalComment !== change)
                .map(change => this.currentVatReport.InternalComment = change)
                .distinctUntilChanged()
                .debounceTime(400)
                .subscribe(
                change => this
                    .vatReportService
                    .Put(this.currentVatReport.ID, this.currentVatReport)
                    .subscribe(vatReport => this.currentVatReport = vatReport, err => this.onError(err))
                )
        );

        this.vatTypeService.GetVatTypesWithVatReportReferencesAndVatCodeGroup().subscribe(vatTypes => this.vatTypes = vatTypes, err => this.onError(err));
        this.updateSaveActions();
    }

    private updateSaveActions() {

        this.actions = [];

        this.actions.push({
            label: 'Kjør',
            action: (done) => this.runVatReport(done),
            disabled: false,
            main: true
        });

        this.actions.push({
            label: 'Send inn',
            action: (done) => this.sendVatReport(done),
            disabled: false
        });

        this.actions.push({
            label: 'Godkjenn manuelt',
            action: (done) => this.approveManually(done),
            disabled: false
        });

        this.actions.push({
            label: 'Opprett endringsmelding ',
            action: (done) => this.createCorrectiveVatReport(done),
            disabled: false
        });
    }

    private setVatreport(vatReport: VatReport) {
        this.showView = '';
        this.currentVatReport = vatReport;
        this.isSendt = vatReport.StatusCode === StatusCodeVatReport.Submitted;
        this.isExecuted = vatReport.StatusCode === StatusCodeVatReport.Executed || this.isSendt;

        this.vatReportSummary = null;
        this.vatReportService.getVatReportSummary(vatReport.ID, vatReport.TerminPeriodID)
            .subscribe(
            data => this.vatReportSummary = data,
            err => this.onError(err)
            );

        this.reportSummaryPerPost = null;
        this.vatReportService.getVatReportSummaryPerPost(vatReport.ID, vatReport.TerminPeriodID)
            .subscribe(
            data => this.reportSummaryPerPost = data,
            err => this.onError(err)
            );

        this.reportMessages = null;
        this.vatReportService.getVatReportMessages(vatReport.ID, vatReport.TerminPeriodID)
            .subscribe(
            data => this.reportMessages = data,
            err => this.onError(err)
            );
        this.updateStatusText();
        this.getVatReportsInPeriod();
    }

    private getVatReportsInPeriod() {
        // Get list of credit notes for an invoice
        this.vatReportService.GetAll('filter=TerminPeriodID eq ' + this.currentVatReport.TerminPeriodID)
            .subscribe((response: VatReport[]) => {
                this.vatReportsInPeriod = response;
            }, (err) => {
                console.log('Error retrieving VatReports data: ', err);
                this.toastService.addToast('En feil oppsto ved henting av VatReports data: ' + JSON.stringify(err), ToastType.bad);
            });
    }
    private updateStatusText() {
        this.statusText = this.vatReportService.getStatusText(this.currentVatReport.StatusCode);
    }

    public onBackPeriod() {
        this.spinner(
            this.vatReportService.getPreviousPeriod(this.currentVatReport.ID, this.currentVatReport.TerminPeriodID)
        )
            .subscribe(vatReport => this.setVatreport(vatReport), error => {
                if (error.status === 404) {
                    this.toastService.addToast('Ingen flere perioder bakover i tid', ToastType.warn);
                } else {
                    this.onError(error);
                }
            });
    }

    public onForwardPeriod() {
        this.spinner(
            this.vatReportService.getNextPeriod(this.currentVatReport.ID, this.currentVatReport.TerminPeriodID)
        )
            .subscribe(vatReport => this.setVatreport(vatReport), error => {
                if (error.status === 404) {
                    this.toastService.addToast('Ingen flere perioder fremover i tid', ToastType.warn);
                } else {
                    this.onError(error);
                }
            });
    }

    public runVatReport(done) {
        this.vatReportService.runReport(this.currentVatReport.ID, this.currentVatReport.TerminPeriodID)
            .subscribe(vatReport => {
                this.setVatreport(vatReport);
                done();
            },
            err => this.onError(err, done)
            );
    }

    public sendVatReport(done) {
        this.vatReportService.getNotReportedJournalEntryData(this.currentVatReport.TerminPeriodID)
            .subscribe((data: VatReportNotReportedJournalEntryData) => {
                if ((data.SumVatAmount === 0 && data.SumTaxBasisAmount === 0)
                    || ((data.SumVatAmount > 0 || data.SumTaxBasisAmount > 0)
                        && confirm(`Det er ført bilag i perioden som ikke er med i noen MVA meldinger. Dette gjelder ${data.NumberOfJournalEntryLines} bilag (totalt kr. ${data.SumVatAmount} i MVA).` +
                            '\n\nTrykk avbryt og kjør rapporten på ny hvis du vil ha med disse bilagene'))) {
                    this.vatReportService.sendReport(this.currentVatReport.ID)
                        .subscribe(() => {
                            this.vatReportService.Get(this.currentVatReport.ID, ['TerminPeriod'])
                                .subscribe(vatreport => {
                                    this.setVatreport(vatreport);
                                    done();
                                },
                                err => this.onError(err, done)
                                );
                        },
                        err => this.onError(err, done)
                        );
                } else {
                    done();
                }
            });

    }

    public approveManually(done) {
        this.vatReportService.Transition(this.currentVatReport.ID, this.currentVatReport, 'approve')
            .subscribe(() => {
                this.vatReportService.Get(this.currentVatReport.ID, ['TerminPeriod'])
                    .subscribe(vatreport => {
                        this.setVatreport(vatreport);
                        done('Godkjent');
                    },
                    err => {
                        done('Feilet å hente vatreport');
                        this.onError(err);
                    });
            },
            err => {
                done('Godkjenning feilet');
                this.onError(err);
            }
            );
    }

    private createCorrectiveVatReport(done) {

        // Set up subscription to listen to when data has been registrerred and button clicked in modal window.        
        // Only setup one subscription - this is done to avoid problems with multiple callbacks
        if (this.createCorrectedVatReportModal.changed.observers.length === 0) {
            this.createCorrectedVatReportModal.changed.subscribe((modalData: any) => {

                console.log('createCorrectiveVatReport tilbakemelding: ' + modalData);
                done('mva endringsmelding registrert');
                // TODO: Load the newly created report
            });
        }

        this.createCorrectedVatReportModal.openModal(this.currentVatReport.ID, this.currentVatReport.TerminPeriodID);
    }

    public isControlledWithoutWarnings(): boolean {
        if (!this.reportMessages) {
            return false;
        } else {
            this.reportMessages
                .every(message => message.Level !== ValidationLevel.Info);
        }
    }

    public vatReportSummaryToVatCodes(vatReportSummary: VatReportSummary): string[] {
        return this
            .vatTypes
            .filter(vatType =>
                vatType.VatCodeGroupID === vatReportSummary.VatCodeGroupID
            )
            .map(vatType => vatType.VatCode);
    }

    private spinner<T>(source: Observable<T>): Observable<T> {
        this.isBusy = true;
        return <Observable<T>>source.finally(() => this.isBusy = false);
    }

    private onError(error: Error, optionalDoneHandler?: (error) => void) {
        this.toastService.addToast('Error', ToastType.bad, 0, 'Det skjedde en feil, forsøk igjen senere');
        if (optionalDoneHandler) {
            optionalDoneHandler('Det skjedde en feil, forsøk igjen senere');
        }
        console.log('Error in the vat report view:', error);
    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
