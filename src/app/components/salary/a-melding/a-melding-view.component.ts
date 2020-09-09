import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { Observable, of } from 'rxjs';
import { ToastService, ToastTime, ToastType, IToastAction } from '@uni-framework/uniToast/toastService';
import { AmeldingData, AmeldingType, CompanySalary, InternalAmeldingStatus, AmeldingSumUp, AmeldingEntity } from '@uni-entities';
import { IContextMenuItem } from '@uni-framework/ui/unitable/index';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig, IToolbarSearchConfig } from '../../common/toolbar/toolbar';
import { IStatus, STATUSTRACK_STATES } from '../../common/toolbar/statustrack';
import {
    CompanySalaryService,
    ErrorService,
    FinancialYearService,
    NumberFormat,
    PageStateService,
    SharedPayrollRunService,
    ReportDefinitionService,
    AltinnAuthenticationService
} from '@app/services/services';
import { UniModalService, UniPreviewModal } from '@uni-framework/uni-modal';
import { AMeldingTypePickerModalComponent, IAmeldingTypeEvent } from './modals/a-melding-type-picker-modal.component';
import { AltinnAuthenticationModal } from '../../common/modals/AltinnAuthenticationModal';
import * as moment from 'moment';
import { AltinnAuthenticationData } from '@app/models/AltinnAuthenticationData';
import { IUniTab } from '@uni-framework/uni-tabs';
import { PeriodAdminModalComponent } from './modals/period-admin-modal/period-admin-modal.component';
import {
    StatusAMeldingModalComponent
} from '@app/components/salary/a-melding/modals/status-a-melding-modal/status-a-melding-modal.component';
import { MakeAmeldingPaymentModalComponent } from '@app/components/salary/a-melding/modals/make-a-melding-payment-modal/make-a-melding-payment-modal.component';
import { RequestMethod } from '@uni-framework/core/http';
import { ReconciliationModalComponent } from './reconciliation-modal/reconciliation-modal.component';
import { tap, filter, switchMap } from 'rxjs/operators';
import { ITaxAndAgaSums, SalarySumsService } from '@app/components/salary/shared/services/salary-transaction/salary-sums.service';
import { AMeldingService } from '@app/components/salary/a-melding/shared/service/a-melding.service';
import { PayrollRunService } from '@app/components/salary/shared/services/payroll-run/payroll-run.service';

@Component({
    selector: 'amelding-view',
    templateUrl: './a-melding-view.component.html'
})

export class AMeldingViewComponent implements OnInit {
    public busy: boolean = true;
    public initialized: boolean;
    public currentPeriod: number;
    public currentMonth: string;
    public currentSumsInPeriod: ITaxAndAgaSums;
    public currentAMelding: AmeldingData;
    public currentSumUp: any;
    public aMeldingerInPeriod: AmeldingData[];
    public actions: IUniSaveAction[];
    public clarifiedDate: string = '';
    public submittedDate: string = '';
    public feedbackObtained: boolean = false;
    public validationErrorMessage: string;

    public totalAGAFeedback: number = 0;
    public totalAGAFeedBackStr: string;
    public totalAGASystem: number = 0;
    public totalAGASystemStr: string;
    public totalFtrekkFeedback: number = 0;
    public totalFtrekkFeedbackStr: string;
    public totalFtrekkSystem: number = 0;
    public totalFtrekkSystemStr: string;
    public totalGarnishmentFeedback: number = 0;
    public totalGarnishmentFeedbackStr: string;
    public totalGarnishmentSystem: number = 0;
    public totalGarnishmentSystemStr: string;
    public totalFinancialSystem: number = 0;
    public totalFinancialSystemStr: string;
    public totalFinancialFeedback: number = 0;
    public totalFinancialFeedbackStr: string;


    public legalEntityNo: string = '';
    private saveStatus: { numberOfRequests: number, completeCount: number, hasErrors: boolean };
    public toolbarConfig: IToolbarConfig;
    public toolbarSearchConfig: IToolbarSearchConfig;
    public periodStatus: string;
    public ameldingStatus: string;
    private alleAvvikStatuser: any[] = [];
    private activeYear: number;
    public companySalary: CompanySalary;
    public showFinanceTax: boolean;
    public showGarnishment: boolean = false;
    public triggerForOpenBeforeMakePaymentModalResolver = null;
    public activeTabIndex: number = 0;
    public tabs: IUniTab[] = [
        { name: 'Oppsummering', tooltip: this._ameldingService.getHelptext('summary') },
        { name: 'Arbeidsgiveravgift', tooltip: this._ameldingService.getHelptext('aga') },
        { name: 'Tilbakemelding', tooltip: this._ameldingService.getHelptext('receipt') },
        { name: 'Periodeoppsummering', tooltip: this._ameldingService.getHelptext('period') }
    ];

