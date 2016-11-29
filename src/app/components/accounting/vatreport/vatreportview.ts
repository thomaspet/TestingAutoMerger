import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {CompanySettingsService} from '../../../services/common/CompanySettingsService';
import {
    CompanySettings, VatReport, VatReportSummary, ValidationLevel, StatusCodeVatReport, VatType, VatReportMessage,
    VatReportSummaryPerPost, VatReportNotReportedJournalEntryData, AltinnSigning, StatusCodeAltinnSigning
} from '../../../unientities';
import {VatReportService} from '../../../services/Accounting/VatReportService';
import {AltinnAuthenticationService} from '../../../services/services';
import {Observable, Subscription} from 'rxjs/Rx';
import {VatTypeService} from '../../../services/Accounting/VatTypeService';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {CreateCorrectedVatReportModal} from './modals/createCorrectedVatReport';
import {HistoricVatReportModal} from './modals/historicVatReports';
import {IContextMenuItem} from 'unitable-ng2/main';
import {AltinnAuthenticationDataModal} from '../../common/modals/AltinnAuthenticationDataModal';
import {ReceiptVat} from './receipt/receipt';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {UniStatusTrack} from '../../common/toolbar/statustrack';
import {PeriodDateFormatPipe} from '../../../pipes/PeriodDateFormatPipe';
import {ErrorService} from '../../../services/common/ErrorService';

declare const moment;

@Component({
    selector: 'vat-report-view',
    templateUrl: 'app/components/accounting/vatreport/vatreportview.html'
})
export class VatReportView implements OnInit, OnDestroy {
    @ViewChild(CreateCorrectedVatReportModal) private createCorrectedVatReportModal: CreateCorrectedVatReportModal;
    @ViewChild(HistoricVatReportModal) private historicVatReportModal: HistoricVatReportModal;
    @ViewChild(AltinnAuthenticationDataModal) private altinnAuthenticationDataModal: AltinnAuthenticationDataModal;
    @ViewChild(ReceiptVat) private receiptVat: ReceiptVat;

    public internalComment: FormControl = new FormControl();
    public externalComment: FormControl = new FormControl();
    public companySettings: CompanySettings;
    public vatReportSummary: VatReportSummary[];
    public reportSummaryPerPost: VatReportSummaryPerPost[];
    public reportMessages: VatReportMessage[];
    public currentVatReport: VatReport = new VatReport();
    public vatTypes: VatType[] = [];
    public isBusy: boolean = true;
    public isHistoricData: boolean = false;
    public showView: string = '';
    private actions: IUniSaveAction[];
    private statusText: string;
    private subs: Subscription[] = [];
    private vatReportsInPeriod: VatReport[];
    private contextMenuItems: IContextMenuItem[] = [];
    private toolbarconfig: IToolbarConfig;

    constructor(
        private tabService: TabService,
        private companySettingsService: CompanySettingsService,
        private vatReportService: VatReportService,
        private vatTypeService: VatTypeService,
        private toastService: ToastService,
        private altinnAuthenticationService: AltinnAuthenticationService,
        private errorService: ErrorService,
        private periodDateFormat: PeriodDateFormatPipe
    ) {
        this.tabService.addTab({ name: 'MVA melding', url: '/accounting/vatreport', active: true, moduleID: UniModules.VatReport });
    
        this.contextMenuItems = [
            {
                label: 'Vis tidligere MVA meldinger',
                action: () => {
                    this.showList();
                }
            }
        ];

        this.vatReportService.refreshVatReport$.subscribe((vatReport: VatReport) => {
            this.toolbarconfig = {
                title: vatReport.TerminPeriod ? 'Termin ' + vatReport.TerminPeriod.No : '',
                subheads: [
                    {
                        title: vatReport.Title + ', ' + this.periodDateFormat.transform(vatReport.TerminPeriod)
                    }         
                ],
                statustrack: this.getStatustrackConfig(),
                navigation: {
                    prev: this.onBackPeriod.bind(this),
                    next: this.onForwardPeriod.bind(this),
                },
                contextmenu: this.contextMenuItems
            };            
        } /* No error handling necessary, can't produce errors */);
    }

