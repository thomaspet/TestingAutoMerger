import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {
    CompanySettings, VatReport, VatReportSummary, ValidationLevel, StatusCodeVatReport, VatType, VatReportMessage,
    VatReportSummaryPerPost, VatReportNotReportedJournalEntryData, AltinnSigning, StatusCodeAltinnSigning
} from '../../../unientities';
import {Observable} from 'rxjs';
import {Subscription} from 'rxjs';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {UniModalService, UniConfirmModalV2, ConfirmActions} from '../../../../framework/uni-modal';
import {CreateCorrectedVatReportModal} from './modals/createCorrectedVatReport';
import {HistoricVatReportModal} from './modals/historicVatReports';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {AltinnAuthenticationModal} from '../../common/modals/AltinnAuthenticationModal';
import {ReceiptVat} from './receipt/receipt';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {IStatus, STATUSTRACK_STATES} from '../../common/toolbar/statustrack';
import {PeriodDateFormatPipe} from '../../../pipes/periodDateFormatPipe';
import {
    ErrorService,
    VatReportService,
    AltinnAuthenticationService,
    VatTypeService,
    CompanySettingsService,
    StatisticsService
} from '../../../services/services';
import {IUniTab} from '@uni-framework/uni-tabs';

@Component({
    selector: 'vat-report-view',
    templateUrl: './vatreportview.html'
})
export class VatReportView implements OnInit, OnDestroy {
    @ViewChild(CreateCorrectedVatReportModal) private createCorrectedVatReportModal: CreateCorrectedVatReportModal;
    @ViewChild(ReceiptVat) private receiptVat: ReceiptVat;

    public internalComment: FormControl = new FormControl();
    public externalComment: FormControl = new FormControl();
    public companySettings: CompanySettings;
    public vatReportSummary: VatReportSummary[];
    public vatReportSummaryFromPreviousPeriods: VatReportSummary[];
    public previousPeriodsHelpText: string;
    public reportSummaryPerPost: VatReportSummaryPerPost[];
    public reportMessages: VatReportMessage[];
    public currentVatReport: VatReport = new VatReport();
    public vatTypes: VatType[] = [];
    public isBusy: boolean = true;
    public isHistoricData: boolean = false;
    public actions: IUniSaveAction[];
    public statusCodePeriod: string;
    private statusText: string;
    private subs: Subscription[] = [];
    private vatReportsInPeriod: VatReport[];
    public contextMenuItems: IContextMenuItem[] = [];
    public toolbarconfig: IToolbarConfig;
    private periodDateFormat: PeriodDateFormatPipe;
    private defaultPaymentStatus: string = 'Ikke betalt';
    public paymentStatus: string;
    public submittedDate: Date;
    public approvedDate: Date;
    public hasTooltipToShow = false;
    public activeTabIndex: number = 1;
    public tabs: IUniTab[] = [
        {name: 'Kontroll'},
        {name: 'MVA-melding'},
        {name: 'Altinn, kvittering/tilbakemelding', disabled: true},
        {name: 'Oppgjørsbilag', disabled: true},
    ];
    public statusCodeClassName: string;
    constructor(
        private tabService: TabService,
        private companySettingsService: CompanySettingsService,
        private vatReportService: VatReportService,
        private vatTypeService: VatTypeService,
        private toastService: ToastService,
        private altinnAuthenticationService: AltinnAuthenticationService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private router: Router,
        private statisticsService: StatisticsService
    ) {
        this.periodDateFormat = new PeriodDateFormatPipe(this.errorService);
        this.tabService.addTab({
            name: 'MVA melding',
            url: '/accounting/vatreport',
            active: true,
            moduleID: UniModules.VatReport
        });

        this.contextMenuItems = [
            {
                label: 'Vis tidligere MVA meldinger',
                action: () => {
                    this.showList();
                }
            }
        ];

        this.vatReportService.refreshVatReport$.subscribe((vatReport: VatReport) => {
            if (this.currentVatReport) {
                this.updateToolbar();
            }
        } /* No error handling necessary, can't produce errors */);
    }