    public contextMenuItems: IContextMenuItem[] = [
        {
            label: 'Hent a-meldingsfil',
            action: () => {
                this.getAmeldingZipFile();
            },
            disabled: () => !this.currentAMelding
        },
        {
            label: 'Hent tilbakemeldingsfil',
            action: () => {
                this.getFeedbackFile();
            },
            disabled: () => {
                return this.currentAMelding ? this.currentAMelding.status <= 2 : true;
            }
        },
        {
            label: 'Tilleggsopplysninger',
            action: () => this.router.navigate(['salary/supplements'])
        },
        {
            label: 'Trekk og AGA rapport',
            action: () => this.openReport()
        },
        {
            label: 'Avstemming',
            action: () => this.openReconciliation()
        },
        {
            label: 'Avansert periodebehandling',
            action: () => this.openAdminModal()
        },
        {
            label: 'Betal f.trekk og aga',
            action: () => this.openMakePaymentModal(),
            disabled: () => {
                return !this.periodStatus
                    || this.periodStatus.toLowerCase().includes('må hentes')
                    || this.periodStatus.toLowerCase().includes('ingen a-meldinger i perioden')
                    || this.periodStatus.toLowerCase().includes('øyeblikkelig')
                    || this.periodStatus.toLowerCase().includes('avvist');
            }
        }
    ];

    constructor(
        private _tabService: TabService,
        private _ameldingService: AMeldingService,
        private _toastService: ToastService,
        private _salarySumsService: SalarySumsService,
        private financialYearService: FinancialYearService,
        private numberformat: NumberFormat,
        private router: Router,
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private reportDefinitionService: ReportDefinitionService,
        private companySalaryService: CompanySalaryService,
        private pageStateService: PageStateService,
        private altinnAuthService: AltinnAuthenticationService,
        private payrollRunService: PayrollRunService,
    ) {
        this.companySalaryService.getCompanySalary()
            .subscribe(compSalary => {
                this.companySalary = compSalary;
                this.showFinanceTax = compSalary.CalculateFinancialTax;
            });
    }

    public addTab() {

        this.pageStateService.setPageState('tabindex', this.activeTabIndex + '');
        this.pageStateService.setPageState('periode', this.currentPeriod + '');

        this._tabService.addTab({
            name: 'A-melding',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.Amelding,
            active: true
        });
    }

