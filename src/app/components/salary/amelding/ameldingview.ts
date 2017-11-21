import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {Observable} from 'rxjs/Observable';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {AmeldingData} from '../../../unientities';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {IUniSaveAction} from '../../../../framework/save/save';
import {IToolbarConfig, IToolbarSearchConfig} from '../../common/toolbar/toolbar';
import {UniStatusTrack} from '../../common/toolbar/statustrack';
import {
    PayrollrunService,
    AMeldingService,
    ErrorService,
    NumberFormat,
    SalarySumsService,
    YearService
} from '../../../services/services';
import {UniModalService} from '../../../../framework/uniModal/barrel';
import {AmeldingTypePickerModal, IAmeldingTypeEvent} from './modals/ameldingTypePickerModal';
import {AltinnAuthenticationModal} from '../../common/modals/AltinnAuthenticationModal';
import * as moment from 'moment';

@Component({
    selector: 'amelding-view',
    templateUrl: './ameldingview.html'
})

export class AMeldingView implements OnInit {
    private busy: boolean = true;
    private initialized: boolean;
    private currentPeriod: number;
    private currentMonth: string;
    private currentSumsInPeriod: any[] = [];
    private currentAMelding: any;
    private currentSumUp: any;
    private aMeldingerInPeriod: AmeldingData[];
    private contextMenuItems: IContextMenuItem[] = [];
    private actions: IUniSaveAction[];
    private clarifiedDate: string = '';
    private submittedDate: string = '';
    private feedbackObtained: boolean = false;

    private totalAGAFeedback: number = 0;
    private totalAGAFeedBackStr: string;
    private totalAGASystem: number = 0;
    private totalAGASystemStr: string;
    private totalFtrekkFeedback: number = 0;
    private totalFtrekkFeedbackStr: string;
    private totalFtrekkSystem: number = 0;
    private totalFtrekkSystemStr: string;

    private legalEntityNo: string;
    private saveStatus: {numberOfRequests: number, completeCount: number, hasErrors: boolean};
    public showView: string = '';
    private toolbarConfig: IToolbarConfig;
    private toolbarSearchConfig: IToolbarSearchConfig;
    private periodStatus: string;
    private alleAvvikStatuser: any[] = [];
    private activeYear: number;

