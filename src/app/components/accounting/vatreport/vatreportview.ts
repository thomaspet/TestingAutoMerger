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
import {HistoricVatReportModal} from './modals/historicVatReports';
import {ContextMenu} from '../../common/contextMenu/contextMenu';
import {IContextMenuItem} from 'unitable-ng2/main';


declare const moment;

@Component({
    selector: 'vat-report-view',
    templateUrl: 'app/components/accounting/vatreport/vatreportview.html',
    providers: [CompanySettingsService, VatReportService],
    directives: [REACTIVE_FORM_DIRECTIVES, ROUTER_DIRECTIVES, UniTabs, UniSave,
        VatSummaryPerPost, CheckListVat, ReceiptVat, VatReportJournalEntry, CreateCorrectedVatReportModal, HistoricVatReportModal, ContextMenu],
    pipes: [PeriodDateFormatPipe, UniCurrencyPipe]
})
export class VatReportView implements OnInit, OnDestroy {
    @ViewChild(CreateCorrectedVatReportModal) private createCorrectedVatReportModal: CreateCorrectedVatReportModal;
    @ViewChild(HistoricVatReportModal) private historicVatReportModal: HistoricVatReportModal;


    public internalComment: FormControl = new FormControl();
    public externalComment: FormControl = new FormControl();
    public companySettings: CompanySettings;
    public vatReportSummary: VatReportSummary[];
    public reportSummaryPerPost: VatReportSummaryPerPost[];
    public reportMessages: VatReportMessage[];
    public currentVatReport: VatReport = new VatReport();
    public vatTypes: VatType[] = [];
    public isBusy: boolean = true;
    public showView: string = '';
    private actions: IUniSaveAction[];
    private statusText: string;
    private subs: Subscription[] = [];
    private vatReportsInPeriod: VatReport[];
    private contextMenuItems: IContextMenuItem[] = [];
    

    constructor(
        private tabService: TabService,
        private companySettingsService: CompanySettingsService,
        private vatReportService: VatReportService,
        private vatTypeService: VatTypeService,
        private toastService: ToastService
    ) {
        this.tabService.addTab({ name: 'MVA melding', url: '/accounting/vatreport' });
        
        this.contextMenuItems = [
            {
                label: 'Vis tidligere MVA meldinger', 
                action: () => {
                    this.showList();
                }
            }
        ]; 
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
                .debounceTime(400)
                .distinctUntilChanged()
                .switchMap(
                    change => this
                        .vatReportService
                        .Put(this.currentVatReport.ID, this.currentVatReport)
                )
                .subscribe(null, err => this.onError(err))
        );

        this.subs.push(
            this.internalComment
                .valueChanges
                .filter(change => !!this.currentVatReport)
                .filter(change => this.currentVatReport.InternalComment !== change)
                .map(change => this.currentVatReport.InternalComment = change)
                .debounceTime(400)
                .distinctUntilChanged()
                .switchMap(
                    change => this
                        .vatReportService
                        .Put(this.currentVatReport.ID, this.currentVatReport)
                )
                .subscribe(null, err => this.onError(err))
        );