    public ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.activeTabIndex = +params['tabindex'] || 0;
            this.currentPeriod = +params['periode'];
            this.financialYearService.lastSelectedFinancialYear$.subscribe(year => {
                this.clearAMelding();
                this.loadYearData();
            });
            this.addTab();
        });
    }

    private informAboutFastAnsatt() {
        const reminded = localStorage.getItem('fastansatt_notificaton');
        if ((!reminded || reminded === 'false') && (this.activeYear === 2021 && this.currentPeriod <= 3)) {
            const toastAction = { label : 'Ikke minn meg igjen', displayInHeader : true,
                click : () => { localStorage.setItem('fastansatt_notificaton', 'true'); } };

            this._toastService.addToast('Alle ansatte har fått ansattform fast ansatt', ToastType.info, 20,
                'Fra a-melding for januar 2021 må alle arbeidsforhold innrapporteres med ansettelsesform. Alle aktive arbeidsforhold på dette firmaer er registrert med fast ansettelsesform. Dersom korrekt innrapportering er midlertidig ansettelsesform må dette endres på arbeidsforholdet.', 
                toastAction );
        }
    }


    private openReport() {
        this.reportDefinitionService
            .getReportByName('Forskuddstrekk og arbeidsgiveravgift')
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe((report) => {
                report.parameters = [
                    {
                        Name: 'FromPeriod',
                        value: this.currentPeriod
                    },
                    {
                        Name: 'ToPeriod',
                        value: this.currentPeriod
                    },
                    {
                        Name: 'Year',
                        value: this.activeYear
                    }
                ];

                this.modalService.open(UniPreviewModal, {
                    data: report
                });
            });
    }

    private openReconciliation() {
        this.modalService
            .open(ReconciliationModalComponent, {});
    }

    private loadYearData() {
        this.activeYear = this.financialYearService.getActiveYear();

        // Dont get periode if periode is set as queryparams
        if (!this.currentPeriod) {
            this.payrollRunService.getLatestSettledPeriod(1, this.activeYear)
                .subscribe(period => {
                    this.currentPeriod = period;
                    this.currentMonth = moment.months()[this.currentPeriod - 1];
                    this.getSumsInPeriod();
                    this.getAMeldingForPeriod();
                    this.updateToolbar();
                    this.informAboutFastAnsatt();
                }, err => this.errorService.handle(err));
        } else {
            this.currentMonth = moment.months()[this.currentPeriod - 1];
            this.getSumsInPeriod();
            this.getAMeldingForPeriod();
            this.updateToolbar();
            this.informAboutFastAnsatt();
        }
    }

    public prevPeriod() {
        if (this.currentPeriod !== 1) {
            if (this.currentPeriod > 1) {
                this.currentPeriod -= 1;
                this.currentMonth = moment.months()[this.currentPeriod - 1];
            }
            this.clearAMelding();
            this.getAMeldingForPeriod();
            this.activeTabIndex = 0;
            this.addTab();
        }
    }

    public nextPeriod() {
        if (this.currentPeriod !== 12) {
            if (this.currentPeriod < 12) {
                this.currentPeriod += 1;
                this.currentMonth = moment.months()[this.currentPeriod - 1];
            }
            this.clearAMelding();
            this.getAMeldingForPeriod();
            this.activeTabIndex = 0;
            this.addTab();
        }
    }

    public gotoPeriod(period: number) {
        if (!isNaN(period) && (period >= 1 && period <= 12)) {
            this.currentPeriod = period;
            this.currentMonth = moment.months()[this.currentPeriod - 1];
            this.clearAMelding();
            this.getAMeldingForPeriod();
            this.activeTabIndex = 0;
            this.addTab();
        }
    }

    public getAmeldingZipFile() {
        if (!this.currentAMelding) {
            return;
        }
        this._ameldingService
            .getAMeldingFile(this.currentAMelding.ID)
            .subscribe(amldfile => {
                const a = document.createElement('a');
                const dataURI = 'data:application/zip;base64,' + amldfile;
                a.href = dataURI;
                const prd: string = this.currentPeriod < 10
                    ? '0' + this.currentPeriod.toString()
                    : this.currentPeriod.toString();
                a['download'] = `amelding_${prd}_${this.currentAMelding.ID}.zip`;

                const e = document.createEvent('MouseEvents');
                e.initMouseEvent(
                    'click', true, false, document.defaultView,
                    0, 0, 0, 0, 0, false, false, false, false, 0, null
                );

                a.dispatchEvent(e);
                a.remove();
            });
    }

    public getFeedbackFile() {
        if (this.currentAMelding) {
            this._ameldingService.getAmeldingFeedbackFile(this.currentAMelding.ID)
                .subscribe(feedbackfile => {
                    const a = document.createElement('a');
                    const dataURI = 'data:application/zip;base64,' + feedbackfile;
                    a.href = dataURI;
                    const prd: string = this.currentPeriod < 10
                        ? '0' + this.currentPeriod.toString()
                        : this.currentPeriod.toString();
                    a['download'] = `tilbakemelding_${prd}_${this.currentAMelding.ID}.zip`;

                    const e = document.createEvent('MouseEvents');
                    e.initMouseEvent(
                        'click', true, false, document.defaultView,
                        0, 0, 0, 0, 0, false, false, false, false, 0, null
                    );

                    a.dispatchEvent(e);
                    a.remove();
                },
                    err => this.errorService.handle(err));
        }
    }

    public createAMelding(event: IAmeldingTypeEvent) {
        this.saveStatus.numberOfRequests++;
        this._ameldingService.postAMelding(this.currentPeriod, event.type, this.activeYear)
            .subscribe(response => {
                this.saveStatus.completeCount++;
                this.updateAMeldingerInPeriod(response);
                this.refresh(response);
                this.checkForSaveDone(event.done);
                this._toastService.addToast('A-melding generert', ToastType.good, 4);
            },
                (err) => {
                    this.errorService.handle(err);
                    this.saveStatus.completeCount++;
                    this.saveStatus.hasErrors = true;
                    this.checkForSaveDone(event.done);
                    this._toastService.addToast('Generering av A-melding feilet', ToastType.warn, 6);
                });
    }

    public getAmldWithFeedback(amldID: number, validate: boolean = false) {
        this._ameldingService
            .getAMeldingWithFeedback(amldID, validate)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe((amldWithFeedback: AmeldingData) => {
                this.refresh(amldWithFeedback);
            });
    }

    public refresh(amelding: AmeldingData) {
        this.currentAMelding = amelding;
        this.getSumsInPeriod();
        this.getSumUpForAmelding();
        this.clarifiedDate = moment(this.currentAMelding.created).format('DD.MM.YYYY HH:mm');
        if (this.currentAMelding.sent) {
            this.submittedDate = moment(this.currentAMelding.sent).format('DD.MM.YYYY HH:mm');
        } else {
            this.submittedDate = '';
        }
        if (this.currentAMelding.feedbackFileID) {
            this.feedbackObtained = true;
        } else {
            this.feedbackObtained = false;
        }
        this.updateToolbar();
        this.updateSaveActions();
        this.setStatusForPeriod();
        this.initialized = true;
    }

    private getSumsInPeriod() {
        this._salarySumsService
            .getSumsFromPeriod(this.currentPeriod, this.currentPeriod, this.activeYear)
            .subscribe((currentSumsInPeriod) => {
                this.currentSumsInPeriod = currentSumsInPeriod;
                this.totalAGAFeedback = 0;
                this.totalFtrekkFeedback = 0;
                this.totalGarnishmentFeedback = 0;
                this.totalFinancialFeedback = 0;
                this.totalFtrekkFeedbackStr = this.numberformat.asMoney(this.totalFtrekkFeedback, { decimalLength: 0 });
                this.totalGarnishmentFeedbackStr = this.numberformat.asMoney(this.totalGarnishmentFeedback, { decimalLength: 0 });
                this.totalAGAFeedBackStr = this.numberformat.asMoney(this.totalAGAFeedback, { decimalLength: 0 });
                this.totalFinancialFeedbackStr = this.numberformat.asMoney(this.totalFinancialFeedback, { decimalLength: 0 });
                if (!!this.currentAMelding) {
                    if (this.currentAMelding.hasOwnProperty('feedBack')) {
                        if (this.currentAMelding['feedBack'] !== null) {
                            const alleMottak = this.currentAMelding['feedBack'].melding.Mottak;
                            if (alleMottak instanceof Array) {
                                alleMottak.forEach(mottak => {
                                    const pr = mottak.kalendermaaned;
                                    const period = parseInt(pr.split('-').pop(), 10);
                                    if ((period === this.currentAMelding.period)
                                        && (parseInt(pr.substring(0, pr.indexOf('-')), 10) === this.currentAMelding.year)) {
                                        if (mottak && mottak.hasOwnProperty('mottattPeriode')) {
                                            const periode = mottak.mottattPeriode;
                                            this.getTotalAGAAndFtrekk(periode);
                                        }
                                    }
                                });
                            } else {
                                if (alleMottak.hasOwnProperty('kalendermaaned')) {
                                    const pr = alleMottak.kalendermaaned;
                                    const period = parseInt(pr.split('-').pop(), 10);
                                    if ((period === this.currentAMelding.period)
                                        && (parseInt(pr.substring(0, pr.indexOf('-')), 10) === this.currentAMelding.year)) {
                                        if (alleMottak && alleMottak.hasOwnProperty('mottattPeriode')) {
                                            const periode = alleMottak.mottattPeriode;
                                            this.getTotalAGAAndFtrekk(periode);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                this.totalAGASystem = 0;
                this.totalFtrekkSystem = 0;
                this.totalGarnishmentSystem = 0;
                this.totalFinancialSystem = 0;

                this.totalFtrekkSystem = currentSumsInPeriod.WithholdingTax;
                this.totalFinancialSystem = currentSumsInPeriod.FinancialTax;
                this.totalAGASystem = this._salarySumsService.getAgaSum(currentSumsInPeriod.Aga);

                this.totalAGASystemStr = this.numberformat.asMoney(this.totalAGASystem, { decimalLength: 0 });
                this.totalFtrekkSystemStr = this.numberformat.asMoney(this.totalFtrekkSystem, { decimalLength: 0 });
                this.totalFinancialSystemStr = this.numberformat.asMoney(this.totalFinancialSystem, { decimalLength: 0 });
            }, err => this.errorService.handle(err));
    }

    private updateToolbar() {
        this.toolbarConfig = {
            title: `Periode ${this.currentPeriod}`,
            navigation: {
                prev: this.prevPeriod.bind(this),
                next: this.nextPeriod.bind(this)
            },
            statustrack: this.getStatusTrackConfig()
        };

        this.toolbarSearchConfig = {
            initValue: `${this.currentPeriod} - ${this.currentMonth}`,
            lookupFunction: (searchVal) => {
                const filtered = this._ameldingService.periodsInYear().filter(period => {
                    return period.period === +searchVal
                        || (period.name.toLowerCase()).indexOf(searchVal.toLowerCase()) >= 0;
                });

                return Observable.of(filtered);
            },
            itemTemplate: period => `${period.period} - ${period.name}`,
            onSelect: period => this.gotoPeriod(period.period)
        };
    }

    public getStatusTrackConfig() {
        const statustrack: IStatus[] = [];
        const activeStatus = this.currentAMelding ? (this.currentAMelding.status ? this.currentAMelding.status : 1) : 0;
        this._ameldingService.internalAmeldingStatus.forEach((amldStatus, indx) => {
            let _state: STATUSTRACK_STATES;
            const _substatuses: IStatus[] = [];
            if (amldStatus.Code > activeStatus) {
                _state = STATUSTRACK_STATES.Future;
            } else if (amldStatus.Code < activeStatus) {
                _state = STATUSTRACK_STATES.Completed;
            } else if (amldStatus.Code === activeStatus) {

                if (!!this.currentAMelding && this.currentAMelding.ID === this.aMeldingerInPeriod[this.aMeldingerInPeriod.length - 1].ID) {
                    _state = STATUSTRACK_STATES.Active;
                } else {
                    // If we're not on the last of the A-meldings in the period, we'll assume the data is obsolete.
                    _state = STATUSTRACK_STATES.Obsolete;
                }

                if (this.aMeldingerInPeriod && this.aMeldingerInPeriod.length > 1) {
                    this.aMeldingerInPeriod.forEach(amelding => {
                        _substatuses.push({
                            title: 'A-melding ' + amelding.ID,
                            state: amelding.ID === this.currentAMelding.ID
                                ? STATUSTRACK_STATES.Active
                                : STATUSTRACK_STATES.Obsolete,
                            timestamp: amelding.UpdatedAt
                                ? new Date(<any>amelding.UpdatedAt)
                                : new Date(<any>amelding.CreatedAt),
                            data: amelding,
                            selectable: true
                        });
                    });
                }

            }

            statustrack[indx] = {
                title: amldStatus.Text,
                state: _state,
                substatusList: _substatuses
            };
        });

        return statustrack;
    }

    public setAmeldingFromEvent(event) {
        if (!event[0] || !event[0].data) { return; }
        this.getAmldWithFeedback(event[0].data.ID);
    }

    private updateAMeldingerInPeriod(newAMelding) {
        let regenerated: boolean;

        this.aMeldingerInPeriod.forEach(amelding => {
            if (amelding.ID === newAMelding.ID) {
                amelding = newAMelding;
                regenerated = true;
            }
        });

        if (!regenerated) {
            this.aMeldingerInPeriod.push(newAMelding);
        }
    }

    private replaceAmeldingInPeriod(melding) {
        const ind = this.aMeldingerInPeriod.findIndex(x => x.ID === melding.ID);
        if (ind >= 0) {
            this.aMeldingerInPeriod[ind] = melding;
        }
    }

    private getSumUpForAmelding() {
        if (!!this.currentAMelding && this.currentAMelding.ID === 0) {
            return;
        }
        this._ameldingService
            .getAmeldingSumUp(this.currentAMelding.ID)
            .subscribe((response) => {
                this.validationErrorMessage = this.validateAMelding(response);
                this.updateSaveActions();
                this.currentSumUp = response;
                if (this.currentSumUp.status === 3) {
                    this.currentSumUp._sumupStatusText = this.currentAMelding.altinnStatus; //  getAmeldingStatus();
                }
                this.showGarnishment = false;
                if (this.currentSumUp.totals?.sumUtleggstrekk) {
                    this.showGarnishment = true;
                    this.totalGarnishmentSystemStr =
                        this.numberformat.asMoney(this.currentSumUp.totals.sumUtleggstrekk, { decimalLength: 0 });
                }
                this.legalEntityNo = response.LegalEntityNo;
            }, err => this.errorService.handle(err));
    }

    private getTotalAGAAndFtrekk(mottattPeriode) {
        if (mottattPeriode && mottattPeriode.hasOwnProperty('mottattAvgiftOgTrekkTotalt')) {
            this.totalAGAFeedback = mottattPeriode.mottattAvgiftOgTrekkTotalt.sumArbeidsgiveravgift;
            this.totalAGAFeedBackStr = this.numberformat.asMoney(this.totalAGAFeedback, { decimalLength: 0 });
            this.totalFtrekkFeedback = mottattPeriode.mottattAvgiftOgTrekkTotalt.sumForskuddstrekk;
            this.totalFtrekkFeedbackStr = this.numberformat.asMoney(this.totalFtrekkFeedback, { decimalLength: 0 });
            if (mottattPeriode.mottattAvgiftOgTrekkTotalt.hasOwnProperty('sumFinansskattLoenn')) {
                this.totalFinancialFeedback = mottattPeriode.mottattAvgiftOgTrekkTotalt.sumFinansskattLoenn;
                this.totalFinancialFeedbackStr = this.numberformat.asMoney(this.totalFinancialFeedback, { decimalLength: 0 });
            }
            if (mottattPeriode.mottattAvgiftOgTrekkTotalt.hasOwnProperty('sumUtleggstrekk')) {
                this.totalGarnishmentFeedback = mottattPeriode.mottattAvgiftOgTrekkTotalt.sumUtleggstrekk;
                this.totalGarnishmentFeedbackStr = this.numberformat.asMoney(this.totalGarnishmentFeedback, { decimalLength: 0 });
            }
        }
    }

    private setStatusFromAvvik(avvikIamld: any[] = null) {
        let statusSet: boolean = false;
        const alleAvvik = avvikIamld != null ? avvikIamld : this.alleAvvikStatuser;
        alleAvvik.forEach(avvik => {
            if (!statusSet) {
                switch (avvik.alvorlighetsgrad) {
                    case 'oeyeblikkelig':
                        this.periodStatus = 'Mottatt med øyeblikkelig';
                        statusSet = true;
                        break;
                    case 'retningslinje':
                        this.periodStatus = 'Mottatt med retningslinje';
                        break;
                    case 'avvisning':
                        this.periodStatus = 'Avvisning';
                        break;

                    default:
                        break;
                }
            }
        });
        if (this.periodStatus === '') {
            this.periodStatus = 'Mottatt';
        }
    }

    private getAMeldingForPeriod() {

        this.periodStatus = 'Henter status...';

        this.spinner(this._ameldingService
            .getAMeldingForPeriod(this.currentPeriod, this.activeYear))
            .do(ameldinger => this.aMeldingerInPeriod = ameldinger.sort((a, b) => a.ID - b.ID))
            .finally(() => {
                if (this.aMeldingerInPeriod.length > 0) {
                    const current = this.aMeldingerInPeriod[this.aMeldingerInPeriod.length - 1];
                    this.getAmldWithFeedback(current.ID, current.status > 1 ? false : true);
                } else {
                    this.initialized = true;
                    this.updateToolbar();
                    this.updateSaveActions();
                    this.getSumsInPeriod();
                    this.periodStatus = 'Ingen a-meldinger i perioden';
                }
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe();
    }

    private setStatusForPeriod() {
        if (this.aMeldingerInPeriod.length === 1) {
            this.setPeriodStatusFromAmeldingStatus(this.currentAMelding);
            if (this.triggerForOpenBeforeMakePaymentModalResolver) {
                this.triggerForOpenBeforeMakePaymentModalResolver();
            }
        } else {
            this.getLastSentAmeldingWithFeedback();
        }
    }

    private getLastSentAmeldingWithFeedback() {
        // 2. if any with altinnstatus 'mottatt' set period-status from feedback
        let ameld: AmeldingData = new AmeldingData();
        for (let i = this.aMeldingerInPeriod.length - 1; i >= 0; i--) {
            if (this.aMeldingerInPeriod[i].status === 2) {
                ameld = this.aMeldingerInPeriod[i];
                this.setPeriodStatusFromAmeldingStatus(ameld);
                if (this.triggerForOpenBeforeMakePaymentModalResolver) {
                    this.triggerForOpenBeforeMakePaymentModalResolver();
                }
                return;
            }
            if (this.aMeldingerInPeriod[i].altinnStatus === 'mottatt') {
                ameld = this.aMeldingerInPeriod[i];
                break;
            }
        }
        if (!!ameld && ameld.altinnStatus === 'mottatt') {
            this._ameldingService
                .getAMeldingWithFeedback(ameld.ID)
                .subscribe((amld: AmeldingData) => {
                    this.setPeriodStatusFromAmeldingStatus(amld);
                    if (this.triggerForOpenBeforeMakePaymentModalResolver) {
                        this.triggerForOpenBeforeMakePaymentModalResolver();
                    }
                });
            return;
        }
        // 3. if none with status 'sent' OR altinnstatus 'mottatt' then find the last one with status
        for (let i = this.aMeldingerInPeriod.length - 1; i >= 0; i--) {
            const amelding = this.aMeldingerInPeriod[i];
            if (amelding.status !== null) {
                if (amelding.ID !== this.currentAMelding.ID) {
                    this._ameldingService
                        .getAMeldingWithFeedback(amelding.ID)
                        .subscribe((amldWithFeedback: AmeldingData) => {
                            this.setPeriodStatusFromAmeldingStatus(amldWithFeedback);
                            if (this.triggerForOpenBeforeMakePaymentModalResolver) {
                                this.triggerForOpenBeforeMakePaymentModalResolver();
                            }
                        });
                } else {
                    this.setPeriodStatusFromAmeldingStatus(this.currentAMelding);
                    if (this.triggerForOpenBeforeMakePaymentModalResolver) {
                        this.triggerForOpenBeforeMakePaymentModalResolver();
                    }
                }
                if (this.triggerForOpenBeforeMakePaymentModalResolver) {
                    this.triggerForOpenBeforeMakePaymentModalResolver();
                }
                return;
            }
        }
        if (this.triggerForOpenBeforeMakePaymentModalResolver) {
            this.triggerForOpenBeforeMakePaymentModalResolver();
        }
    }

    private setPeriodStatusFromAmeldingStatus(amelding: AmeldingData) {
        switch (amelding.status) {
            case 0:
            case 1:
            case null:
                this.periodStatus = 'Ikke innsendt';
                break;

            case 2:
                this.periodStatus = 'Tilbakemelding må hentes';
                break;

            case 3:
                this.periodStatus = '';
                const avvik = this._ameldingService.getAvvikIAmeldingen(amelding);
                this.setStatusFromAvvik(avvik);
                this.periodStatus = this.periodStatus === '' ? 'Avvist' : this.periodStatus;
                break;

            default:
                break;
        }
    }

    private checkForSaveDone(done) {
        if (!done) {
            return;
        }

        if (this.saveStatus.completeCount === this.saveStatus.numberOfRequests) {
            if (this.saveStatus.hasErrors) {
                done('Kunne ikke generere A-melding');
            } else {
                done('A-melding generert');
            }
        }
    }

    private updateSaveActions() {
        this.actions = [];

        this.actions.push({
            label: 'Generer A-melding',
            action: (done) => {
                this.saveStatus = {
                    numberOfRequests: 0,
                    completeCount: 0,
                    hasErrors: false,
                };
                this.openAmeldingTypeModal(done);
            },
            disabled: this.currentAMelding && this.currentAMelding.status === 2,
            main: this.currentAMelding === undefined
        });

        this.actions.push({
            label: 'Send inn',
            action: (done) => this.sendAmelding(done),
            disabled: this.currentAMelding && !this.validationErrorMessage ? (this.currentAMelding.status >= 1 ? true : false) : true,
            main: this.currentAMelding !== undefined && this.submittedDate === '' && !this.validationErrorMessage
        });

        this.actions.push({
            label: 'Hent tilbakemelding',
            action: (done) => {
                if (this.currentAMelding && this.currentAMelding.ID > 0) {
                    this.getFeedback(done);
                }
            },
            disabled: this.currentAMelding ? (this.currentAMelding.status !== 2) : true,
            main: this.submittedDate !== ''
        });
    }

    private getFeedback(done) {
        this.modalService
            .open(AltinnAuthenticationModal)
            .onClose
            .pipe(
                tap((result: AltinnAuthenticationData) => {
                    if (!!result) {
                        return;
                    }
                    done('Avbrutt, tilbakemelding ikke hentet');
                }),
                filter(auth => !!auth),
                switchMap(authData => this._ameldingService.getAmeldingFeedback(this.currentAMelding.ID, authData)),
            )
            .subscribe(
                (response: AmeldingData) => {
                    this.replaceAmeldingInPeriod(response);
                    const refreshPromise = new Promise((resolve) => {
                        this.triggerForOpenBeforeMakePaymentModalResolver = resolve;
                    });
                    this.refresh(response);
                    refreshPromise.then(() => {
                        this.openBeforeMakePaymentModal();
                        this.triggerForOpenBeforeMakePaymentModalResolver = null;
                    });
                    this.activeTabIndex = 2;
                    done('Tilbakemelding hentet');
                },
                err => this.handleAltinnError(err, done));
    }

    private openBeforeMakePaymentModal() {
        this.modalService.open(StatusAMeldingModalComponent, {
            data: {
                periodStatus: this.periodStatus,
                period: this.currentPeriod
            }
        }).onClose.subscribe(result => {
            if (result) {
                this.openMakePaymentModal();
            }
        });
    }
    private openMakePaymentModal() {
        const getSafePayDate = (currentAMelding) => {
            return (
                currentAMelding
                && currentAMelding.feedBack
                && currentAMelding.feedBack.melding
                && currentAMelding.feedBack.melding.Mottak
                && currentAMelding.feedBack.melding.Mottak.innbetalingsinformasjon
                && currentAMelding.feedBack.melding.Mottak.innbetalingsinformasjon.forfallsdato
            )
                ||
                (
                    currentAMelding
                    && currentAMelding.feedBack
                    && currentAMelding.feedBack.melding
                    && currentAMelding.feedBack.melding.Mottak
                    && currentAMelding.feedBack.melding.Mottak.length
                    && currentAMelding.feedBack.melding.Mottak[currentAMelding.feedBack.melding.Mottak.length - 1]
                    && currentAMelding.feedBack.melding.Mottak[currentAMelding.feedBack.melding.Mottak.length - 1].innbetalingsinformasjon
                    && currentAMelding.feedBack.melding.Mottak[currentAMelding.feedBack.melding.Mottak.length - 1]
                        .innbetalingsinformasjon.forfallsdato
                )
                ||
                null
                ;
        };
        this.modalService.open(MakeAmeldingPaymentModalComponent, {
            data: {
                period: this.currentPeriod,
                totalFtrekkFeedbackStr: this.totalFtrekkFeedbackStr,
                totalAGAFeedbackStr: this.totalAGAFeedBackStr,
                totalFinancialFeedbackStr: this.totalFinancialFeedbackStr,
                totalGarnishmentFeedbackStr: this.totalGarnishmentFeedbackStr,
                showFinanceTax: this.showFinanceTax,
                showGarnishment: this.showGarnishment,
                payDate: getSafePayDate(this.currentAMelding)
            }
        }).onClose.subscribe((dto: any) => {
            if (dto) {
                this._ameldingService.ActionWithBody(this.currentAMelding.ID, dto, 'pay-aga-tax', RequestMethod.Post).subscribe(x => {
                    let toastText = '';
                    if (dto.payAga || dto.payTaxDraw) {
                        toastText = `Forskuddstrekk og Arbeidsgiveravgift for periode ${this.currentPeriod} er lagt til betalingsliste. `;
                    }
                    if (dto.payFinancialTax) {
                        toastText += `Finansskatt er lagt til betalingsliste. `;
                    }
                    if (dto.payGarnishment) {
                        toastText += `Utleggstrekk er lagt til betalingsliste. `;
                    }
                    this._toastService.addToast(toastText + `Husk at utbetalingene må sendes til banken fra Bank - Utbetaling.`);
                }, (error) => this.errorService.handle(error));
            }
        });
    }

    private handleAltinnError(err, done: (message: string) => void = null) {
        this.altinnAuthService.clearAltinnPinFromLocalStorage();
        if (done) {
            done('Feilet ved henting av tilbakemelding');
        }
        const errMessage = this.errorService.extractMessage(err);
        let toastText = '';
        if (errMessage.indexOf('Incorrect username') >= 0) {
            toastText = 'Brukernavn og/eller passord er feil';
        }
        if (errMessage.indexOf('No reference found for') >= 0) {
            toastText = 'Tilbakemelding er ikke klar i altinn, prøv igjen om noen minutter';
        }

        if (toastText !== '') {
            this._toastService
                .addToast(toastText, ToastType.warn, ToastTime.long);
        } else {
            this.errorService.handle(err);
        }
    }

    private sendAmelding(done) {
        this._ameldingService.sendAMelding(this.currentAMelding.ID).subscribe((response: AmeldingData) => {
            if (response) {
                this.refresh(response);
                if (this.currentAMelding.sent) {
                    this.submittedDate = moment(this.currentAMelding.sent).format('DD.MM.YYYY HH:mm');
                }
                done('A-melding sendt inn');
            }
        }, err => {
            this.errorService.handle(err);
            const msg = err.status === 500 ? 'Sjekk Altinn innstillinger, ' : '';
            done(msg + err.statusText);
        });
    }

    private validateAMelding(ameldingSumUp: AmeldingSumUp): string {
        if (!ameldingSumUp) {
            return;
        }
        let errorMessages: string = '';
        const employmentIDs: string[] = [];

        if (
            ((ameldingSumUp.period > 9 && ameldingSumUp.year > 2019) || ameldingSumUp.year > 2020)
            && (ameldingSumUp.entities?.length > 0)
        ) {
            ameldingSumUp.entities.forEach((ameldingEntity: AmeldingEntity) => {
                if (ameldingEntity.orgNumber === ameldingSumUp.LegalEntityNo) {
                    ameldingEntity.employees.forEach((employee) => {
                        employee.arbeidsforhold.forEach(employeement => {
                            employmentIDs.push(employeement.arbeidsforholdId);
                        });
                    });
                    errorMessages = `Arbeidsforhold ${employmentIDs.join(',')} `
                        + 'er tilknyttet juridisk enhet. Avslutt dette arbeidsforholdet (sluttdato senest september 2020)'
                        + ' og send a-melding for september på nytt. Opprett deretter et nytt arbeidsforhold mot korrekt '
                        + 'virksomhet før du sender a-melding for oktober';
                }
            });
        }

        return errorMessages;
    }

    private openAmeldingTypeModal(done) {
        let anySentInAmeldingerWithStandardAmeldingType: boolean = false;

        if ((this.aMeldingerInPeriod && this.aMeldingerInPeriod.filter(x => x.type === AmeldingType.Standard)[0])
            && (this.currentSumUp && this.currentSumUp.status > InternalAmeldingStatus.GENERATED)
        ) {
            anySentInAmeldingerWithStandardAmeldingType = true;
        }

        this.modalService
            .open(AMeldingTypePickerModalComponent, {
                modalConfig: { done: done },
                data: { anySentInAmeldingerWithStandardAmeldingType: anySentInAmeldingerWithStandardAmeldingType }
            })
            .onClose
            .filter(event => event.type >= 0)
            .subscribe(event => this.createAMelding(event));
    }

    private openAdminModal() {
        this.modalService
            .open(PeriodAdminModalComponent,
                {
                    data: {
                        period: this.currentPeriod,
                        ameldingerInPeriod: this.aMeldingerInPeriod,
                        companySalary: this.companySalary,
                        activeYear: this.activeYear
                    }
                })
            .onClose
            .subscribe(hasChanges => {
                if (!hasChanges) {
                    return;
                }
                this.gotoPeriod(this.currentPeriod);
            });
    }

    private clearAMelding() {
        this.currentAMelding = undefined;
        this.currentSumUp = {};
        this.clarifiedDate = '';
        this.submittedDate = '';
        this.feedbackObtained = false;

        this.aMeldingerInPeriod = [];
        this.currentSumsInPeriod = undefined;
        this.currentSumUp = undefined;
        this.validationErrorMessage = null;
        this.totalGarnishmentSystem = 0;
        this.totalGarnishmentSystemStr = this.numberformat.asMoney(this.totalGarnishmentSystem, { decimalLength: 0 });
    }

    private spinner<T>(source: Observable<T>): Observable<T> {
        this.busy = true;
        return <Observable<T>>source.finally(() => this.busy = false);
    }
}