    constructor(
        private _tabService: TabService,
        private _ameldingService: AMeldingService,
        private _toastService: ToastService,
        private _payrollService: PayrollrunService,
        private _salarySumsService: SalarySumsService,
        private yearService: YearService,
        private numberformat: NumberFormat,
        private router: Router,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {
        this._tabService.addTab({
            name: 'A-Melding',
            url: 'salary/amelding',
            moduleID: UniModules.Amelding,
            active: true
        });

        this.contextMenuItems = [
            {
                label: 'Hent a-meldingsfil',
                action: () => {
                    this.getAMeldingFile();
                },
                disabled: () => {
                    if (!this.currentAMelding) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            {
                label: 'Hent tilbakemeldingsfil',
                action: () => {
                    this.getFeedbackFile();
                },
                disabled: () => {
                    return this.currentAMelding ? (this.currentAMelding.status <= 2 ? true : false) : true;
                }
            },
            {
                label: 'Tilleggsopplysninger',
                action: () => this.router.navigate(['salary/supplements'])
            }
        ];
    }

    public ngOnInit() {
        this.loadYearData();
        this.yearService.selectedYear$.subscribe(year => {
            this.clearAMelding();
            this.loadYearData();
        });
    }

    private loadYearData() {
        this.yearService
            .selectedYear$
            .asObservable()
            .filter(year => !!year)
            .take(1)
            .do(year => this.activeYear = year)
            .switchMap(financialYear => this._payrollService.getLatestSettledPeriod(1, financialYear))
            .subscribe(
                (period) => {
                    this.currentPeriod = period;
                    this.currentMonth = moment.months()[this.currentPeriod - 1];
                    this.getSumsInPeriod();
                    this.getAMeldingForPeriod();
                    this.updateToolbar();
                },
                err => this.errorService.handle(err)
            );
    }

    public prevPeriod() {
        if (this.currentPeriod !== 1) {
            if (this.currentPeriod > 1) {
                this.currentPeriod -= 1;
                this.getSumsInPeriod();
                this.currentMonth = moment.months()[this.currentPeriod - 1];
            }
            this.clearAMelding();
            this.getAMeldingForPeriod();
        }
    }

    public nextPeriod() {
        if (this.currentPeriod !== 12) {
            if (this.currentPeriod < 12) {
                this.currentPeriod += 1;
                this.getSumsInPeriod();
                this.currentMonth = moment.months()[this.currentPeriod - 1];
            }
            this.clearAMelding();
            this.getAMeldingForPeriod();
        }
    }

    public gotoPeriod(period: number) {
        if (!isNaN(period) && (period >= 1 && period <= 12)) {
            this.currentPeriod = period;
            this.getSumsInPeriod();
            this.currentMonth = moment.months()[this.currentPeriod - 1];
            this.clearAMelding();
            this.getAMeldingForPeriod();
        }
    }

    public getAMeldingFile() {
        if (this.currentAMelding) {
            this._ameldingService.getAMeldingFile(this.currentAMelding.ID)
                .subscribe(amldfile => {
                    var a = document.createElement('a');
                    var dataURI = 'data:text/xml;base64,' + btoa(amldfile);
                    a.href = dataURI;
                    let prd: string = this.currentPeriod < 10
                        ? '0' + this.currentPeriod.toString()
                        : this.currentPeriod.toString();
                    a['download'] = `amelding_${prd}_${this.currentAMelding.ID}.xml`;

                    var e = document.createEvent('MouseEvents');
                    e.initMouseEvent(
                        'click', true, false, document.defaultView,
                        0, 0, 0, 0, 0, false, false, false, false, 0 , null
                    );

                    a.dispatchEvent(e);
                    a.remove();

                }, err => this.errorService.handle(err));
        }
    }

    public getFeedbackFile() {
        if (this.currentAMelding) {
            this._ameldingService.getAmeldingFeedbackFile(this.currentAMelding.ID)
                .subscribe(feedbackfile => {
                    var a = document.createElement('a');
                    var dataURI = 'data:text/xml;base64,' + btoa(feedbackfile);
                    a.href = dataURI;
                    let prd: string = this.currentPeriod < 10
                        ? '0' + this.currentPeriod.toString()
                        : this.currentPeriod.toString();
                    a['download'] = `tilbakemelding_${prd}_${this.currentAMelding.ID}.xml`;

                    var e = document.createEvent('MouseEvents');
                    e.initMouseEvent(
                        'click', true, false, document.defaultView,
                        0, 0, 0, 0, 0, false, false, false, false, 0 , null
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
            this.setAMelding(response);
            this.checkForSaveDone(event.done);
            this._toastService.addToast('A-melding generert', ToastType.good, 4);
        },
        (err) => {
            this.errorService.handle(err);
            this.saveStatus.completeCount++;
            this.saveStatus.hasErrors = true;
        });
    }

    public setAMelding(amelding: AmeldingData) {
        this.showView = '';
        this._ameldingService
        .getAMeldingWithFeedback(amelding.ID)
        .finally(() => this.initialized = true)
        .subscribe((ameldingAndFeedback) => {
            this.currentAMelding =  ameldingAndFeedback;
            this.getDataFromFeedback(this.currentAMelding, 0);
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
        }, err => this.errorService.handle(err));
    }

    private getSumsInPeriod() {
        this._salarySumsService
        .getSumsInPeriod(this.currentPeriod, this.currentPeriod, this.activeYear)
            .subscribe((currentSumsInPeriod) => {
                this.currentSumsInPeriod = currentSumsInPeriod;

                this.totalAGAFeedback = 0;
                this.totalFtrekkFeedback = 0;
                this.totalFtrekkFeedbackStr = this.numberformat.asMoney(this.totalFtrekkFeedback, {decimalLength: 0});
                this.totalAGAFeedBackStr = this.numberformat.asMoney(this.totalAGAFeedback, {decimalLength: 0});

                this.totalAGASystem = 0;
                this.totalFtrekkSystem = 0;

                currentSumsInPeriod.forEach(dataElement => {
                    let sums = dataElement.Sums;
                    this.totalAGASystem += dataElement.Sums.calculatedAGA;
                    this.totalFtrekkSystem += sums.tableTax + sums.percentTax + sums.manualTax;
                });

                this.totalAGASystemStr = this.numberformat.asMoney(this.totalAGASystem, {decimalLength: 0});
                this.totalFtrekkSystemStr = this.numberformat.asMoney(this.totalFtrekkSystem, {decimalLength: 0});
            }, err => this.errorService.handle(err));
    }

    private updateToolbar() {
        this.toolbarConfig = {
            title: `Periode ${this.currentPeriod}`,
            subheads: [
            {
                title: this.currentAMelding ? 'A-melding ' + this.currentAMelding.ID : null
            }],
            navigation: {
                prev: this.prevPeriod.bind(this),
                next: this.nextPeriod.bind(this)
            }
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
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = this.currentAMelding ? (this.currentAMelding.status ? this.currentAMelding.status : 1) : 0;
        this._ameldingService.internalAmeldingStatus.forEach((amldStatus, indx) => {
            let _state: UniStatusTrack.States;
            let _substatuses: UniStatusTrack.IStatus[] = [];
            if (amldStatus.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (amldStatus.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (amldStatus.Code === activeStatus) {

                if (this.currentAMelding.ID === this.aMeldingerInPeriod[this.aMeldingerInPeriod.length - 1].ID) {
                    _state = UniStatusTrack.States.Active;
                } else {
                    // If we're not on the last of the A-meldings in the period, we'll assume the data is obsolete.
                    _state = UniStatusTrack.States.Obsolete;
                }

                this.aMeldingerInPeriod.forEach(amelding => {
                    _substatuses.push({
                        title: 'A-melding ' + amelding.ID,
                        state: amelding.ID === this.currentAMelding.ID
                            ? UniStatusTrack.States.Active
                            : UniStatusTrack.States.Obsolete,
                        timestamp: amelding.UpdatedAt
                            ? new Date(<any> amelding.UpdatedAt)
                            : new Date(<any> amelding.CreatedAt),
                        data: amelding
                    });
                });

            }

            statustrack[indx] = {
                title: amldStatus.Text,
                state: _state,
                badge: (_state === UniStatusTrack.States.Active || _state === UniStatusTrack.States.Obsolete)
                    && this.aMeldingerInPeriod.length > 1 ? this.aMeldingerInPeriod.length + '' : null,
                substatusList: _substatuses
            };
        });

        return statustrack;
    }

    public setAmeldingFromEvent(event) {
        if (!event[0] || !event[0].data) { return; }
        this.setAMelding(event[0].data);
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

    private getSumUpForAmelding() {
        this._ameldingService.getAmeldingSumUp(this.currentAMelding.ID)
        .subscribe((response) => {
            this.currentSumUp = response;

            if (this.currentAMelding.ID !== this.aMeldingerInPeriod[this.aMeldingerInPeriod.length - 1].ID) {
                let statusTextObject: any = this.getDataFromFeedback(this.currentAMelding, 1);
                if (statusTextObject) {
                    this.currentSumUp._sumupStatusText = statusTextObject.statusText;
                } else {
                    this.currentSumUp._sumupStatusText = 'Status altinn';
                }
            } else {
                this.currentSumUp._sumupStatusText = this.periodStatus;
            }

            this.legalEntityNo = response.LegalEntityNo;
        }, err => this.errorService.handle(err));
    }

    private getDataFromFeedback(amelding, typeData): any {
        let mottakObject: any;
        if (amelding && amelding.hasOwnProperty('feedBack')) {
            if (amelding.feedBack !== null) {
                let alleMottak = amelding.feedBack.melding.Mottak;
                if (alleMottak instanceof Array) {
                    alleMottak.forEach(mottak => {
                        const pr = mottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop());
                        if ((period === amelding.period)
                            && (parseInt(pr.substring(0, pr.indexOf('-'))) === amelding.year)) {
                                mottakObject = this.checkMottattPeriode(mottak, typeData);
                        }
                    });
                } else {
                    if (alleMottak.hasOwnProperty('kalendermaaned')) {
                        const pr = alleMottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop());
                        if ((period === amelding.period)
                            && (parseInt(pr.substring(0, pr.indexOf('-'))) === amelding.year)) {
                                mottakObject = this.checkMottattPeriode(alleMottak, typeData);
                        }
                    }
                }
            }
        }
        return mottakObject;
    }

    private checkMottattPeriode(mottak, typeData): any {
        let anyObject: any = {};
        if (mottak && mottak.hasOwnProperty('mottattPeriode')) {
            switch (typeData) {
                case 0:
                    this.getTotalAGAAndFtrekk(mottak.mottattPeriode);
                    break;
                case 1:
                    anyObject = {statusText: this.findAndSetStatusFromFeedback(mottak.mottattPeriode)};
                    break;

                default:
                    break;
            }
        } else {
            anyObject = {statusText: 'Avvist'};
        }

        return anyObject;
    }

    private getTotalAGAAndFtrekk(mottattPeriode) {
        if (mottattPeriode && mottattPeriode.hasOwnProperty('mottattAvgiftOgTrekkTotalt')) {

            this.totalAGAFeedback = mottattPeriode.mottattAvgiftOgTrekkTotalt.sumArbeidsgiveravgift;
            this.totalAGAFeedBackStr = this.numberformat.asMoney(this.totalAGAFeedback, {decimalLength: 0});

            this.totalFtrekkFeedback = mottattPeriode.mottattAvgiftOgTrekkTotalt.sumForskuddstrekk;
            this.totalFtrekkFeedbackStr = this.numberformat.asMoney(this.totalFtrekkFeedback, {decimalLength: 0});
        }
    }

    private findAndSetStatusFromFeedback(mottattPeriode): string {
        let statusText = '';
        let statusSet: boolean = false;
        this.alleAvvikStatuser = [];

        this.getAvvikRec(mottattPeriode);

        this.alleAvvikStatuser.forEach(avvik => {
            if (!statusSet) {
                switch (avvik.alvorlighetsgrad) {
                    case 'oeyeblikkelig':
                        statusText = 'Mottatt med øyeblikkelig';
                        statusSet = true;
                        break;
                    case 'retningslinje':
                        statusText = 'Mottatt med retningslinje';
                        break;
                    case 'avvisning':
                        statusText = 'Avvisning';

                        break;

                    default:
                        break;
                }
            }
        });

        if (statusText === '') {
            statusText = 'Mottatt';
        }

        return statusText;
    }

    private getAMeldingForPeriod() {

        this.periodStatus = 'Ingen A-meldinger i perioden';

        this.spinner(this._ameldingService
            .getAMeldingForPeriod(this.currentPeriod, this.activeYear))
                .subscribe((ameldinger: AmeldingData[]) => {
                    this.aMeldingerInPeriod = ameldinger;
                    if (this.aMeldingerInPeriod.length > 0) {
                        this.setAMelding(this.aMeldingerInPeriod[this.aMeldingerInPeriod.length - 1]);
                    } else {
                        this.initialized = true;
                        this.updateToolbar();
                        this.updateSaveActions();
                    }
                }, err => this.errorService.handle(err));
    }

    private setStatusForPeriod() {

        // Only the last (highest ID) amelding for the period can set this status
        if (this.currentAMelding.ID === this.aMeldingerInPeriod[this.aMeldingerInPeriod.length - 1].ID) {

            switch (this.currentAMelding.status) {
                case 0:
                case 1:
                case null:
                    this.periodStatus = 'Ikke innsendt';
                    break;

                case 2:
                    this.periodStatus = 'Tilbakemelding må hentes';
                    break;

                case 3:
                    if (this.currentAMelding.altinnStatus !== 'avvist') {
                        let statusTextObject: any = this.getDataFromFeedback(this.currentAMelding, 1);
                        if (statusTextObject) {
                            this.periodStatus = statusTextObject.statusText;
                        }
                    } else {
                        this.periodStatus = 'Avvist';
                    }
                    break;

                default:
                    break;
            }
        }
    }

    private getAvvikRec(obj) {
        for (var propname in obj) {
            if (propname === 'avvik') {
                if (obj[propname] instanceof Array) {
                    obj[propname].forEach(avvik => {
                        if (obj.hasOwnProperty('alvorlighetsgrad')) {
                            avvik.alvorlighetsgrad = obj['alvorlighetsgrad'];
                        }
                        this.alleAvvikStatuser.push(avvik);
                    });
                } else {
                    let avvik = obj[propname];
                    if (obj.hasOwnProperty('alvorlighetsgrad')) {
                        avvik.alvorlighetsgrad = obj['alvorlighetsgrad'];
                    }
                    this.alleAvvikStatuser.push(avvik);
                }
            } else {
                if (typeof obj[propname] === 'object' && obj[propname] !== null) {
                    this.getAvvikRec(obj[propname]);
                }
            }
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
            disabled: false,
            main: this.currentAMelding === undefined
        });

        this.actions.push({
            label: 'Send inn',
            action: (done) => this.sendAmelding(done),
            disabled: this.currentAMelding ? (this.currentAMelding.status >= 1 ? true : false) : true,
            main: this.currentAMelding !== undefined && this.submittedDate === ''
        });

        this.actions.push({
            label: 'Hent tilbakemelding',
            action: (done) => {
                if (this.currentAMelding) {
                    this.getFeedback(done);
                }
            },
            disabled: this.currentAMelding ? (this.currentAMelding.status === 2 ? false : true) : true,
            main: this.submittedDate !== ''
        });
    }

    private getFeedback(done) {
        this.modalService
            .open(AltinnAuthenticationModal)
            .onClose
            .filter(auth => !!auth)
            .switchMap(authData => this._ameldingService.getAmeldingFeedback(this.currentAMelding.ID, authData))
            .subscribe((response: AmeldingData) => {
                if (response) {
                    this.setAMelding(response);
                    this.showView = 'receipt';
                    done('Tilbakemelding hentet');
                }
            }, err => this.errorService.handle(err));
    }

    private sendAmelding(done) {
        this._ameldingService.sendAMelding(this.currentAMelding.ID)
        .subscribe((response: AmeldingData) => {
            if (response) {
                this.setAMelding(response);
                if (this.currentAMelding.sent) {
                    this.submittedDate = moment(this.currentAMelding.sent).format('DD.MM.YYYY HH:mm');
                }
                done('A-melding sendt inn');
            }
        }, err => {
            this.errorService.handle(err);
            let msg = err.status === 500 ? 'Sjekk Altinn innstillinger, ' : '';
            done(msg + err.statusText);
        });
    }

    private openAmeldingTypeModal(done) {
        this.modalService
            .open(AmeldingTypePickerModal, {modalConfig: {done: done}})
            .onClose
            .filter(event => event.type >= 0)
            .subscribe(event => this.createAMelding(event));
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
    }

    private spinner<T>(source: Observable<T>): Observable<T> {
        this.busy = true;
        return <Observable<T>>source.finally(() => this.busy = false);
    }
}