    private getStatustrackConfig() {
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = this.currentVatReport.StatusCode;

        this.vatReportService.statusTypes.forEach((s, i) => {
            let _state: UniStatusTrack.States;

            if (s.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (s.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (s.Code === activeStatus) {
                _state = UniStatusTrack.States.Active;
            }

            statustrack[i] = {
                title: s.Text,
                state: _state
            };
        });
        return statustrack;
    }

    public ngOnInit() {
        this.companySettingsService.Get(1, ['CompanyBankAccount'])
            .subscribe(settings => this.companySettings = settings, err => this.errorService.handle(err));

        this.spinner(this.vatReportService.getCurrentPeriod())
            .subscribe(vatReport => this.setVatreport(vatReport), err => this.errorService.handle(err));


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
                .subscribe(null, err => this.errorService.handle(err))
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
                .subscribe(null, err => this.errorService.handle(err))
        );

        this.vatTypeService.GetVatTypesWithVatReportReferencesAndVatCodeGroup().subscribe(vatTypes => this.vatTypes = vatTypes, err => this.errorService.handle(err));
    }

    private updateSaveActions() {

        this.actions = [];

        this.actions.push({
            label: 'Kjør',
            action: (done) => this.runVatReport(done),
            disabled: this.IsExecuteActionDisabled(),
            main: !this.IsExecuteActionDisabled() && this.IsSendActionDisabled()
        });

        this.actions.push({
            label: 'Send inn',
            action: (done) => this.sendVatReport(done),
            disabled: this.IsSendActionDisabled(),
            main: !this.IsSendActionDisabled()
        });

        this.actions.push({
            label: 'Signer',
            action: (done) => this.signVatReport(done),
            disabled: this.IsSignActionDisabled(),
            main: !this.IsSignActionDisabled()
        });

        this.actions.push({
            label: 'Godkjenn manuelt',
            action: (done) => this.approveManually(done),
            disabled: this.IsApproveActionDisabled()
        });

        this.actions.push({
            label: 'Opprett endringsmelding ',
            action: (done) => this.createCorrectiveVatReport(done),
            disabled: this.IsCreateCorrectionMessageAcionDisabled(),
            main: !this.IsCreateCorrectionMessageAcionDisabled()
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
    private IsSignActionDisabled() {
        if (this.currentVatReport.StatusCode === StatusCodeVatReport.Submitted) {
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
        this.vatReportService.refreshVatReport(this.currentVatReport);

        this.vatReportSummary = null;
        this.vatReportService.getVatReportSummary(vatReport.ID, vatReport.TerminPeriodID)
            .subscribe(
            data => {
                this.vatReportSummary = data;
                if (data != null && data.length > 0) {
                    this.isHistoricData = data[0].IsHistoricData;
                }
            },
            err => this.errorService.handle(err)
            );

        this.reportSummaryPerPost = null;
        this.vatReportService.getVatReportSummaryPerPost(vatReport.ID, vatReport.TerminPeriodID)
            .subscribe(
            data => this.reportSummaryPerPost = data,
            err => this.errorService.handle(err)
            );

        this.reportMessages = null;
        this.vatReportService.getVatReportMessages(vatReport.ID, vatReport.TerminPeriodID)
            .subscribe(
            data => this.reportMessages = data,
            err => this.errorService.handle(err)
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
            }, err => this.errorService.handle(err));
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
                    this.errorService.handle(error);
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
                    this.errorService.handle(error);
                }
            });
    }

    private showList() {
        this.historicVatReportModal.openModal();
    }

    public historicVatReportSelected(vatReport: VatReport) {
        this.setVatreport(vatReport);
    }

    public vatReportDidChange(vatReport: VatReport) {
        this.setVatreport(vatReport);
        this.showView = 'receipt';
    }

    public runVatReport(done) {
        this.vatReportService.runReport(this.currentVatReport.ID, this.currentVatReport.TerminPeriodID)
            .subscribe(vatReport => {
                this.setVatreport(vatReport);
                done();
            },
            err => {
                this.errorService.handle(err);
                done('Det skjedde en feil, forsøk igjen senere');
            }
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
                            this.vatReportService.Get(this.currentVatReport.ID, ['TerminPeriod', 'JournalEntry', 'VatReportArchivedSummary'])
                                .subscribe(vatreport => {
                                    this.setVatreport(vatreport);
                                    done();
                                },
                                err => {
                                    this.errorService.handle(err);
                                    done('Det skjedde en feil, forsøk igjen senere');
                                }
                                );
                        },
                        err => {
                            this.errorService.handle(err);
                            done('Det skjedde en feil, forsøk igjen senere');
                        }
                        );
                } else {
                    done();
                }
            });

    }

    public signVatReport(done) {
        this.altinnAuthenticationDataModal.getUserAltinnAuthorizationData()
            .then(authData => {
                this.vatReportService.signReport(this.currentVatReport.ID, authData)
                    .subscribe((signing: AltinnSigning) => {
                        if (signing.StatusCode === StatusCodeAltinnSigning.Failed) {
                            // error occured while signing - not technical error
                            this.toastService.addToast('Feil oppsto', ToastType.bad, 0, signing.StatusText);
                            done('Feil ved signering');
                        } else {
                            this.vatReportService.Get(this.currentVatReport.ID, ['TerminPeriod', 'JournalEntry', 'VatReportArchivedSummary'])
                                .subscribe(vatreport => {
                                    this.setVatreport(vatreport);
                                    this.showView = 'receipt';

                                    this.toastService.addToast('Signert OK', ToastType.good);
                                    done('Signert OK');

                                    // check for receipt, this should be ready now - but use setTimeout to allow angular to switch views first
                                    setTimeout(() => {
                                        this.receiptVat.checkForReceipt();
                                    });
                                },
                                err => {
                                    this.errorService.handle(err);
                                    done('Det skjedde en feil, forsøk igjen senere');
                                }
                                );
                        }
                    },
                    err => {
                        // something is not working with the altinnauthentication it seems, clear the pincode to make
                        // the user log in again
                        if (err.status === 403) {
                            console.log('nullstiller pin');
                            authData.pin = '';
                            this.altinnAuthenticationService.storeAltinnAuthenticationDataInLocalstorage(authData);
                        }

                        this.errorService.handle(err)
                        done('Det skjedde en feil, forsøk igjen senere');
                    });
                }
            );
    }


    public approveManually(done) {
        if (confirm('Er du sikker på at du vil godkjenne manuelt? Det er normalt bedre å bruke signering hvis mulig')) {
            this.vatReportService.Transition(this.currentVatReport.ID, this.currentVatReport, 'approve')
                .subscribe(() => {
                    this.vatReportService.Get(this.currentVatReport.ID, ['TerminPeriod', 'JournalEntry', 'VatReportArchivedSummary'])
                        .subscribe(vatreport => {
                            this.setVatreport(vatreport);
                            done('Godkjent');
                        },
                        err => {
                            done('Feilet å hente vatreport');
                            this.errorService.handle(err);
                        });
                },
                err => {
                    done('Godkjenning feilet');
                    this.errorService.handle(err);
                }
                );
        } else {
            done('Godkjenning avbrutt');
        }
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

        this.createCorrectedVatReportModal.openModal(this.currentVatReport.ID, this.currentVatReport.TerminPeriodID);

        // Set up subscription to listen to when data has been registrerred and button clicked in modal window.
        // Only setup one subscription - this is done to avoid problems with multiple callbacks
        if (this.createCorrectedVatReportModal.changed.observers.length === 0) {
            this.createCorrectedVatReportModal.changed.subscribe((modalData: any) => {

                // Load the newly created report
                if (modalData.id > 0) {
                    this.vatReportService.Get(modalData.id, ['TerminPeriod', 'JournalEntry', 'VatReportArchivedSummary'])
                        .subscribe(vatreport => {
                            this.setVatreport(vatreport);
                        },
                        err => this.errorService.handle(err));
                }

                done('Endringsmelding opprettet');
            });
        }
    }

    public isControlledWithoutWarnings(): boolean {
        if (!this.reportMessages) {
            return false;
        } else {
            this.reportMessages
                .every(message => message.Level !== ValidationLevel.Info);
        }
    }

    public vatReportSummaryToVatCodeAndAccountNumbers(vatReportSummary: VatReportSummary): string {
        const vatTypes = this.vatTypes;

        // build string containing combination of vatcode and accountnumber for this vatpost, the result
        // will e.g. be "1|2711,3|2710,5|2702,..."

        let vatCodesAndAccountNos: Array<string> = [];
        if (vatTypes) {
            vatTypes.forEach(vt => {
                let vatReportReferences = vt.VatReportReferences.filter(vatReport => vatReport.VatPost.VatCodeGroupID === vatReportSummary.VatCodeGroupID);
                vatReportReferences.forEach(vrr => vatCodesAndAccountNos.push(`${vt.VatCode}|${vrr.Account.AccountNumber}`));
            });
        }

        return vatCodesAndAccountNos.join(',');
    }

    private spinner<T>(source: Observable<T>): Observable<T> {
        this.isBusy = true;
        return <Observable<T>>source.finally(() => this.isBusy = false);
    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public ShowVatReport(id: number) {
        this.vatReportService.Get(id, ['TerminPeriod', 'JournalEntry', 'VatReportArchivedSummary'])
            .subscribe(vatreport => {
                this.setVatreport(vatreport);
            },
            err => this.errorService.handle(err));

    }
}