        this.vatTypeService.GetVatTypesWithVatReportReferencesAndVatCodeGroup().subscribe(vatTypes => this.vatTypes = vatTypes, err => this.onError(err));
    }

    private updateSaveActions() {

        this.actions = [];

        this.actions.push({
            label: 'Kjør',
            action: (done) => this.runVatReport(done),
            disabled: this.IsExecuteActionDisabled(), 
            main: true
        });

        this.actions.push({
            label: 'Send inn',
            action: (done) => this.sendVatReport(done),
            disabled: this.IsSendActionDisabled()
        });

        this.actions.push({
            label: 'Godkjenn manuelt',
            action: (done) => this.approveManually(done),
            disabled: this.IsApproveActionDisabled()
        });

        this.actions.push({
            label: 'Opprett endringsmelding ',
            action: (done) => this.createCorrectiveVatReport(done),
            disabled: this.IsCreateCorrectionMessageAcionDisabled()
        });
    }

    private IsExecuteActionDisabled() {
        if (this.currentVatReport.StatusCode === null ||
            this.currentVatReport.StatusCode === 0 ||
            this.currentVatReport.StatusCode === StatusCodeVatReport.Executed ||
            this.currentVatReport.StatusCode === StatusCodeVatReport.Rejected) {
            return false;
        }
        return true;
    }
    private IsSendActionDisabled() {
        if (this.currentVatReport.StatusCode === StatusCodeVatReport.Executed) {
            return false;
        }
        return true;
    }
    private IsApproveActionDisabled() {
        if (this.currentVatReport.StatusCode === StatusCodeVatReport.Submitted) {
            return false;
        }
        return true;
    }
    private IsCreateCorrectionMessageAcionDisabled() {
        if (this.currentVatReport.StatusCode === StatusCodeVatReport.Approved) {
            return false;
        }
        return true;
    }

    private setVatreport(vatReport: VatReport) {
        this.showView = '';
        this.currentVatReport = vatReport;

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
        this.updateSaveActions();
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

    private showList() {
        this.historicVatReportModal.openModal(); 
    }
    
    public historicVatReportSelected(vatReport: VatReport) {
        this.setVatreport(vatReport);
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

        if (!this.isAltinnCommentSet(this.currentVatReport) && this.isAltinnCommentRequired(this.reportSummaryPerPost)) {

            this.toastService.addToast(
                'Altinn kommentar påkrevd',
                ToastType.bad,
                0,
                'Du må skrive en kommentar til altinn om hvorfor det er negative poster før de vil godta innsending av MVA-meldingen'
            );
            done('En forutsetning ble ikke møtt, se feilmelding oppe til høyre');
        } else {
            this.vatReportService.getNotReportedJournalEntryData(this.currentVatReport.TerminPeriodID)
                .subscribe((data: VatReportNotReportedJournalEntryData) => {
                    if ((data.SumVatAmount === 0 && data.SumTaxBasisAmount === 0)
                        || ((data.SumVatAmount > 0 || data.SumTaxBasisAmount > 0)
                        && confirm (`Det er ført bilag i perioden som ikke er med i noen MVA meldinger. Dette gjelder ${data.NumberOfJournalEntryLines} bilag (totalt kr. ${data.SumVatAmount} i MVA).` +
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

    public isExecuted(): boolean {
        return !!this.currentVatReport
            && (
                this.currentVatReport.StatusCode === StatusCodeVatReport.Executed
                || this.isSent() || this.isRejected()
            );
    }

    public isRejected(): boolean {
        return !!this.currentVatReport
            && this.currentVatReport.StatusCode === StatusCodeVatReport.Rejected;
    }

    public isSent(): boolean {
        return !!this.currentVatReport
            && (
                this.currentVatReport.StatusCode === StatusCodeVatReport.Submitted
                || this.isApproved()
            );
    }

    public isApproved(): boolean {
        return !!this.currentVatReport
            && (
                this.currentVatReport.StatusCode === StatusCodeVatReport.Approved
                || this.isAdjusted()
            );
    }

    public isAdjusted(): boolean {
        return !!this.currentVatReport
            && this.currentVatReport.StatusCode === StatusCodeVatReport.Adjusted;
    }

    private createCorrectiveVatReport(done) {

        // Set up subscription to listen to when data has been registrerred and button clicked in modal window.        
        // Only setup one subscription - this is done to avoid problems with multiple callbacks
        if (this.createCorrectedVatReportModal.changed.observers.length === 0) {
            this.createCorrectedVatReportModal.changed.subscribe((modalData: any) => {
                console.log('createCorrectiveVatReport tilbakemelding. Id=' + modalData.id);
                // Load the newly created report
                if (modalData.id > 0)
                {
                    this.vatReportService.Get(modalData.id, ['TerminPeriod'])
                        .subscribe(vatreport => {
                            this.setVatreport(vatreport);
                        },
                        err => {
                            this.onError(err);
                        });
                }

                
                done('mva endringsmelding registrert');
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

    private isAltinnCommentRequired(reportSummaryPerPost: VatReportSummaryPerPost[]): boolean {
        return reportSummaryPerPost.some(summary =>
            (summary.VatPostReportAsNegativeAmount && summary.SumVatAmount > 0)
            || summary.SumVatAmount < 0
        );
    }

    private isAltinnCommentSet(vatReport: VatReport) {
        return vatReport && vatReport.Comment && vatReport.Comment.length > 0;
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

    private onError(error, optionalDoneHandler?: (error) => void) {
        let errorMsg =  'Det skjedde en feil';
        let errorBody = error.json();
        if (errorBody && errorBody.Message) {
            errorMsg += ': ' + errorBody.Message;
        }
        this.toastService.addToast('Error', ToastType.bad, 0, errorMsg);
        
        if (optionalDoneHandler) {
            optionalDoneHandler('Det skjedde en feil, forsøk igjen senere');
        }
        
        console.log('Error in the vat report view:', error);
    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public ShowVatReport(id: number) {
        console.log('ShowVatReport id:', id);
        this.vatReportService.Get(id, ['TerminPeriod'])
            .subscribe(vatreport => {
                this.setVatreport(vatreport);
            },
            err => {
                this.onError(err);
            });

    }
}