    private updateToolbar() {
        let journalEntryNumber;
        let journalEntryID;
        let year;

        if (this.currentVatReport && this.currentVatReport.JournalEntry) {
            if (this.currentVatReport.JournalEntry.JournalEntryNumber) {
                year = this.currentVatReport.JournalEntry.JournalEntryNumber.split('-')[1];
                journalEntryNumber = this.currentVatReport.JournalEntry.JournalEntryNumber.split('-')[0];
            } else {
                year = new Date().getFullYear();
            }

            journalEntryID = this.currentVatReport.JournalEntryID;
        }

        const journalEntryLink = journalEntryNumber
            ? `/#/accounting/transquery?JournalEntryNumber=${journalEntryNumber}&AccountYear=${year}`
            : '/#/accounting/transquery';

        this.toolbarconfig = {
            title: this.currentVatReport.TerminPeriod ? 'Termin ' + this.currentVatReport.TerminPeriod.No : '',
            subheads: [
                {
                    title: this.currentVatReport.Title
                        + ', ' + this.periodDateFormat.transform(this.currentVatReport.TerminPeriod)
                },
                {
                    title: journalEntryID ? 'Bokført på bilagnr: ' + journalEntryNumber : 'Ikke Bokført',
                    link: journalEntryLink
                }

            ],
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.onBackPeriod.bind(this),
                next: this.onForwardPeriod.bind(this),
            },
            contextmenu: this.contextMenuItems,
            entityID: this.currentVatReport.ID,
            entityType: 'VatReport'
        };
    }

    private getStatustrackConfig() {
        const statustrack: IStatus[] = [];
        const activeStatus = this.currentVatReport.StatusCode;

        this.vatReportService.statusTypes.forEach((status) => {
            let _state: STATUSTRACK_STATES;

            if (status.Code > activeStatus) {
                _state = STATUSTRACK_STATES.Future;
            } else if (status.Code < activeStatus) {
                _state = STATUSTRACK_STATES.Completed;
            } else if (status.Code === activeStatus) {
                if (this.currentVatReport && this.vatReportsInPeriod && this.vatReportsInPeriod.length > 0 &&
                    this.currentVatReport.ID !== this.vatReportsInPeriod[this.vatReportsInPeriod.length - 1].ID) {
                    _state = STATUSTRACK_STATES.Obsolete;
                } else {
                    _state = STATUSTRACK_STATES.Active;
                }
            }

            let addStatus: boolean = true;

            if (status.Code === StatusCodeVatReport.Rejected) {
                if (activeStatus !== status.Code) {
                    addStatus = false;
                }
            }
            const subStatusList: IStatus[] = [];
            if (this.vatReportsInPeriod) {
                this.vatReportsInPeriod.forEach(report => {
                    subStatusList.push({
                        title: report.Title,
                        state:  report.ID === this.currentVatReport.ID
                            ? STATUSTRACK_STATES.Active
                            : STATUSTRACK_STATES.Obsolete,
                        timestamp: report.ExecutedDate
                            ? new Date(<any> report.ExecutedDate)
                            : null,
                        data: report,
                        selectable: true
                    });
                });
            }


            if (addStatus) {
                statustrack.push({
                    title: status.Text,
                    state: _state,
                    code: status.Code,
                    substatusList: subStatusList,
                });
            }
        });
        return statustrack;
    }

    public setVatReportFromEvent(event) {
        if (!event[0] || !event[0].data) { return; }
        this.setVatreport(event[0].data);
    }

    public ngOnInit() {
        this.companySettingsService.Get(1, ['CompanyBankAccount'])
            .subscribe(settings => this.companySettings = settings, err => this.errorService.handle(err));

        this.spinner(this.vatReportService.getCurrentPeriod())
            .subscribe((vatReport) => this.setVatreport(vatReport)
            , err => this.errorService.handle(err));

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

        this.vatTypeService.GetVatTypesWithVatReportReferencesAndVatCodeGroup()
            .subscribe(
                vatTypes => this.vatTypes = vatTypes,
                err => this.errorService.handle(err)
            );


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
            label: 'Betale MVA',
            action: (done) => this.payVatReport(done),
            disabled: this.IsPayActionDisabled(),
            main: !this.IsPayActionDisabled()
        });

        this.actions.push({
            label: 'Opprett endringsmelding ',
            action: (done) => this.createCorrectiveVatReport(done),
            disabled: this.IsCreateCorrectionMessageAcionDisabled(),
            main: !this.IsCreateCorrectionMessageAcionDisabled()
        });

        this.actions.push({
            label: 'Godkjenn manuelt',
            action: (done) => this.approveManually(done),
            disabled: this.IsSendActionDisabled() && this.IsSignActionDisabled()
        });

        this.actions.push({
            label: 'Angre kjøring',
            action: (done) => this.UndoExecution(done),
            disabled: this.IsUndoActionDisabled()
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
    private IsPayActionDisabled() {
        if (this.paymentStatus === this.defaultPaymentStatus && this.currentVatReport.StatusCode === StatusCodeVatReport.Approved &&
            (this.currentVatReport.VatReportArchivedSummary || (this.currentVatReport.VatReportArchivedSummaryID && this.currentVatReport.VatReportArchivedSummaryID > 0))) {
            return false;
        }
        return true;
    }
    public IsApproveActionDisabled() {
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
    private IsUndoActionDisabled() {
        if (this.currentVatReport.StatusCode === null ||
            this.currentVatReport.StatusCode === 0  ||
            this.currentVatReport.StatusCode === StatusCodeVatReport.Cancelled) {
            return true;
        }
        return false;
    }

    private setVatreport(vatReport: VatReport) {
        this.currentVatReport = vatReport;
        this.vatReportService.refreshVatReport(this.currentVatReport);
        this.getStatusDates(vatReport.ID);

        this.tabs[2].disabled = !this.currentVatReport.ExternalRefNo || !this.isSent();
        this.tabs[3].disabled = !this.currentVatReport.JournalEntryID;
        this.tabs = [...this.tabs];

        this.vatReportSummary = null;
        this.vatReportService.getVatReportSummary(vatReport.ID, vatReport.TerminPeriodID)
            .subscribe(
            data => {
                this.vatReportSummary = data;
                this.vatReportService.getVatReportSummaryFromPreviousPeriods(vatReport.ID, vatReport.TerminPeriodID)
                    .subscribe(
                        dataPrevious => {
                            this.vatReportSummaryFromPreviousPeriods = dataPrevious;
                            if (this.vatReportSummaryFromPreviousPeriods.length > 0) {
                                this.previousPeriodsHelpText = 'Akkumulert fra tidligere perioder: '
                                +  (dataPrevious[0].SumTaxBasisAmount * -1).toFixed(2);
                            } else {
                                this.previousPeriodsHelpText = '';
                            }
                            this.hasTooltipToShow = data.reduce((prev, current) => {
                                if (prev) {
                                    return prev;
                                }
                                return current.VatCodeGroupNo === 'A' && this.vatReportSummaryFromPreviousPeriods.length > 0;
                            }, false);
                        },
                        errPrevious => this.errorService.handle(errPrevious)
                    );
                if (data !== null && data.length > 0) {
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
            data => {
                this.reportMessages = data;
                const tab = this.tabs[0];
                if (this.isControlledWithoutWarnings()) {
                    if (tab.tooltip) {
                        delete tab.tooltip;
                        delete tab.tooltipIcon;
                        delete tab.tooltipClass;
                        this.tabs = [].concat(this.tabs);
                    }
                } else {
                    tab.tooltip = 'Automatisk kontroll har advarsler';
                    tab.tooltipIcon = 'error';
                    tab.tooltipClass = 'warn';
                    this.tabs = [].concat(this.tabs);
                }
            },
            err => this.errorService.handle(err)
            );
        this.updateStatusText();
        this.getVatReportsInPeriod();
        this.vatReportService.getPaymentStatus(vatReport.ID, this.defaultPaymentStatus)
            .subscribe((res) => {
                this.paymentStatus = res;
                this.updateSaveActions();
            });
    }

    private getVatReportsInPeriod() {
        // Get list of credit notes for an invoice
        this.vatReportService.GetAll(
            `filter=TerminPeriodID eq ${this.currentVatReport.TerminPeriodID}&expand=JournalEntry`
        )
            .subscribe((response: VatReport[]) => {
                this.vatReportsInPeriod = response;
                if (this.currentVatReport) {
                    this.updateToolbar();
                }
            }, err => this.errorService.handle(err));
    }

    private getStatusDates(vatReportID: number) {
        Observable.forkJoin(
            this.statisticsService.GetAll(
                    `model=AuditLog&orderby=AuditLog.CreatedAt&filter=AuditLog.EntityID eq `
                    + `${vatReportID} and EntityType eq 'VatReport' and Field eq 'StatusCode' and NewValue eq '32002'`
                    + `&select=Auditlog.CreatedAt as Date`
                ),
            this.statisticsService.GetAll(
                    `model=AuditLog&orderby=AuditLog.CreatedAt&filter=AuditLog.EntityID eq `
                    + `${vatReportID} and EntityType eq 'VatReport' and Field eq 'StatusCode' and NewValue eq '32004'`
                    + `&select=Auditlog.CreatedAt as Date`
                )
        )
        .subscribe((responses) => {
            const submits: Array<any> = responses[0].Data ? responses[0].Data : [];
            const approvals: Array<any> = responses[1].Data ? responses[1].Data : [];
            this.submittedDate = submits.length > 0 ? submits[0].Date : null;
            this.approvedDate = approvals.length > 0 ? approvals[0].Date : null;
        });
    }

    private updateStatusText() {
        this.statusText = this.vatReportService.getStatusText(this.currentVatReport.StatusCode);
        this.vatReportService.getPeriodStatus(this.currentVatReport.TerminPeriodID)
            .subscribe((status) => {
                this.statusCodePeriod = status ? this.vatReportService.getStatusText(status.StatusCode) + ' (' + status.Title + ')' : 'Ikke kjørt';
                this.statusCodeClassName = status ? this.vatReportService.getStatusClassName(status.StatusCode) : '';
            }, err => this.errorService.handle(err));
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
        this.modalService.open(HistoricVatReportModal).onClose.subscribe(vatReport => {
            if (vatReport && vatReport.ID) {
                this.historicVatReportSelected(vatReport);
            }
        });
    }

    public historicVatReportSelected(vatReport: VatReport) {
        if (!vatReport) {
            this.toastService.addToast(
                'Kunne ikke vise MVA-melding',
                ToastType.bad, 200,
                'vatReport er tom'
            );
        } else {
            this.setVatreport(vatReport);
        }
    }

    public vatReportDidChange(vatReport: VatReport) {
        this.setVatreport(vatReport);
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
                        && confirm(
                            `Det er ført bilag i perioden som ikke er med i noen MVA meldinger.`
                            + ` Dette gjelder ${data.NumberOfJournalEntryLines} `
                            + `bilag (totalt kr. ${data.SumVatAmount} i MVA).`
                            + '\n\nTrykk avbryt og kjør rapporten på ny hvis du vil ha med disse bilagene'
                        )
                    )
                ) {
                    this.vatReportService.sendReport(this.currentVatReport.ID)
                        .subscribe(() => {
                            this.vatReportService.Get(
                                this.currentVatReport.ID,
                                ['TerminPeriod', 'JournalEntry', 'VatReportArchivedSummary']
                            )
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
        let authData;
        this.modalService
            .open(AltinnAuthenticationModal)
            .onClose
            .filter(auth => !!auth)
            .do(auth => authData = auth)
            .switchMap(() => this.vatReportService.getSigningText(this.currentVatReport.ID, authData))
            .subscribe(text => {
                this.modalService.open(UniConfirmModalV2, {
                    header: 'Vennligst bekreft',
                    message: text.SigningText,
                    buttonLabels: {
                        accept: 'Bekreft',
                        cancel: 'Avbryt'
                    }
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.vatReportService.signReport(this.currentVatReport.ID, authData)
                            .subscribe((signing: AltinnSigning) => {
                                if (signing.StatusCode === StatusCodeAltinnSigning.Failed) {
                                    // error occured while signing - not technical error
                                    this.toastService.addToast('Feil oppsto', ToastType.bad, 0, signing.StatusText);
                                    done('Feil ved signering');
                                } else {
                                    this.vatReportService.Get(
                                        this.currentVatReport.ID,
                                        ['TerminPeriod', 'JournalEntry', 'VatReportArchivedSummary'])
                                        .subscribe(vatreport => {
                                            this.setVatreport(vatreport);
                                            this.activeTabIndex = 2;

                                            this.toastService.addToast('Signert OK', ToastType.good);
                                            done('Signert OK');

                                            // check for receipt, this should be ready now, but
                                            // use setTimeout to allow angular to switch views first
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
                            });
                    } else {
                        done('Signering avbrutt');
                    }
                });
            },
            err => {
                // something is not working with the altinnauthentication it seems, clear the pincode to make
                // the user log in again
                if (err.status === 403) {
                    console.log('nullstiller pin');
                    authData.pin = '';
                    this.altinnAuthenticationService.storeAltinnAuthenticationDataInLocalstorage(authData);
                }

                this.errorService.handle(err);
                done('Det skjedde en feil, forsøk igjen senere');
            });
    }


    public payVatReport(done) {
        this.vatReportService.payVat(this.currentVatReport.ID).subscribe(res => {
            this.spinner(this.vatReportService.getPaymentStatus(this.currentVatReport.ID, this.defaultPaymentStatus))
            .subscribe((res) => {
                this.paymentStatus = res;
                this.updateSaveActions();
            });
            done('Betaling utført');
        },
        err => {
            this.errorService.handle(err);
            done('Det skjedde en feil ved betaling av MVA')
        });
    }


    public UndoExecution(done) {
       if (this.currentVatReport.StatusCode !== StatusCodeVatReport.Executed) {
            if (confirm(
                'Mva-meldingen blir ikke slettet fra Altinn, dette vil kun være en sletting av alle MVA-meldinger som finnes i systemet på denne terminen. Korrigert melding MÅ sendes inn til Altinn når du er ferdig med korrigeringene.'
            )) {
                this.UndoExecutionPeriod(done);
            } else {
                done('Angre kjøring avbrutt');
            }
        } else {
            this.UndoExecutionReport(done);
        }
    }

    public UndoExecutionReport(done) {
        this.vatReportService.undoReport(this.currentVatReport.ID)
        .subscribe(res => {
            this.spinner(this.vatReportService.getCurrentPeriod())
            .subscribe(vatReport => this.setVatreport(vatReport), err => this.errorService.handle(err));
            done();
        },
        err => {
            this.errorService.handle(err);
            done('Det skjedde en feil, forsøk igjen senere');
        }
        );
    }

    public UndoExecutionPeriod(done) {
        this.vatReportService.undoPeriod(this.currentVatReport.TerminPeriodID)
        .subscribe(res => {
            this.spinner(this.vatReportService.getCurrentPeriod())
            .subscribe(vatReport => this.setVatreport(vatReport), err => this.errorService.handle(err));
            done();
        },
        err => {
            this.errorService.handle(err);
            done('Det skjedde en feil, forsøk igjen senere');
        }
        );
    }


    public approveManually(done) {
        if (confirm(
            'Er du sikker på at du vil godkjenne manuelt? Det er normalt bedre å bruke signering hvis mulig'
        )) {

            const transName = this.currentVatReport.StatusCode === 32002 ? 'setToApproved' : 'approveManually';
            this.vatReportService.Transition(this.currentVatReport.ID, this.currentVatReport, transName)
                .subscribe(() => {
                    this.vatReportService.Get(
                        this.currentVatReport.ID,
                        ['TerminPeriod', 'JournalEntry', 'VatReportArchivedSummary']
                    )
                        .subscribe(vatreport => {
                            this.setVatreport(vatreport);
                            done('Godkjent manuelt');
                        },
                        err => {
                            done('Feilet å hente vatreport');
                            this.errorService.handle(err);
                        });
                },
                err => {
                    done('Manuell godkjenning feilet');
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
                    this.vatReportService.Get(
                        modalData.id,
                        ['TerminPeriod', 'JournalEntry', 'VatReportArchivedSummary']
                    )
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
            return this.reportMessages
                .every(message => message.Level === ValidationLevel.Info);
        }
    }

    public vatReportSummaryToVatCodeAndAccountNumbers(vatReportSummary: VatReportSummary): string {
        const vatTypes = this.vatTypes;

        // build string containing combination of vatcode and accountnumber for this vatpost, the result
        // will e.g. be "1|2711,3|2710,5|2702,..."

        const vatCodesAndAccountNos: Array<string> = [];
        if (vatTypes) {
            vatTypes.forEach(vt => {
                const vatReportReferences = vt.VatReportReferences
                    .filter(vatReport => vatReport.VatPost.VatCodeGroupID === vatReportSummary.VatCodeGroupID);
                vatReportReferences
                    .forEach(vrr => vatCodesAndAccountNos.push(`${vt.VatCode}|${vrr.Account.AccountNumber}`));
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
